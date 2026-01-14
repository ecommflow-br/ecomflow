import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const generateProductContent = async (input, fileData) => {
    // Preferência: Verifica OpenAI primeiro
    const openAiKey = localStorage.getItem("openai_api_key");
    const geminiKey = localStorage.getItem("gemini_api_key");

    if (openAiKey) {
        return await generateWithOpenAI(openAiKey, input, fileData);
    } else if (geminiKey) {
        return await generateWithGemini(geminiKey, input, fileData);
    } else {
        throw new Error("Nenhuma chave de API encontrada. Por favor, configure OpenAI ou Gemini nas configurações.");
    }
};

// Helper function to sanitise JSON strings
const cleanJsonString = (str) => {
    if (!str) return "{}";
    // Remove Markdown styling (```json ... ```)
    let clean = str.replace(/```json\s*|\s*```/g, "").trim();

    // Fix common control character issues (newlines inside strings)
    // This regex looks for newlines that are NOT followed by a control char context
    // A simple approach is to remove actual newlines if they break the JSON, 
    // or better, replacing them with \n literals if they are within strings.
    // For safety, we will just use a robust regex to strip control chars that aren't valid.
    clean = clean.replace(/[\u0000-\u001F]+/g, (match) => {
        // Allow valid whitespace like \n, \r, \t if properly escaped, but here we are talking about RAW control codes 
        // in the string literal which JSON.parse hates.
        switch (match) {
            case "\b": return "\\b";
            case "\f": return "\\f";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\t": return "\\t";
            default: return "";
        }
    });
    return clean;
};

const parseAIResponse = (rawText) => {
    try {
        const cleaned = cleanJsonString(rawText);
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("JSON Parse Error:", error);
        console.log("Raw Text was:", rawText);

        // Fallback: Try to find the JSON object via brackets if the regex failed
        try {
            const match = rawText.match(/\{[\s\S]*\}/);
            if (match) {
                return JSON.parse(match[0]);
            }
        } catch (e) {
            // Ultimate failure
            throw new Error("A IA gerou uma resposta inválida. Tente novamente.");
        }
        throw new Error("Falha ao processar o formato JSON da IA.");
    }
};

const generateWithOpenAI = async (apiKey, input, fileData) => {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const messages = [
        {
            role: "system",
            content: "Você é um especialista em E-commerce. Responda APENAS com um JSON válido."
        },
        {
            role: "user",
            content: [
                { type: "text", text: `Analise este produto e gere o JSON: ${input}` },
                fileData ? { type: "image_url", image_url: { url: fileData } } : null
            ].filter(Boolean)
        }
    ];

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error("Erro na OpenAI: " + (error.message || "Verifique sua chave e créditos."));
    }
};

const generateWithGemini = async (apiKey, input, fileData) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    // User Discovery: 'gemini-2.5-flash' works with their specific key!
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Aja como um especialista em e-commerce brasileiro. Com base na descrição ou imagem fornecida:
    "${input}"
    
    Gere um JSON com os seguintes campos (em português):
    - title: Um título atraente e otimizado para SEO.
    - description: Uma descrição detalhada e vendedora com bullet points.
    - sizeTable: Uma tabela de tamanhos sugerida (ex: P, M, G ou dimensões).
    - extraDetails: Informações de cuidados, material ou dicas de uso.

    RETORNE APENAS O JSON, SEM FORMATAÇÃO DE MARKDOWN.
    `;

    try {
        let result;
        if (fileData) {
            const mimeType = fileData.match(/^data:([^;]+);/)?.[1] || "image/jpeg";
            const base64Data = fileData.split(',')[1];

            result = await model.generateContent([
                prompt,
                { inlineData: { data: base64Data, mimeType: mimeType } }
            ]);
        } else {
            result = await model.generateContent(prompt);
        }

        const response = await result.response;
        const text = response.text();

        return parseAIResponse(text);
    } catch (error) {
        console.error("Gemini API Error:", error);
        if (error.message?.includes("429")) throw new Error("Cota do Gemini excedida. Tente usar a OpenAI nas configurações.");
        throw error;
    }
};
