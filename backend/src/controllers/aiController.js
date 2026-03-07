import { buildPropertyDescriptionPrompt, validatePropertyDescriptionPayload } from "../services/propertyDescriptionPromptService.js";
import { generateGroqText, getGroqModel } from "../services/groqService.js";
import { generatePropertyPriceEstimate } from "../services/propertyAppraisalService.js";


// ========== AI CONTROLLER CONFIGURATION ==========

/**
 * Groq AI model currently in use for all AI endpoints
 * Used for chat, description generation, and price estimation
 */
const GROQ_MODEL = getGroqModel();


// ========== ERROR HANDLING ==========

/**
 * Standardized error response handler for AI endpoints
 * Maps common API errors to appropriate HTTP status codes and messages
 * Handles authentication, rate limiting, and service unavailability
 * 
 * @param {Object} res - Express response object
 * @param {Error} error - Error object from AI service
 * @param {string} fallbackMessage - Default message if error details unavailable
 * 
 * @returns {Response} JSON error response sent to client
 */
function handleAiControllerError(res, error, fallbackMessage) {

    // Extract status code from various error locations
    const statusCode = error.response?.status || error.statusCode || 500;

    // Extract error message from various error locations
    const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.details ||
        error.message;

    // Handle auth failures
    if (statusCode === 401 || statusCode === 403) {
        return res.status(401).json({
            success: false,
            error: "AI service authentication failed. Please check your API key.",
            details: "Invalid or expired API key"
        });
    }

    // Handle rate limiting
    if (statusCode === 429) {
        return res.status(429).json({
            success: false,
            error: "AI service is experiencing high demand. Please try again in a few moments.",
            details: "Rate limit reached"
        });
    }

    // Handle service unavailability
    if (statusCode === 503 || statusCode === 500) {
        return res.status(statusCode === 500 ? 503 : statusCode).json({
            success: false,
            error: fallbackMessage,
            details: errorMessage
        });
    }

    // Generic error response
    return res.status(500).json({
        success: false,
        error: "An error occurred while processing your request.",
        details: errorMessage
    });

}


// ========== AI CHAT ENDPOINT ==========

/**
 * Handle general chat message with Ghor AI assistant
 * Routes user messages to LLM for real-estate conversation
 * 
 * POST /api/ai/chat
 * 
 * @param {Object} req - Express request
 * @param {string} req.body.message - User message to send to AI
 * 
 * @returns {200} Success response with AI response
 * @returns {200.success} true
 * @returns {200.response} AI assistant's response text
 * @returns {200.model} Name of LLM model used
 * 
 * @returns {400} Missing or empty message
 * @returns {401} Authentication failure
 * @returns {429} Rate limited
 * @returns {503} Service unavailable
 * 
 * Ghor AI context:
 * - Real estate assistant for "GHOR BARI" = 'home' in Bengali
 * - Helps with property search, advice, and real-estate questions
 * - Bangladesh property market specialist
 */
export const sendMessageToAI = async (req, res) => {

    try {

        // Extract message from request body
        const { message } = req.body;

        // Validate message is provided and non-empty
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: "Message is required"
            });
        }

        // System prompt defines assistant personality and context
        const systemPrompt = `You are Ghor AI, a helpful real estate assistant for a property rental and sales platform called "GHOR BARI" (which means "home" in Bengali). You help users find properties, answer questions about real estate, provide advice on renting or buying properties in Bangladesh, and assist with any property-related queries.

Be friendly, professional, and helpful. Keep responses concise and informative.`;

        try {

            // Call LLM with message
            const aiResponse = await generateGroqText({
                systemPrompt,
                userPrompt: message,
                temperature: 0.7,
                maxTokens: 512,
                topP: 0.95
            });

            // Return AI response to client
            return res.status(200).json({
                success: true,
                response: aiResponse,
                model: GROQ_MODEL
            });

        } catch (error) {

            // Handle AI service errors
            return handleAiControllerError(res, error, "AI service is temporarily unavailable. Please try again later.");

        }

    } catch (error) {

        // Handle unexpected errors
        return res.status(500).json({
            success: false,
            error: "An unexpected error occurred. Please try again later.",
            details: error.message
        });

    }

};


// ========== PROPERTY DESCRIPTION GENERATION ==========

/**
 * Generate marketplace-ready property description using AI
 * Creates compelling listing text from property details
 * 
 * POST /api/ai/generate-description
 * 
 * Request body (all required):
 * - title: Property listing title
 * - listingType: 'sale' or 'rent'
 * - propertyType: 'flat' or 'building'
 * - price: Price in BDT
 * - areaSqFt: Property area in square feet
 * - divisionName: Bangladesh division (Dhaka, Chittagong, etc.)
 * - districtName: District name
 * - upazilaName: Upazila/Thana name
 * - address: Street or area name
 * - amenities: Array of amenity names (optional)
 * - roomCount: Number of rooms (required if flat)
 * - bathrooms: Number of bathrooms (required if flat)
 * - floorCount: Number of floors (required if building)
 * - totalUnits: Total units (required if building)
 * 
 * @returns {200} Success with generated description
 * @returns {200.success} true
 * @returns {200.description} Generated property description (one paragraph, 90-140 words)
 * @returns {200.model} Name of LLM model used
 * 
 * @returns {400} Validation error - required field missing or invalid
 * @returns {401} Authentication failure
 * @returns {429} Rate limited
 * @returns {503} Service unavailable
 * 
 * Description characteristics:
 * - One paragraph only
 * - 90-140 words
 * - Professional and appealing
 * - No markdown, bullet points, or emojis
 * - No invented features
 * - Natural location mention
 * - Call to action ending
 */
