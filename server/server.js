const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Neo4j Driver
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Verify Connection
const verifyConnection = async () => {
  try {
    await driver.verifyConnectivity();
    console.log('Connected to Neo4j');
  } catch (error) {
    console.error('Neo4j connection failed:', error);
  }
};
verifyConnection();

// Routes

// Get all movies (limit 50 for now)
app.get('/api/movies', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (m:Film)
      RETURN m
      LIMIT 50
    `);
    const movies = result.records.map(record => record.get('m').properties);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Save User Preference (Like a movie) - Lazy Ingestion
app.post('/api/user/preference', async (req, res) => {
  const { userId, movie } = req.body;
  const session = driver.session();
  try {
    // 1. Ensure Movie exists (Lazy Ingestion)
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

    // 2. Link Genres
    if (movie.genre_ids) {
      for (const genreId of movie.genre_ids) {
        await session.run(`
          MERGE (g:Genre {id: $genreId})
          MATCH (m:Film {id: $movieId})
          MERGE (m)-[:BELONGS_TO]->(g)
        `, { genreId, movieId: movie.id });
      }
    }

    // 3. Create LIKE relationship
    await session.run(`
      MERGE (u:User {id: $userId})
      MATCH (m:Film {id: $movieId})
      MERGE (u)-[:LIKES]->(m)
    `, { userId, movieId: movie.id });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  const session = driver.session();
  try {
    // Check if user exists
    const check = await session.run(`MATCH (u:User {username: $username}) RETURN u`, { username });
    if (check.records.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create User
    const userId = require('crypto').randomUUID();
    await session.run(`
      CREATE (u:User {id: $userId, username: $username, password: $password})
      RETURN u
    `, { userId, username, password });

    res.json({ success: true, message: 'User registered', userId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (u:User {username: $username, password: $password})
      RETURN u
    `, { username, password });

    if (result.records.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.records[0].get('u').properties;
    res.json({ success: true, userId: user.id, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Get Genres
app.get('/api/genres', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`MATCH (g:Genre) RETURN g ORDER BY g.name`);
    const genres = result.records.map(record => record.get('g').properties);
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Save User Genres
app.post('/api/user/genres', async (req, res) => {
  const { userId, genreIds } = req.body;
  const session = driver.session();
  try {
    for (const genreId of genreIds) {
      await session.run(`
        MATCH (u:User {id: $userId})
        MATCH (g:Genre {id: $genreId})
        MERGE (u)-[:LIKES_GENRE]->(g)
      `, { userId, genreId });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Get Recommendations
app.get('/api/recommendations/:userId', async (req, res) => {
  const { userId } = req.params;
  const session = driver.session();
  try {
    // 1. Content-based: Movies similar to what user likes (via shared genres)
    // 2. Genre-based: Movies in genres the user explicitly selected
    const result = await session.run(`
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[:LIKES]->(m:Film)-[:BELONGS_TO]->(g:Genre)<-[:BELONGS_TO]-(rec:Film)
      WHERE NOT (u)-[:LIKES]->(rec)
      WITH rec, count(g) AS score
      ORDER BY score DESC
      LIMIT 10
      RETURN rec
      UNION
      MATCH (u:User {id: $userId})-[:LIKES_GENRE]->(g:Genre)<-[:BELONGS_TO]-(rec:Film)
      WHERE NOT (u)-[:LIKES]->(rec)
      RETURN rec
      LIMIT 10
    `, { userId });

    const recommendations = result.records.map(record => record.get('rec').properties);
    // Remove duplicates if any (UNION does this, but just in case of complex returns)
    const uniqueRecs = [...new Map(recommendations.map(item => [item.id, item])).values()];

    res.json(uniqueRecs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Search Movies (TMDB Proxy)
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(q)}&page=1&include_adult=false`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.results || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
