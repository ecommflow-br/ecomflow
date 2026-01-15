import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const generateProductContent = async (input, fileData, tone = 'standard') => {
    // Preferência: Verifica OpenAI primeiro
    const openAiKey = localStorage.getItem("openai_api_key");
    const geminiKey = localStorage.getItem("gemini_api_key");

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

// ... cleanJsonString and parseAIResponse remain same ...

const generateWithOpenAI = async (apiKey, input, fileData, tone) => {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const toneInst = getToneInstruction(tone);

    const messages = [
        {
            role: "system",
            content: `Você é um especialista em E-commerce. Responda APENAS com um JSON válido. IMPORTANTE: NÃO USE EMOJIS. ${toneInst}`
        },
        // ... rest of prompt

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
                content: "Você é um especialista em E-commerce. Responda APENAS com um JSON válido. IMPORTANTE: NÃO USE EMOJIS. Use uma linguagem profissional, técnica e persuasiva."
            },
            {
                role: "user",
                content: [
                    {
                        type: "text", text: `Analise este produto e gere um JSON seguindo este padrão (sem emojis):
                {
                    "title": "Título SEO Otimizado (ex: Vestido Longo...)",
                    "description": "Texto persuasivo de venda + Lista de Características (Tecido, Modelo, Detalhes)",
                    "sizeTable": "Tabela de medidas sugerida (P/M/G ou cm)",
                    "extraDetails": {
                        "observations": "Observações Importantes (ex: variação de cor)",
                        "packaging": "Conteúdo da Embalagem",
                        "shipping": "Informações de Envio"
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
                max_tokens: 1000,
                response_format: { type: "json_object" }
            });

            return parseAIResponse(response.choices[0].message.content);
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
    Aja como um especialista em e-commerce brasileiro. Analise a descrição ou imagem: "${input}"
    
    Gere um JSON (SEM EMOJIS, LINGUAGEM PROFISSIONAL) com:
    - title: Título otimizado para SEO (ex: Nome do Produto + Diferenciais).
    - description: Uma descrição vendedora completa, incluindo "Características do Produto" em bullets.
    - sizeTable: Sugestão de medidas (Tabela P/M/G ou Numeração).
    - extraDetails: Um objeto com campos como "Cuidados", "Observações", "Conteúdo da Embalagem".

    NÃO use emojis. Mantenha o tom sério e focado em conversão.
    RETORNE APENAS O JSON LIMPO.
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
