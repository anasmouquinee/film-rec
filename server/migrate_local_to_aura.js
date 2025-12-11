const neo4j = require('neo4j-driver');
require('dotenv').config();

// 1. Local Database Config (Source)
// Using credentials found in the original .env file
const LOCAL_URI = 'neo4j://127.0.0.1:7687';
const LOCAL_USER = 'neo4j';
const LOCAL_PASSWORD = 'anaskaelar';

// 2. Aura Database Config (Target)
// Using the current .env file
const AURA_URI = process.env.NEO4J_URI;
const AURA_USER = process.env.NEO4J_USER;
const AURA_PASSWORD = process.env.NEO4J_PASSWORD;

const localDriver = neo4j.driver(LOCAL_URI, neo4j.auth.basic(LOCAL_USER, LOCAL_PASSWORD));
const auraDriver = neo4j.driver(AURA_URI, neo4j.auth.basic(AURA_USER, AURA_PASSWORD));

const migrate = async () => {
    // Verify Connectivity
    try {
        await localDriver.verifyConnectivity();
        console.log('✅ Connected to LOCAL');
    } catch (e) {
        console.error('❌ FAILED to connect to LOCAL:', e.message);
        process.exit(1);
    }

    try {
        await auraDriver.verifyConnectivity();
        console.log('✅ Connected to AURA');
    } catch (e) {
        console.error('❌ FAILED to connect to AURA:', e.message);
        process.exit(1);
    }

    const localSession = localDriver.session();
    const auraSession = auraDriver.session();

    try {
        console.log('--- Starting Migration ---');
        console.log(`From (Local): ${LOCAL_URI}`);
        console.log(`To   (Aura): ${AURA_URI.substring(0, 20)}...`);

        // --- 1. Migrate Users ---
        console.log('Migrating Users...');
        let users;
        try {
            users = await localSession.run('MATCH (u:User) RETURN u');
        } catch (e) {
            console.error('❌ FAILED to READ Users from LOCAL:', e.message, e.code);
            throw e;
        }

        let userCount = 0;
        for (const record of users.records) {
            const u = record.get('u').properties;
            try {
                await auraSession.run(`
                    MERGE (u:User {id: $id})
                    SET u.username = $username,
                        u.password = $password
                `, {
                    id: u.id,
                    username: u.username || '',
                    password: u.password || ''
                });
            } catch (e) {
                console.error(`❌ FAILED to WRITE User ${u.username} to AURA:`, e.message, e.code);
                // Continue despite single user failure? Maybe not.
                throw e;
            }
            userCount++;
        }
        console.log(`Migrated ${userCount} Users.`);

        // --- 2. Migrate Films that Users Like ---
        // (We assume seeded films might check coverage, but let's ensure all user films exist)
        console.log('Migrating Liked Films...');
        const likedFilms = await localSession.run('MATCH (u:User)-[:LIKES]->(f:Film) RETURN f');
        let filmCount = 0;
        for (const record of likedFilms.records) {
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
        console.log(`Ensured ${filmCount} Liked Films exist.`);

        // --- 3. Migrate LIKES Relationships ---
        console.log('Migrating LIKES relationships...');
        const likes = await localSession.run('MATCH (u:User)-[:LIKES]->(f:Film) RETURN u.id as authorizedUserId, f.id as movieId');
        let likeCount = 0;
        for (const record of likes.records) {
            const userId = record.get('authorizedUserId');
            const movieId = record.get('movieId');

            await auraSession.run(`
                MATCH (u:User {id: $userId})
                MATCH (f:Film {id: $movieId})
                MERGE (u)-[:LIKES]->(f)
            `, { userId, movieId });
            likeCount++;
        }
        console.log(`Migrated ${likeCount} LIKES relationships.`);

        // --- 4. Migrate LIKES_GENRE Relationships ---
        console.log('Migrating Genre Preferences...');
        // First ensure genres exist (basic set) - usually 19 genres from TMDB
        // We'll just copy the link if genres exist in Aura (which they should from seeding)
        // Or we MERGE the genre just in case
        const userGenres = await localSession.run('MATCH (u:User)-[:LIKES_GENRE]->(g:Genre) RETURN u.id as userId, g.id as genreId, g.name as genreName');
        let genreCount = 0;
        for (const record of userGenres.records) {
            const userId = record.get('userId');
            const genreId = record.get('genreId');
            const genreName = record.get('genreName');

            await auraSession.run(`
                MATCH (u:User {id: $userId})
                MERGE (g:Genre {id: $genreId})
                SET g.name = $genreName
                MERGE (u)-[:LIKES_GENRE]->(g)
            `, { userId, genreId, genreName });
            genreCount++;
        }
        console.log(`Migrated ${genreCount} Genre preferences.`);

        console.log('--- Migration Complete ---');

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
