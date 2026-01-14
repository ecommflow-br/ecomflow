import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateProductContent = async (input, fileData) => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) throw new Error("API Key não encontrada. Configure nas configurações.");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Upgrade: Utilizando gemini-2.0-flash conforme solicitado (Melhor performance e suporte)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
            result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: fileData.split(',')[1],
                        mimeType: "image/jpeg"
                    }
                }
            ]);
        } else {
            result = await model.generateContent(prompt);
        }

        const response = await result.response;
        const text = response.text();
        return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (error) {
        console.error("Gemini API Error Detail:", error);
        if (error.message.includes("404")) {
            throw new Error("Erro 404: O modelo Gemini 1.5 Flash não foi encontrado. Verifique se sua chave API tem acesso a este modelo no Google AI Studio.");
        }
        throw error;
    }
};
