import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyDeI0uUqDRMLMmQrNhJ6D4REXhEmnZ6JpQ";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    console.log("Listing available models...");
    try {
        // Accessing the model listing via the internal client is tricky in the SDK, 
        // trying a simple generation with a fallback model often used: 'gemini-pro'

        // Let's try to generate with gemini-2.0-flash-exp (maybe they are on experimental?)
        // Or actually, let's try 'gemini-1.0-pro' to see if it's an old key issue.

        console.log("Trying gemini-1.5-flash-latest...");
        const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        await model1.generateContent("Hi");
        console.log("Success with gemini-1.5-flash-latest!");
        return;

    } catch (e) {
        console.log("Failed gemini-1.5-flash-latest. Trying gemini-pro...");
    }

    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        await model2.generateContent("Hi");
        console.log("Success with gemini-pro!");
    } catch (e) {
        console.error("All attempts failed. Key might be invalid or region locked.");
        console.error("Last Error:", e.message);
    }
}

listModels();
