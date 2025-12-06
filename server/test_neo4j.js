const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const testNeo4j = async () => {
    const session = driver.session();
    try {
        console.log('Testing Neo4j connection...');
        const result = await session.run('RETURN 1 as n');
        console.log('Connection success:', result.records[0].get('n').toNumber());

        console.log('Creating test node...');
        await session.run('CREATE (t:TestNode {id: 1, name: "Test"}) RETURN t');
        console.log('Test node created.');

        console.log('Deleting test node...');
        await session.run('MATCH (t:TestNode {id: 1}) DELETE t');
        console.log('Test node deleted.');

    } catch (error) {
        console.error('Neo4j Error:', error);
    } finally {
        await session.close();
        await driver.close();
    }
};

testNeo4j();
