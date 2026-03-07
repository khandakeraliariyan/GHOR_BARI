import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import * as aiController from "../controllers/aiController.js";


const router = express.Router();


// ========== AI ASSISTANT ==========

/**
 * POST /api/ai/send-message
 * Send message to AI chatbot assistant
 * AI provides property recommendations and advice
 * @auth Required (verifyToken)
 * @body {string} message - User message content
 */
router.post(
    "/api/ai/send-message", 
    verifyToken, 
    aiController.sendMessageToAI
);


// ========== PROPERTY DESCRIPTION GENERATION ==========

/**
 * POST /api/ai/generate-property-description
 * Generate professional property description using AI
 * Uses Groq API for intelligent description
 * @auth Required (verifyToken)
 * @body {Object} property - Property details object
 * @body {string} property.title - Property title
 * @body {string} property.type - Property type (flat/building)
 * @body {number} property.price - Property price
 * @body {number} property.areaSqFt - Area in square feet
 */
router.post(
    "/api/ai/generate-property-description", 
    verifyToken, 
    aiController.generatePropertyDescription
);


// ========== PROPERTY VALUATION ==========

/**
 * POST /api/ai/estimate-property-price
 * Estimate property market value using AI analysis
 * Considers location, property type, size, amenities
 * @auth Required (verifyToken)
 * @body {Object} property - Property details for estimation
 * @body {string} property.type - Property type
 * @body {string} property.location - Property location
 * @body {number} property.areaSqFt - Property area
 */
router.post(
    "/api/ai/estimate-property-price", 
    verifyToken, 
    aiController.estimatePropertyPrice
);


export default router;
