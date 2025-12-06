const neo4j = require('neo4j-driver');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const fetchMovies = async () => {
    let allMovies = [];
    for (let page = 1; page <= 5; page++) {
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.results) {
                allMovies = [...allMovies, ...data.results];
            }
        } catch (error) {
            console.error(`Failed to fetch page ${page}:`, error);
        }
    }
    return allMovies;
};

const populate = async () => {
    const session = driver.session();
    try {
        console.log('Fetching movies from TMDB...');
        const movies = await fetchMovies();
        console.log(`Fetched ${movies.length} movies.`);

        for (const movie of movies) {
            try {
                // Create Film
                await session.run(`
          MERGE (m:Film {id: $id})
          SET m.title = $title, 
              m.overview = $overview, 
              m.poster_path = $poster_path, 
              m.release_date = $release_date,
              m.vote_average = $vote_average
        `, {
                    id: movie.id,
                    title: movie.title || '',
                    overview: movie.overview || '',
                    poster_path: movie.poster_path || '',
                    release_date: movie.release_date || '',
                    vote_average: movie.vote_average || 0
                });

                // Create Genres and Relationships
                if (movie.genre_ids) {
                    for (const genreId of movie.genre_ids) {
                        await session.run(`
              MERGE (g:Genre {id: $genreId})
              WITH g
              MATCH (m:Film {id: $movieId})
              MERGE (m)-[:BELONGS_TO]->(g)
            `, { genreId, movieId: movie.id });
                    }
                }
                console.log(`Processed: ${movie.title}`);
            } catch (err) {
                console.error(`Failed to process movie ${movie.title}:`, err.message);
            }
        }
        console.log('Data population complete.');
    } catch (error) {
        console.error('Global error:', error);
    } finally {
        await session.close();
        await driver.close();
    }
};

populate();
