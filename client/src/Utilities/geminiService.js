const GEMINI_API_KEY = "AIzaSyDRHpKR2bpPGDq1prbmTQpDFAUFFaHwB4A";

// Try multiple model names in order of preference
const MODELS_TO_TRY = [
    "gemini-1.5-pro",
    "gemini-1.5-flash-8b", 
    "gemini-2.0-flash-exp",
    "gemini-exp-1206"
];

export const sendMessageToGemini = async (message, conversationHistory = []) => {
    let lastError = null;
    
    // Try each model until one works
    for (const modelName of MODELS_TO_TRY) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are Ghor AI, a helpful real estate assistant for a property rental and sales platform called "GHOR BARI" (which means "home" in Bengali). You help users find properties, answer questions about real estate, provide advice on renting or buying properties in Bangladesh, and assist with any property-related queries. Be friendly, professional, and helpful. Keep responses concise and informative.

User's question: ${message}`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1024,
                        }
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                
                if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    console.log(`Successfully used model: ${modelName}`);
                    return data.candidates[0].content.parts[0].text;
                }
            } else {
                const errorData = await response.json();
                lastError = new Error(errorData.error?.message || `${modelName} not available`);
                console.log(`Model ${modelName} failed, trying next...`);
            }
        } catch (error) {
            lastError = error;
            console.log(`Model ${modelName} failed:`, error.message);
        }
    }
    
    // If all models failed
    console.error("All Gemini models failed. Last error:", lastError);
    throw new Error(`Unable to connect to Gemini. Please check your API key permissions. Error: ${lastError?.message}`);
};
