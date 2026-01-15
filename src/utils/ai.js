import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const generateProductContent = async (input, fileData, tone = 'standard') => {
    const openAiKey = localStorage.getItem("openai_api_key")?.trim();
    const geminiKey = localStorage.getItem("gemini_api_key")?.trim();

    if (openAiKey) {
        return await generateWithOpenAI(openAiKey, input, fileData, tone);
    } else if (geminiKey) {
        return await generateWithGemini(geminiKey, input, fileData, tone);
    } else {
        throw new Error("Nenhuma chave de API encontrada. Por favor, configure OpenAI ou Gemini nas configurações.");
    }
};

const getToneInstruction = (tone) => {
    switch (tone) {
        case 'sales': return "TOM DE VOZ: Agressivo, persuasivo, focado em gatilhos mentais (escassez, urgência). Use palavras de poder.";
        case 'luxury': return "TOM DE VOZ: Sofisticado, elegante, minimalista. Use adjetivos de alto padrão (exclusivo, premium, refinado).";
        case 'fun': return "TOM DE VOZ: Descontraído, jovem, divertido. Pode usar gírias leves (se apropriado) e conectar com Gen Z.";
        case 'seo': return "TOM DE VOZ: Técnico, frio e extremamente focado em palavras-chave e densidade de keywords.";
        default: return "TOM DE VOZ: Profissional, equilibrado e informativo (Padrão E-commerce).";
    }
};

const cleanJsonString = (str) => {
    if (!str) return "{}";
    let clean = str.replace(/```json\s*|\s*```/g, "").trim();
    clean = clean.replace(/[\u0000-\u001F]+/g, (match) => {
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
        try {
            const match = rawText.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
        } catch (e) { }
        throw new Error("A IA gerou uma resposta inválida. Tente novamente.");
    }
};

const generateWithOpenAI = async (apiKey, input, fileData, tone) => {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const toneInst = getToneInstruction(tone);

    const messages = [
        {
            role: "system",
            content: `Você é um especialista em E-commerce brasileiro. Responda APENAS com um JSON válido em português. IMPORTANTE: NÃO USE EMOJIS. ${toneInst}`
        },
        {
            role: "user",
            content: [
                {
                    type: "text", text: `Analise este produto e gere um JSON seguindo este padrão:
            {
                "title": "Título SEO Otimizado",
                "description": "Descrição persuasiva em bullets",
                "sizeTable": "Tabela de medidas",
                "extraDetails": {
                    "observations": "Dicas de uso",
                    "packaging": "O que vem na caixa",
                    "shipping": "Prazo estimado"
                }
            }
            Produto: ${input}`
                },
                fileData ? { type: "image_url", image_url: { url: fileData } } : null
            ].filter(Boolean)
        }
    ];

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            max_tokens: 1200,
            response_format: { type: "json_object" }
        });

        return parseAIResponse(response.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error("Erro na OpenAI: " + (error.message || "Verifique sua chave."));
    }
};

const generateWithGemini = async (apiKey, input, fileData, tone) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const toneInst = getToneInstruction(tone);

    const prompt = `
    Aja como um especialista em e-commerce brasileiro. ${toneInst}
    Analise a descrição ou imagem do produto: "${input}"
    
    Gere um JSON LIMPO (SEM EMOJIS, TOTALMENTE EM PORTUGUÊS) com:
    - title: Título otimizado para SEO nacional.
    - description: Descrição vendedora completa com bullets técnicos.
    - sizeTable: Tabela de medidas sugerida.
    - extraDetails: Objeto com "Dicas", "Observações", "Conteúdo da Embalagem".

    IMPORTANTE: Retorne APENAS o JSON. Sem textos antes ou depois.
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
        return parseAIResponse(response.text());
    } catch (error) {
        console.error("Gemini API Error:", error);
        if (error.message?.includes("429")) throw new Error("Cota do Gemini excedida. Tente novamente em 1-2 minutos ou use OpenAI.");
        if (error.message?.includes("403")) throw new Error("Chave Gemini INVÁLIDA ou bloqueada por segurança. Verifique no AI Studio.");
        throw error;
    }
};
