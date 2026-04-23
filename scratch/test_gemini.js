const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Using Key:", key ? "Key Present" : "Key Missing");
  
  if (!key) return;

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  try {
    console.log("Starting generation...");
    const result = await model.generateContent("List 3 prestigious student competitions in 2026. Return as JSON array.");
    const response = await result.response;
    const text = response.text();
    console.log("Success! Response:");
    console.log(text);
  } catch (error) {
    console.error("Gemini Error:", error.message);
    if (error.message.includes("model not found")) {
      console.log("Trying 'gemini-pro' instead...");
      try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result2 = await model2.generateContent("Hello");
        const response2 = await result2.response;
        console.log("gemini-pro works!");
      } catch (e2) {
        console.error("gemini-pro also failed:", e2.message);
      }
    }
  }
}

testGemini();
