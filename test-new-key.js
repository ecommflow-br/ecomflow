import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyAv5MS6uWwRlRBpZmOqEo9ORyqWIOLsHew";
const genAI = new GoogleGenerativeAI(apiKey);

async function testKey() {
    console.log("Testing new API Key...");

    // Test 1: Gemini 1.5 Flash (Standard)
    console.log("\n--- Testing gemini-1.5-flash ---");
    try {
        const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result1 = await model1.generateContent("Hello! Verify this key works.");
        console.log("SUCCESS ✅ (1.5 Flash):", result1.response.text());
    } catch (e) {
        console.log("FAILED ❌ (1.5 Flash):", e.message);
    }

    // Test 2: Gemini 2.0 Flash Exp (Bleeding Edge - '2.5')
    console.log("\n--- Testing gemini-2.0-flash-exp ---");
    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result2 = await model2.generateContent("Hello! Verify this key works.");
        console.log("SUCCESS ✅ (2.0 Flash Exp):", result2.response.text());
    } catch (e) {
        console.log("FAILED ❌ (2.0 Flash Exp):", e.message.split('[')[0]); // Shorten error
    }
}

testKey();
