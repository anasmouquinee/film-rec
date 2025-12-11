const neo4j = require('neo4j-driver');
require('dotenv').config();

const LOCAL_URI = 'neo4j://127.0.0.1:7687';
const LOCAL_USER = 'neo4j';
const LOCAL_PASSWORD = 'anaskaelar';

const AURA_URI = process.env.NEO4J_URI;
const AURA_USER = process.env.NEO4J_USER;
const AURA_PASSWORD = process.env.NEO4J_PASSWORD;

const localDriver = neo4j.driver(LOCAL_URI, neo4j.auth.basic(LOCAL_USER, LOCAL_PASSWORD));
const auraDriver = neo4j.driver(AURA_URI, neo4j.auth.basic(AURA_USER, AURA_PASSWORD));

const migrate = async () => {
    const localSession = localDriver.session();
    const auraSession = auraDriver.session();

    try {
        console.log('--- Starting FULL Migration ---');
        console.log(`From (Local): ${LOCAL_URI}`);
        console.log(`To   (Aura): ${AURA_URI.substring(0, 20)}...`);

        // --- 1. Migrate ALL Genres ---
        console.log('Migrating ALL Genres...');
        const genres = await localSession.run('MATCH (g:Genre) RETURN g');
        let genreCount = 0;
        for (const record of genres.records) {
            const g = record.get('g').properties;
            await auraSession.run(`
                MERGE (g:Genre {id: $id})
                SET g.name = $name
            `, { id: g.id, name: g.name || '' });
            genreCount++;
        }
        console.log(`Migrated ${genreCount} Genres.`);

        // --- 2. Migrate ALL Films ---
        console.log('Migrating ALL Films...');
        const films = await localSession.run('MATCH (f:Film) RETURN f');
        let filmCount = 0;
        for (const record of films.records) {
            const f = record.get('f').properties;
            await auraSession.run(`
                MERGE (f:Film {id: $id})
                SET f.title = $title,
                    f.poster_path = $poster_path,
                    f.vote_average = $vote_average,
                    f.overview = $overview,
                    f.release_date = $release_date
            `, {
                id: f.id,
                title: f.title || '',
                poster_path: f.poster_path || '',
                vote_average: f.vote_average || 0,
                overview: f.overview || '',
                release_date: f.release_date || ''
            });
            filmCount++;
        }
        console.log(`Migrated ${filmCount} Films.`);

        // --- 3. Migrate Film-Genre Relationships (BELONGS_TO) ---
        console.log('Migrating Film-Genre Relationships...');
        const fgRels = await localSession.run('MATCH (f:Film)-[:BELONGS_TO]->(g:Genre) RETURN f.id as filmId, g.id as genreId');
        let fgCount = 0;
        for (const record of fgRels.records) {
            await auraSession.run(`
                MATCH (f:Film {id: $filmId})
                MATCH (g:Genre {id: $genreId})
                MERGE (f)-[:BELONGS_TO]->(g)
            `, { filmId: record.get('filmId'), genreId: record.get('genreId') });
            fgCount++;
        }
        console.log(`Migrated ${fgCount} BELONGS_TO relationships.`);

        // --- 4. Migrate Users ---
        console.log('Migrating Users...');
        const users = await localSession.run('MATCH (u:User) RETURN u');
        let userCount = 0;
        for (const record of users.records) {
            const u = record.get('u').properties;
            await auraSession.run(`
                MERGE (u:User {id: $id})
                SET u.username = $username,
                    u.password = $password
            `, {
                id: u.id,
                username: u.username || '',
                password: u.password || ''
            });
            userCount++;
        }
        console.log(`Migrated ${userCount} Users.`);

        // --- 5. Migrate User Likes (LIKES) ---
        console.log('Migrating User Likes...');
        const likes = await localSession.run('MATCH (u:User)-[:LIKES]->(f:Film) RETURN u.id as userId, f.id as filmId');
        let likeCount = 0;
        for (const record of likes.records) {
            await auraSession.run(`
                MATCH (u:User {id: $userId})
                MATCH (f:Film {id: $filmId})
                MERGE (u)-[:LIKES]->(f)
            `, { userId: record.get('userId'), filmId: record.get('filmId') });
            likeCount++;
        }
        console.log(`Migrated ${likeCount} LIKES relationships.`);

        // --- 6. Migrate User Genre Likes (LIKES_GENRE) ---
        console.log('Migrating User Genre Preferences...');
        const genreLikes = await localSession.run('MATCH (u:User)-[:LIKES_GENRE]->(g:Genre) RETURN u.id as userId, g.id as genreId');
        let glCount = 0;
        for (const record of genreLikes.records) {
            await auraSession.run(`
                MATCH (u:User {id: $userId})
                MATCH (g:Genre {id: $genreId})
                MERGE (u)-[:LIKES_GENRE]->(g)
            `, { userId: record.get('userId'), genreId: record.get('genreId') });
            glCount++;
        }
        console.log(`Migrated ${glCount} LIKES_GENRE relationships.`);

        console.log('--- FULL Migration Complete ---');

    } catch (error) {
        console.error('Migration Failed:', error);
    } finally {
        await localSession.close();
        await auraSession.close();
        await localDriver.close();
        await auraDriver.close();
    }
};

migrate();
