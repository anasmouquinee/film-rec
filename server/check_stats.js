const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const checkStats = async () => {
    const session = driver.session();
    try {
        const userCount = await session.run('MATCH (u:User) RETURN count(u) as count');
        const filmCount = await session.run('MATCH (f:Film) RETURN count(f) as count');
        console.log(`Users: ${userCount.records[0].get('count').low}`);
        console.log(`Films: ${filmCount.records[0].get('count').low}`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await session.close();
        await driver.close();
    }
};

checkStats();
