import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Available Gemini models
const MODELS_TO_TRY = [
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
];

export const sendMessageToAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userEmail = req.user?.email || "anonymous";

        console.log(`📨 AI Request received from ${userEmail}: "${message.substring(0, 50)}..."`);

        if (!message || !message.trim()) {
            console.warn("❌ Message is empty");
            return res.status(400).json({ error: "Message is required" });
        }

        if (!GEMINI_API_KEY) {
            console.error("❌ GEMINI_API_KEY is not set in environment variables");
            return res.status(500).json({ error: "AI service is not configured" });
        }

        let lastError = null;
        console.log(`🤖 Attempting to reach Gemini API with ${MODELS_TO_TRY.length} models...`);

        // Try each model until one works
        for (const modelName of MODELS_TO_TRY) {
            try {
                console.log(`⏳ Trying model: ${modelName}`);
                
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        contents: [{
                            parts: [{
                                text: `You are Ghor AI, a helpful real estate assistant for a property rental and sales platform called "GHOR BARI" (which means "home" in Bengali). You help users find properties, answer questions about real estate, provide advice on renting or buying properties in Bangladesh, and assist with any property-related queries. 

Be friendly, professional, and helpful. Keep responses concise and informative. Format your response in a clear, readable way.

User's question: ${message}`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1024,
                            topP: 0.95,
                            topK: 64,
                        }
                    },
                    {
                        timeout: 30000,
                        headers: {
                            "Content-Type": "application/json",
                        }
                    }
                );

                if (response.status === 200 && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const aiResponse = response.data.candidates[0].content.parts[0].text;
                    console.log(`✅ Successfully used model: ${modelName} for user: ${userEmail}`);
                    return res.status(200).json({
                        success: true,
                        response: aiResponse,
                        model: modelName
                    });
                }
            } catch (error) {
                lastError = error;
                const statusCode = error.response?.status;
                const errorMessage = error.response?.data?.error?.message || error.message;
                
                console.log(`⚠️ Model ${modelName} failed (${statusCode}): ${errorMessage}`);

                // If it's a 404 or 403, the model doesn't exist, try next
                if (statusCode === 404 || statusCode === 403) {
                    console.log(`   → Model not available, trying next...`);
                    continue;
                }

                // If it's a quota error or rate limit, stop trying other models
                if (statusCode === 429 || (statusCode === 400 && errorMessage.includes("quota"))) {
                    console.error(`   → Rate limit reached`);
                    return res.status(429).json({
                        error: "AI service is experiencing high demand. Please try again in a few moments.",
                        details: "Rate limit reached"
                    });
                }
            }
        }

        // If all models failed
        console.error("❌ All Gemini models failed. Last error:", lastError?.message);
        return res.status(503).json({
            error: "Unable to process your request. Our AI service is temporarily unavailable. Please try again later.",
            details: lastError?.message
        });

    } catch (error) {
        console.error("❌ Unexpected error in sendMessageToAI:", error);
        return res.status(500).json({
            error: "An unexpected error occurred. Please try again later.",
            details: error.message
        });
    }
};
