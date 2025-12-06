const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const countMovies = async () => {
    const session = driver.session();
    try {
        const result = await session.run('MATCH (m:Film) RETURN count(m) as count');
        console.log('Total movies:', result.records[0].get('count').toNumber());

        const result2 = await session.run('MATCH (m:Film) RETURN m.title LIMIT 5');
        console.log('First 5 titles:');
        result2.records.forEach(r => console.log(r.get('m.title')));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await session.close();
        await driver.close();
    }
};

countMovies();
