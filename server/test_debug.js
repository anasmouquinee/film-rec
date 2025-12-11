const neo4j = require('neo4j-driver');
require('dotenv').config();

const LOCAL_URI = 'neo4j://127.0.0.1:7687';
const LOCAL_USER = 'neo4j';
const LOCAL_PASSWORD = 'anaskaelar';

async function test() {
    console.log('--- Debugging Local ---');
    const localDriver = neo4j.driver(LOCAL_URI, neo4j.auth.basic(LOCAL_USER, LOCAL_PASSWORD));
    try {
        await localDriver.verifyConnectivity();
        console.log('Local Connection OK');
        const session = localDriver.session();
        const res = await session.run('MATCH (n) RETURN count(n) as count');
        console.log('Local Count:', res.records[0].get('count').low);
        await session.close();
    } catch (e) {
        console.error('Local Failed:', e); // Print full error object
    } finally {
        await localDriver.close();
    }

    console.log('--- Debugging Aura ---');
    const AURA_URI = process.env.NEO4J_URI;
    const AURA_USER = process.env.NEO4J_USER;
    const AURA_PASSWORD = process.env.NEO4J_PASSWORD;
    console.log('Aura URI:', AURA_URI);

    if (!AURA_URI) {
        console.error('Aura URI is undefined!');
        return;
    }

    const auraDriver = neo4j.driver(AURA_URI, neo4j.auth.basic(AURA_USER, AURA_PASSWORD));
    try {
        await auraDriver.verifyConnectivity();
        console.log('Aura Connection OK');
        const session = auraDriver.session();
        const res = await session.run('MATCH (n) RETURN count(n) as count');
        console.log('Aura Count:', res.records[0].get('count').low);
        await session.close();
    } catch (e) {
        console.error('Aura Failed:', e);
    } finally {
        await auraDriver.close();
    }
}

test();
