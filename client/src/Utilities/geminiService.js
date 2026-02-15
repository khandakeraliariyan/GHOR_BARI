import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyC4JvP2YelyU_hjFOUtbIkfPAxpL-08iFI";

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const sendMessageToGemini = async (message, conversationHistory = []) => {
    try {
        // Get the generative model - using latest stable model
        const model = genAI.getGenerativeModel({ 
            model: "models/gemini-1.5-flash-latest"
        });

        // Build the prompt with conversation context
        const contextPrompt = `You are Ghor AI, a helpful real estate assistant for a property rental and sales platform called "GHOR BARI" (which means "home" in Bengali). You help users find properties, answer questions about real estate, provide advice on renting or buying properties in Bangladesh, and assist with any property-related queries. Be friendly, professional, and helpful. Keep responses concise and informative.

User's question: ${message}`;

        // Generate content
        const result = await model.generateContent(contextPrompt);
        const response = result.response;
        const text = response.text();
        
        return text;
    } catch (error) {
        console.error("Detailed Gemini API Error:", {
            message: error.message,
            stack: error.stack,
            error: error
        });
        throw new Error(`Gemini API Error: ${error.message || "Unknown error occurred"}`);
    }
};
