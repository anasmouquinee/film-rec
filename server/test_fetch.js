require('dotenv').config();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const testFetch = async () => {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
    console.log(`Testing URL: ${url}`);
    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`Success! Found ${data.results.length} movies.`);
            console.log('First movie:', data.results[0].title);
        } else {
            console.error('Fetch failed:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

testFetch();
