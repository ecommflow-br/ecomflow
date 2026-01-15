import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export const generateProductContent = async (input, fileData, style = 'marketplace') => {
    const openAiKey = localStorage.getItem("openai_api_key")?.trim();
    const geminiKey = localStorage.getItem("gemini_api_key")?.trim();

    if (openAiKey) {
        return await generateWithOpenAI(openAiKey, input, fileData, style);
    } else if (geminiKey) {
        return await generateWithGemini(geminiKey, input, fileData, style);
    } else {
        throw new Error("Nenhuma chave de API encontrada. Por favor, configure OpenAI ou Gemini nas configurações.");
    }
};

const getStylePrompt = (style, input) => {
    const basePrompt = `Analise este produto: "${input}". Aja como um especialista em e-commerce brasileiro.
    REGRA DE OURO: NÃO use emojis em excesso. O texto deve ser limpo e profissional. Evite usar muito negrito (**).
    PROIBIDO: NUNCA use os termos "Atacado", "Varejo" ou "Atacado e Varejo".`;

    if (style === 'elite') {
        return `${basePrompt}
        ESTILO: COPYWRITING DE ALTA CONVERSÃO (Foco: Marketplace/Shopee/Mercado Livre).
        
        IMPORTANTE: 
        - NÃO invente nome de loja.
        - NÃO coloque WhatsApp ou Instagram.
        - NÃO coloque links externos.
        
        Estrutura OBRIGATÓRIA (Siga este template visual limpo):
        
        > ENVIO IMEDIATO | QUALIDADE PREMIUM | FOTOS REAIS
        
        ## [TÍTULO PERSUASIVO]
        [Parágrafo de Hook: Identifique a dor/desejo e apresente a solução.]
        
        ### POR QUE VOCÊ VAI AMAR:
        - [Benefício 1]: [Explicação]
        - [Benefício 2]: [Explicação]
        - [Benefício 3]: [Explicação]
        
        ---
        
        ## PERGUNTAS FREQUENTES (FAQ)
        1. [Pergunta comum sobre o nicho]?
        [Resposta quebra-objeção]
        
        2. [Pergunta sobre tamanho/material]?
        [Resposta técnica e tranquilizadora]
        
        ---
        
        ## DICAS DE CUIDADO
        - [Dica 1]
        - [Dica 2]
        
        ---
        
        [Chamada para Ação de Escassez - ex: Estoque Limitado]
        
        Retorne um JSON (PORTUGUÊS):
        {
            "title": "Título SEO (Ex: Vestido Midi Duna...)",
            "description": "O texto completo seguindo EXATAMENTE a estrutura acima com os separadores '---'",
            "sizeTable": "Tabela detalhada",
            "extraDetails": {
                "observations": "Ficha Técnica (Tecido, Detalhes)",
                "packaging": "Conteúdo da embalagem",
                "shipping": "Envio Imediato"
            }
        }`;
    } else if (style === 'boutique') {
        return `${basePrompt}
        ESTILO: BOUTIQUE / LUXO.
        Foco: Narrativa, sofisticação, experiência e exclusividade.
        - Use uma linguagem culta, elegante e fluida (Storytelling).
        - Descreva o toque do tecido, o caimento no corpo de forma poética mas clara.
        - NÃO use emojis. Foco em adjetivos de valor (Atemporal, Chic, Refinado).
        
        Retorne um JSON (PORTUGUÊS):
        {
            "title": "Título Elegante e Descritivo",
            "description": "Texto em parágrafos fluidos descrevendo a experiência de usar a peça.",
            "sizeTable": "Tabela de medidas",
            "extraDetails": {
                "observations": "Detalhes de costura e acabamento",
                "packaging": "Apresentação Premium",
                "shipping": "Prazo"
            }
        }`;
    } else if (style === 'basic') {
        return `${basePrompt}
        ESTILO: TÉCNICO / PADRÃO (Foco: Informativo e Neutro).
        
        Estrutura OBRIGATÓRIA (Siga exatamente este template):
        
        ## [Nome do Produto] – Moda Casual & Elegante
        
        ### Descrição do Produto
        [Parágrafo objetivo sobre conforto, elegância e versatilidade da peça.]
        
        ---
        
        ### Ficha Técnica
        - Categoria: [Categoria do Produto]
        - Modelagem: [Tipo de modelagem]
        - Tecido: [Tecido principal ou "Conforme variação"]
        - Composição: [Material se identificado]
        - Gola / Decote: [Tipo de gola]
        - Manga: [Tipo de manga]
        - Detalhes: [Bolsos, Zíper, Botões]
        - Transparência: [Sim/Não/Parcial]
        - Comprimento: [Curto/Midi/Longo]
        
        ---
        
        ### Tabela de Medidas (Estimativa)
        | Tamanho | Busto (cm) | Cintura (cm) | Quadril (cm) |
        |---|---|---|---|
        | P | 80-84 | 60-64 | 88-92 |
        | M | 86-90 | 66-70 | 94-98 |
        | G | 92-96 | 72-76 | 100-104 |
        | GG | 98-102 | 78-82 | 106-110 |
        
        > As medidas podem variar conforme o modelo.
        
        ---
        
        ### Indicação de Uso
        - Uso diário
        - Trabalho
        - Passeios
        - Eventos casuais
        
        ---
        
        ### Cuidados com a Peça
        - Lavar conforme etiqueta
        - Não usar alvejante
        - Secar à sombra
        
        ---
        
        ### Informações Adicionais
        - Conteúdo da embalagem: 1 [Nome da Peça]
        - Origem: Nacional
        - Envio: Pronta entrega
        
        Retorne um JSON (PORTUGUÊS):
        {
            "title": "Título simples e direto",
            "description": "O texto completo seguindo EXATAMENTE a estrutura de markdown acima",
            "sizeTable": "Tabela de medidas formatada",
            "extraDetails": {
                "observations": "Ficha Técnica resumida",
                "packaging": "1 Peça",
                "shipping": "Pronta Entrega"
            }
        }`;
    } else {
        // Marketplace (Default)
        return `${basePrompt}
        ESTILO: MARKETPLACE (Shopee/Mercado Livre).
        Foco: Leitura rápida, escaneabilidade, conversão direta.
        - Use listas simples.
        - Destaque "Características" e "Ficha Técnica" logo de cara.
        - NÃO use parágrafos longos.
        - NÃO use emojis excessivos. Use apenas bullets simples (-).
        
        Retorne um JSON (PORTUGUÊS):
        {
            "title": "Título SEO Otimizado",
            "description": "Descrição em tópicos/bullets.",
            "sizeTable": "Tabela clara",
            "extraDetails": {
                "observations": "Dicas rápidas",
                "packaging": "O que vem na caixa",
                "shipping": "Envio"
            }
        }`;
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

const generateWithOpenAI = async (apiKey, input, fileData, style) => {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const promptText = getStylePrompt(style, input);

    const messages = [
        {
            role: "system",
            content: `Você é um especialista em E-commerce. Responda APENAS com um JSON válido.`
        },
        {
            role: "user",
            content: [
                { type: "text", text: promptText },
                fileData ? { type: "image_url", image_url: { url: fileData } } : null
            ].filter(Boolean)
        }
    ];

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });

        return parseAIResponse(response.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error("Erro na OpenAI: " + (error.message || "Verifique sua chave."));
    }
};

