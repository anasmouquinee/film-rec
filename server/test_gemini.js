const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    const key = 'AIzaSyApJJuR5qfDOn7n7rTxS1nmwkbtkep07Mg';
    console.log('Testing with gemini-2.5-flash...');

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    try {
        const result = await model.generateContent('Say hello in one word');
        console.log('SUCCESS! Response:', result.response.text());
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

test();