export const generatePropertyDescription = async (req, res) => {

    try {

        // Validate all required payload fields
        const validationError = validatePropertyDescriptionPayload(req.body);

        // Return validation error if present
        if (validationError) {
            return res.status(400).json({
                success: false,
                error: validationError
            });
        }

        // System prompt sets writing style and audience
        const systemPrompt = `You write polished real-estate listing descriptions for a Bangladesh property marketplace. Your writing should be natural, trustworthy, concise, and conversion-friendly.`;

        // Build property facts prompt from payload
        const userPrompt = buildPropertyDescriptionPrompt(req.body);

        try {

            // Call LLM to generate description
            const description = await generateGroqText({
                systemPrompt,
                userPrompt,
                temperature: 0.6,
                maxTokens: 220,
                topP: 0.9
            });

            // Clean and return description
            return res.status(200).json({
                success: true,
                description: description.replace(/\s+/g, " ").trim(),
                model: GROQ_MODEL
            });

        } catch (error) {

            // Handle AI service errors
            return handleAiControllerError(res, error, "Description generation is temporarily unavailable. Please try again later.");

        }

    } catch (error) {

        // Handle unexpected errors
        return res.status(500).json({
            success: false,
            error: "An unexpected error occurred. Please try again later.",
            details: error.message
        });

    }

};


// ========== PROPERTY PRICE ESTIMATION ==========

/**
 * Estimate property asking price based on attributes
 * Recommends pricing range without requiring current listing price
 * 
 * POST /api/ai/estimate-price
 * 
 * Request body (required fields):
 * - listingType: 'sale' or 'rent'
 * - propertyType: 'flat' or 'building'
 * - areaSqFt: Property area in square feet
 * - divisionName: Bangladesh division
 * - districtName: District name
 * - upazilaName: Upazila/Thana name
 * - address: Street or area name
 * - amenities: Array of amenity names (optional)
 * - roomCount: Number of rooms (required if flat)
 * - bathrooms: Number of bathrooms (required if flat)
 * - floorCount: Number of floors (required if building)
 * - totalUnits: Total units (required if building)
 * 
 * @returns {200} Success with price estimate
 * @returns {200.success} true
 * @returns {200.estimate} Estimate object with prices and reasoning
 * @returns {200.estimate.estimatedPrice} Recommended asking price in BDT
 * @returns {200.estimate.minPrice} Estimated minimum price in BDT
 * @returns {200.estimate.maxPrice} Estimated maximum price in BDT
 * @returns {200.estimate.confidence} Confidence level (low/medium/high)
 * @returns {200.estimate.reasoning} Array of reasoning points
 * @returns {200.model} Name of LLM model used
 * 
 * @returns {400} Missing required property details
 * @returns {401} Authentication failure
 * @returns {429} Rate limited
 * @returns {503} Service unavailable
 * 
 * Estimate characteristics:
 * - Based on property attributes only
 * - Includes min/max range
 * - Confidence level provided
 * - Reasoning for estimate
 * - Prices in BDT currency
 */
export const estimatePropertyPrice = async (req, res) => {

    try {

        // Build payload from request with mapped field names
        const propertyPayload = {
            listingType: req.body?.listingType,
            propertyType: req.body?.propertyType,
            areaSqFt: req.body?.areaSqFt,
            roomCount: req.body?.roomCount,
            bathrooms: req.body?.bathrooms,
            floorCount: req.body?.floorCount,
            totalUnits: req.body?.totalUnits,
            amenities: req.body?.amenities,
            address: {
                division_id: req.body?.divisionName,
                district_id: req.body?.districtName,
                upazila_id: req.body?.upazilaName,
                street: req.body?.address
            }
        };

        // Generate price estimate from property details
        const estimate = await generatePropertyPriceEstimate(propertyPayload);

        // Check if estimate succeeded
        if (!estimate) {
            return res.status(400).json({
                success: false,
                error: "Fill the main property details first to estimate price."
            });
        }

        // Return successful estimate
        return res.status(200).json({
            success: true,
            estimate,
            model: GROQ_MODEL
        });

    } catch (error) {

        // Handle AI service errors
        return handleAiControllerError(res, error, "Price estimation is temporarily unavailable. Please try again later.");

    }

};
                error: "Fill the main property details first to estimate price."
            });
        }

        return res.status(200).json({
            success: true,
            estimate,
            model: GROQ_MODEL
        });
    } catch (error) {
        return handleAiControllerError(res, error, "Price estimation is temporarily unavailable. Please try again later.");
    }
};
