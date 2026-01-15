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
    const toneInst = getToneInstruction(tone);

    // Lista exaustiva incluindo a versão citada pelo usuário e variações comuns
    const modelsToTry = [
        "gemini-2.5-flash", // Nome citado pelo usuário (se existir no tier dele)
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest"
    ];

    const prompt = `
    Aja como um especialista em e-commerce brasileiro. ${toneInst}
    Analise a descrição ou imagem do produto: "${input}"
    
    Gere um JSON LIMPO (SEM EMOJIS, TOTALMENTE EM PORTUGUÊS) com:
    - title: Título nacional otimizado para SEO.
    - description: Descrição vendedora completa com bullets técnicos.
    - sizeTable: Tabela de medidas sugerida.
    - extraDetails: Objeto com "Dicas", "Observações", "Conteúdo da Embalagem".

    IMPORTANTE: Retorne APENAS o JSON. Sem textos explicativos.
    `;

    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Tentando Gemini Modelo: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
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
            lastError = error;
            console.warn(`Falha no modelo ${modelName}:`, error.message);

            // Se for erro de quota ou chave bloqueada, para por aqui
            if (error.message?.includes("429") || error.message?.includes("403")) {
                throw error;
            }
            // Continua para o próximo modelo se for 404
        }
    }

    throw new Error(`Falha Total: Nenhum modelo (incluindo o 2.5/2.0/1.5) foi encontrado. Mensagem do Google: ${lastError?.message || "Desconhecida"}`);
};
