import axios from "axios";


// ========== GROQ API CONFIGURATION ==========

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const GROQ_MODEL = "llama-3.1-8b-instant";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";


// ========== GROQ MODEL UTILITIES ==========

/**
 * Get the currently configured Groq model name
 * @returns {string} Model name (llama-3.1-8b-instant)
 */
export function getGroqModel() {
    return GROQ_MODEL;
}


/**
 * Verify that Groq service is properly configured
 * Throws error if GROQ_API_KEY is not set
 * @throws {Error} If API key is missing
 */
export function ensureGroqConfigured() {

    if (!GROQ_API_KEY) {
        const error = new Error("AI service is not configured");
        error.statusCode = 500;
        error.details = "GROQ_API_KEY is not set";
        throw error;
    }

}


/**
 * Generate text using Groq API (LLM)
 * Makes request to Groq chat completion endpoint
 * 
 * @param {Object} params - Configuration parameters
 * @param {string} params.systemPrompt - System role/instructions
 * @param {string} params.userPrompt - User message
 * @param {number} params.temperature - Randomness (0-2, default 0.7)
 * @param {number} params.maxTokens - Max response tokens (default 512)
 * @param {number} params.topP - Probability threshold (default 0.95)
 * @param {number} params.timeout - Request timeout in ms (default 30000)
 * 
 * @returns {Promise<string>} Generated text response
 * @throws {Error} If API fails or returns invalid response
 */
export async function generateGroqText({
    systemPrompt,
    userPrompt,
    temperature = 0.7,
    maxTokens = 512,
    topP = 0.95,
    timeout = 30000
}) {

    // Verify API key is configured
    ensureGroqConfigured();


    // Call Groq API with messages
    const response = await axios.post(
        GROQ_API_URL,
        {
            model: GROQ_MODEL,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature,
            max_tokens: maxTokens,
            top_p: topP
        },
        {
            timeout,
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            }
        }
    );


    // Extract content from response
    const content = response.data?.choices?.[0]?.message?.content?.trim();


    // Validate response
    if (!content) {
        const error = new Error("AI service returned an invalid response");
        error.statusCode = 503;
        error.details = "Response parsing failed";
        throw error;
    }

    return content;

}