const generateWithGemini = async (apiKey, input, fileData, style) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = getStylePrompt(style, input);

    // Priorizando o NOVO modelo 2.5 Flash como solicitado pelo usuário
    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro"
    ];

    let lastErrorMsg = "";

    for (const modelName of modelsToTry) {
        try {
            console.log(`EcomFlow: Tentando se conectar ao modelo ${modelName}...`);
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
            console.warn(`EcomFlow: Falha no ${modelName}:`, error.message);
            lastErrorMsg = error.message;
            if (error.message?.includes("429")) throw new Error("Cota do Gemini excedida. Aguarde 30 segundos.");
            if (error.message?.includes("403")) throw new Error("Chave Gemini inválida ou vazada. Verifique no AI Studio.");
        }
    }

    throw new Error(`O Google não encontrou nenhum modelo compatível (1.5 Flash/Pro). Erro: ${lastErrorMsg}`);
};

export const calculateWithAI = async (prompt, fileData) => {
    const openAiKey = localStorage.getItem("openai_api_key")?.trim();
    const geminiKey = localStorage.getItem("gemini_api_key")?.trim();

    const systemPrompt = `Você é um assistente de precificação de e-commerce.
    Analise o texto e a imagem (se houver) para identificar valores numéricos.
    Se encontrar um preço na imagem (etiqueta, valor na tela), use-o como "cost" ou "targetPrice" dependendo do contexto.
    Retorne APENAS um JSON válido seguindo este modelo:
    {
        "cost": 0, (custo do produto identificado)
        "tax": 0, (porcentagem de impostos/taxas)
        "markup": 0, (porcentagem de lucro sobre custo - Modo Padrão)
        "extra": 0, (custos extras fixos)
        "targetPrice": 0, (preço de venda alvo - Modo Reverso)
        "desiredMargin": 0, (margem líquida desejada em % - Modo Reverso)
        "shipping": 0, (custo de frete - Modo Reverso)
        "mode": "standard" | "reverse" (determine o melhor modo baseado no pedido)
    }
    Se não encontrar valores, use 0. Priorize valores visíveis na imagem.`;

    if (openAiKey) {
        const openai = new OpenAI({ apiKey: openAiKey, dangerouslyAllowBrowser: true });
        const messages = [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: [
                    { type: "text", text: prompt || "Analise a imagem em busca de preços." },
                    fileData ? { type: "image_url", image_url: { url: fileData } } : null
                ].filter(Boolean)
            }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            response_format: { type: "json_object" }
        });
        return parseAIResponse(response.choices[0].message.content);

    } else if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);

        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        let lastErrorMsg = "";

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: "application/json" } });

                let result;
                const fullPrompt = `${systemPrompt}\n\nTexto do usuário: ${prompt || "Analise a imagem."}`;

                if (fileData) {
                    const mimeType = fileData.match(/^data:([^;]+);/)?.[1] || "image/jpeg";
                    const base64Data = fileData.split(',')[1];
                    result = await model.generateContent([
                        fullPrompt,
                        { inlineData: { data: base64Data, mimeType: mimeType } }
                    ]);
                } else {
                    result = await model.generateContent(fullPrompt);
                }

                const response = await result.response;
                return parseAIResponse(response.text());
            } catch (error) {
                // console.warn(`EcomFlow Calc: Falha no modelo ${modelName}.`, error.message);
                lastErrorMsg = error.message;
            }
        }
        throw new Error(`Erro no cálculo via IA: ${lastErrorMsg}`);

    } else {
        throw new Error("API Key não configurada.");
    }
};
