import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateProductContent = async (input, fileData) => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) throw new Error("API Key não encontrada. Configure nas configurações.");

    const genAI = new GoogleGenerativeAI(apiKey);

    // Naming: Usando o nome base 'gemini-1.5-flash' para maior compatibilidade entre contas.
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
            // Extract mimeType from data URL (e.g., data:image/png;base64,...)
            const mimeType = fileData.match(/^data:([^;]+);/)?.[1] || "image/jpeg";
            const base64Data = fileData.split(',')[1];

            result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
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

        const errorMessage = error.message || "";

        if (errorMessage.includes("429")) {
            throw new Error("Limite de Cota Excedido (429): Você atingiu o limite de requisições gratuitas. Aguarde alguns minutos ou use uma chave API diferente no Google AI Studio.");
        }

        if (errorMessage.includes("404")) {
            throw new Error("Erro 404: O modelo Gemini não foi encontrado ou não está disponível para sua chave. Verifique as permissões de modelo no Google AI Studio.");
        }

        if (errorMessage.includes("API key not valid")) {
            throw new Error("Chave API Inválida: Verifique se a chave inserida nas configurações está correta.");
        }

        throw error;
    }
};
