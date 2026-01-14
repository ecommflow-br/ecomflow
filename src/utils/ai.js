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

const generateWithOpenAI = async (apiKey, input, fileData) => {
    const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

    const messages = [
        {
            role: "system",
            content: `Aja como um especialista em e-commerce brasileiro. Gere um JSON (sem markdown) com: title, description (com bullets), sizeTable (sugestão), extraDetails (cuidados/material).`
        },
        {
            role: "user",
            content: [
                { type: "text", text: input || "Descreva este produto para venda." },
            ],
        }
    ];

    if (fileData) {
        // OpenAI expects base64 data URL directly
        messages[1].content.push({
            type: "image_url",
            image_url: {
                url: fileData,
                detail: "high"
            }
        });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (error) {
        console.error("Gemini API Error:", error);
        if (error.message?.includes("429")) throw new Error("Cota do Gemini excedida. Tente usar a OpenAI nas configurações.");
        throw error;
    }
};
