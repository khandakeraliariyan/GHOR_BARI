import { generateGroqText, getGroqModel } from "./groqService.js";


// ========== APPRAISAL SERVICE CONFIGURATION ==========

/**
 * LLM model used for all property appraisals and estimates
 * Ensures consistent appraisal quality across requests
 */
const APPRAISAL_MODEL = getGroqModel();


// ========== TEXT FORMATTING UTILITIES ==========

/**
 * Compact text by trimming and removing extra whitespace
 * Ensures consistent text formatting in appraisal facts
 * 
 * @param {string} value - Text to compact
 * @returns {string} Compacted text with single spaces
 */
function compactText(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
}


/**
 * Convert value to safe number (finite number or null)
 * Prevents NaN and Infinity from being used in calculations
 * 
 * @param {any} value - Value to convert to number
 * @returns {number|null} Finite number or null if invalid
 */
function safeNumber(value) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
}


/**
 * Format amenity array as comma-separated string
 * 
 * @param {Array} amenities - Amenity names
 * @returns {string} Formatted amenities or "Not specified"
 */
function formatAmenities(amenities = []) {

    // Return default if not an array or empty
    if (!Array.isArray(amenities) || amenities.length === 0) {
        return "Not specified";
    }

    // Compact text and join with commas
    return amenities.map(compactText).filter(Boolean).join(", ");

}


/**
 * Build address label from address object
 * Combines street, upazila, district, division into single string
 * 
 * @param {Object} address - Address object with components
 * @returns {string} Full address label
 */
function buildAddressLabel(address = {}) {

    return [
        compactText(address.street),
        compactText(address.upazila_id),
        compactText(address.district_id),
        compactText(address.division_id)
    ].filter(Boolean).join(", ");

}


// ========== APPRAISAL PROMPT BUILDING ==========

/**
 * Build property facts string for LLM appraisal prompt
 * Extracts and formats key property attributes for AI valuation
 * 
 * @param {Object} property - Property object with details
 * @returns {string} Formatted property facts for LLM
 */
function buildAppraisalFacts(property = {}) {

    // Build core facts applicable to all property types
    const facts = [
        `Currency: BDT only`,
        `Listing type: ${compactText(property.listingType)}`,
        `Property type: ${compactText(property.propertyType)}`,
        `Current listed price in BDT: ${safeNumber(property.price) ?? "unknown"}`,
        `Area in square feet: ${safeNumber(property.areaSqFt) ?? "unknown"}`,
        `Address context: ${buildAddressLabel(property.address) || "Not specified"}`,
        `Amenities: ${formatAmenities(property.amenities)}`
    ];

    // Add apartment-specific facts
    if (property.propertyType === "flat") {
        facts.push(`Rooms: ${safeNumber(property.roomCount) ?? "unknown"}`);
        facts.push(`Bathrooms: ${safeNumber(property.bathrooms) ?? "unknown"}`);
    }

    // Add building-specific facts
    if (property.propertyType === "building") {
        facts.push(`Floor count: ${safeNumber(property.floorCount) ?? "unknown"}`);
        facts.push(`Total units: ${safeNumber(property.totalUnits) ?? "unknown"}`);
    }

    return facts.join("\n");

}


// ========== JSON EXTRACTION UTILITIES ==========

/**
 * Extract JSON block from LLM response
 * Handles both markdown-fenced and raw JSON responses
 * 
 * @param {string} text - Raw response text from LLM
 * @returns {string} JSON string extracted from response
 */
function extractJsonBlock(text) {

    // Try markdown-fenced JSON block first
    const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
        return fencedMatch[1].trim();
    }

    // Try raw JSON between braces
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return text.slice(firstBrace, lastBrace + 1);
    }

    // Return whole text if no JSON structure found
    return text.trim();

}


// ========== NORMALIZATION UTILITIES ==========

/**
 * Normalize reasoning array from LLM response
 * Limits to 4 items, removes empty strings, compacts text
 * 
 * @param {Array|any} reasoning - Reasoning array from LLM
 * @returns {Array<string>} Normalized reasoning array (max 4 items)
 */
function normalizeReasoning(reasoning) {

    // Handle non-array input
    if (!Array.isArray(reasoning)) {
        return [];
    }

    // Compact, filter, and limit to 4 items
    return reasoning
        .map((item) => compactText(item))
        .filter(Boolean)
        .slice(0, 4);

}


/**
 * Normalize confidence level to standard values
 * Defaults to 'medium' if invalid value provided
 * 
 * @param {string} value - Confidence level from LLM
 * @returns {string} One of: 'low', 'medium', 'high'
 */
function normalizeConfidence(value) {

    const normalized = compactText(value).toLowerCase();

    // Return valid confidence or default to medium
    return ["low", "medium", "high"].includes(normalized) ? normalized : "medium";

}


/**
 * Derive market position from price comparison
 * Compares listed price against appraised range
 * 
 * @param {number} listedPrice - Property's listed price
 * @param {number} minPrice - Appraised minimum price
 * @param {number} maxPrice - Appraised maximum price
 * 
 * @returns {string} One of: 'underpriced', 'fairly-priced', 'overpriced'
 */
function deriveMarketPosition(listedPrice, minPrice, maxPrice) {

    // Can't determine without all three prices
    if (!listedPrice || !minPrice || !maxPrice) {
        return "fairly-priced";
    }

    // Compare listed price against appraisal range
    if (listedPrice < minPrice) {
        return "underpriced";
    }

    if (listedPrice > maxPrice) {
        return "overpriced";
    }

    return "fairly-priced";

}


/**
 * Normalize appraisal response from LLM
 * Handles null values, validates pricing, derives market position
 * 
 * @param {Object} parsed - Parsed JSON from LLM response
 * @param {number} listedPrice - Property's listed price for comparison
 * 
 * @returns {Object} Normalized appraisal with all required fields
 */
function normalizeAppraisal(parsed, listedPrice) {

    // Extract and round prices, defaulting to 0 for missing values
    const fairPrice = Math.max(0, Math.round(safeNumber(parsed?.fairPrice) || 0));
    const minPrice = Math.max(0, Math.round(safeNumber(parsed?.minPrice) || 0));
    const maxPrice = Math.max(0, Math.round(safeNumber(parsed?.maxPrice) || 0));

    // Build fallback base price from available values
    const fallbackBase = fairPrice || listedPrice || 0;

    // Derive normalized min/max prices with 5% fallback range
    const normalizedMin = minPrice || Math.max(0, Math.round(fallbackBase * 0.95));
    const normalizedMax = maxPrice || Math.max(normalizedMin, Math.round(fallbackBase * 1.05));

    // Return normalized appraisal object
    return {
        fairPrice: fairPrice || fallbackBase,
        minPrice: Math.min(normalizedMin, normalizedMax),
        maxPrice: Math.max(normalizedMin, normalizedMax),
        confidence: normalizeConfidence(parsed?.confidence),
        marketPosition: deriveMarketPosition(
            listedPrice,
            Math.min(normalizedMin, normalizedMax),
            Math.max(normalizedMin, normalizedMax)
        ),
        summary: compactText(parsed?.summary),
        reasoning: normalizeReasoning(parsed?.reasoning),
        generatedAt: new Date(),
        model: APPRAISAL_MODEL,
        currency: "BDT"
    };

}


// ========== VALIDATION UTILITIES ==========

/**
 * Validate property has minimum required fields for appraisal
 * Checks basic property info and type-specific requirements
 * 
 * @param {Object} property - Property object to validate
 * @returns {boolean} True if property valid for appraisal
 */
function validatePropertyForAppraisal(property = {}) {

    // Check common required fields
    if (!compactText(property.listingType) || !compactText(property.propertyType)) {
        return false;
    }

    if (!safeNumber(property.price) || !safeNumber(property.areaSqFt)) {
        return false;
    }

    // Validate flat-specific requirements
    if (property.propertyType === "flat") {
        return safeNumber(property.roomCount) >= 1 && safeNumber(property.bathrooms) >= 1;
    }

    // Validate building-specific requirements
    if (property.propertyType === "building") {
        return safeNumber(property.floorCount) >= 1 && safeNumber(property.totalUnits) >= 1;
    }

    return true;

}


/**
 * Validate property has minimum required fields for price estimate
 * Less strict than appraisal (doesn't require initial price)
 * 
 * @param {Object} property - Property object to validate
 * @returns {boolean} True if property valid for price estimation
 */
function validatePropertyForPriceEstimate(property = {}) {

    // Check common required fields (excluding price)
    if (!compactText(property.listingType) || !compactText(property.propertyType)) {
        return false;
    }

    if (!safeNumber(property.areaSqFt)) {
        return false;
    }

    // Require address
    if (!property.address || !compactText(property.address.street)) {
        return false;
    }

    // Validate flat-specific requirements
    if (property.propertyType === "flat") {
        return safeNumber(property.roomCount) >= 1 && safeNumber(property.bathrooms) >= 1;
    }

    // Validate building-specific requirements
    if (property.propertyType === "building") {
        return safeNumber(property.floorCount) >= 1 && safeNumber(property.totalUnits) >= 1;
    }

    return true;

}


// ========== APPRAISAL GENERATION ==========

/**
 * Generate property appraisal using AI
 * Analyzes property details and returns fair market pricing
 * 
 * Uses LLM to estimate:
 * - Fair market price in BDT
 * - Price range (min/max)
 * - Market position (underpriced, fairly-priced, overpriced)
 * - Confidence level in estimate
 * - Reasoning for appraisal
 * 
 * @param {Object} property - Property object with required fields
 *                           Must include: listingType, propertyType, price, areaSqFt
 * 
 * @returns {Promise<Object|null>} Appraisal result or null if validation fails
 * @returns {number} result.fairPrice - Estimated fair market price in BDT
 * @returns {number} result.minPrice - Estimated minimum price in BDT
 * @returns {number} result.maxPrice - Estimated maximum price in BDT
 * @returns {string} result.confidence - 'low', 'medium', or 'high'
 * @returns {string} result.marketPosition - Market comparison ('underpriced', 'fairly-priced', 'overpriced')
 * @returns {string} result.summary - One-sentence appraisal summary
 * @returns {Array<string>} result.reasoning - Array of reasoning points
 * @returns {Date} result.generatedAt - Timestamp of generation
 * @returns {string} result.model - LLM model name used
 * @returns {string} result.currency - 'BDT' (Bangladeshi Taka)
 * 
 * @throws {Error} If LLM returns invalid JSON or incomplete data
 * @throws {Error} If LLM returns zero pricing data
 * 
 * @example
 * const appraisal = await generatePropertyAppraisal({
 *   listingType: 'sale',
 *   propertyType: 'flat',
 *   price: 2500000,
 *   areaSqFt: 1200,
 *   roomCount: 3,
 *   bathrooms: 2,
 *   address: { street: 'Gulshan', upazila_id: 'Dhaka' },
 *   amenities: ['gym', 'parking']
 * });
 */
export async function generatePropertyAppraisal(property = {}) {

    // Validate property has required fields
    if (!validatePropertyForAppraisal(property)) {
        return null;
    }

    // System role instructs LLM on response format
    const systemPrompt = "You are a real-estate valuation assistant for a Bangladesh property marketplace. Estimate fair pricing only in Bangladeshi Taka (BDT). Return strict JSON only.";

    // User prompt with rules and property facts
    const userPrompt = `Estimate a fair market appraisal for this property in BDT.

Rules:
- Return valid JSON only.
- Do not include markdown or code fences.
- All prices must be numeric BDT values without commas or currency symbols.
- fairPrice, minPrice, and maxPrice must be monthly BDT for rent listings and total BDT for sale listings.
- confidence must be one of: low, medium, high.
- marketPosition must be one of: underpriced, fairly-priced, overpriced.
- marketPosition must strictly reflect the listed price versus your own estimated range:
  - underpriced if listed price is below minPrice
  - fairly-priced if listed price is between minPrice and maxPrice
  - overpriced if listed price is above maxPrice
- summary must be one short sentence.
- reasoning must be an array of 2 to 4 short strings.

Return this exact JSON shape:
{
  "fairPrice": 0,
  "minPrice": 0,
  "maxPrice": 0,
  "confidence": "medium",
  "marketPosition": "fairly-priced",
  "summary": "",
  "reasoning": []
}

Property facts:
${buildAppraisalFacts(property)}`;

    // Call LLM for appraisal generation
    const rawResponse = await generateGroqText({
        systemPrompt,
        userPrompt,
        temperature: 0.2,
        maxTokens: 260,
        topP: 0.9
    });

    // Parse JSON response from LLM
    let parsed;
    try {
        parsed = JSON.parse(extractJsonBlock(rawResponse));
    } catch (error) {
        const parseError = new Error("AI appraisal returned invalid JSON");
        parseError.details = error.message;
        throw parseError;
    }

    // Normalize appraisal with fallback handling
    const listedPrice = Math.round(safeNumber(property.price) || 0);
    const normalized = normalizeAppraisal(parsed, listedPrice);

    // Ensure pricing data was successfully generated
    if (!normalized.fairPrice) {
        throw new Error("AI appraisal returned incomplete pricing data");
    }

    return normalized;

}


// ========== PRICE ESTIMATION ==========

/**
 * Generate property price estimate using AI
 * Recommends pricing range for new/unlisted properties
 * 
 * Does not require current listing price
 * Returns estimated fair asking price based on property attributes alone
 * 
 * @param {Object} property - Property object with required fields
 *                           Must include: listingType, propertyType, areaSqFt, address.street
 * 
 * @returns {Promise<Object|null>} Price estimate or null if validation fails
 * @returns {number} result.estimatedPrice - Recommended asking price in BDT
 * @returns {number} result.minPrice - Estimated minimum asking price in BDT
 * @returns {number} result.maxPrice - Estimated maximum asking price in BDT
 * @returns {string} result.confidence - 'low', 'medium', or 'high'
 * @returns {Array<string>} result.reasoning - Array of estimation reasoning points
 * @returns {string} result.model - LLM model name used
 * @returns {string} result.currency - 'BDT' (Bangladeshi Taka)
 * 
 * @throws {Error} If LLM returns invalid JSON or incomplete pricing data
 * 
 * @example
 * const estimate = await generatePropertyPriceEstimate({
 *   listingType: 'sale',
 *   propertyType: 'flat',
 *   areaSqFt: 1200,
 *   roomCount: 3,
 *   bathrooms: 2,
 *   address: { street: 'Gulshan' },
 *   amenities: ['parking', 'balcony']
 * });
 */
export async function generatePropertyPriceEstimate(property = {}) {

    // Validate property meets estimation requirements
    if (!validatePropertyForPriceEstimate(property)) {
        return null;
    }

    // System role for estimation task
    const systemPrompt = "You are a real-estate valuation assistant for a Bangladesh property marketplace. Estimate fair pricing only in Bangladeshi Taka (BDT). Return strict JSON only.";

    // User prompt for price estimation without existing price anchor
    const userPrompt = `Estimate a fair asking price for this property in BDT.

Rules:
- Return valid JSON only.
- Do not include markdown or code fences.
- All prices must be numeric BDT values without commas or currency symbols.
- estimatedPrice, minPrice, and maxPrice must be monthly BDT for rent listings and total BDT for sale listings.
- confidence must be one of: low, medium, high.
- reasoning must be an array of 2 to 4 short strings.
- Base your estimate on the provided facts only.

Return this exact JSON shape:
{
  "estimatedPrice": 0,
  "minPrice": 0,
  "maxPrice": 0,
  "confidence": "medium",
  "reasoning": []
}

Property facts:
${buildAppraisalFacts(property)}`;

    // Call LLM for price estimation
    const rawResponse = await generateGroqText({
        systemPrompt,
        userPrompt,
        temperature: 0.2,
        maxTokens: 220,
        topP: 0.9
    });

    // Parse JSON response from LLM
    let parsed;
    try {
        parsed = JSON.parse(extractJsonBlock(rawResponse));
    } catch (error) {
        const parseError = new Error("AI price estimate returned invalid JSON");
        parseError.details = error.message;
        throw parseError;
    }

    // Extract and normalize prices from response
    const estimatedPrice = Math.max(0, Math.round(safeNumber(parsed?.estimatedPrice) || 0));
    const minPrice = Math.max(0, Math.round(safeNumber(parsed?.minPrice) || 0));
    const maxPrice = Math.max(0, Math.round(safeNumber(parsed?.maxPrice) || 0));

    // Build fallback base from available prices
    const fallbackBase = estimatedPrice || minPrice || maxPrice || 0;

    // Derive normalized range with fallback
    const normalizedMin = minPrice || Math.max(0, Math.round(fallbackBase * 0.95));
    const normalizedMax = maxPrice || Math.max(normalizedMin, Math.round(fallbackBase * 1.05));

    // Ensure we have valid pricing data
    if (!fallbackBase) {
        throw new Error("AI price estimate returned incomplete pricing data");
    }

    // Return standardized estimate object
    return {
        estimatedPrice: estimatedPrice || fallbackBase,
        minPrice: Math.min(normalizedMin, normalizedMax),
        maxPrice: Math.max(normalizedMin, normalizedMax),
        confidence: normalizeConfidence(parsed?.confidence),
        reasoning: normalizeReasoning(parsed?.reasoning),
        model: APPRAISAL_MODEL,
        currency: "BDT"
    };

}
  "summary": "",
  "reasoning": []
}

Property facts:
${buildAppraisalFacts(property)}`;

    const rawResponse = await generateGroqText({
        systemPrompt,
        userPrompt,
        temperature: 0.2,
        maxTokens: 260,
        topP: 0.9
    });

    let parsed;
    try {
        parsed = JSON.parse(extractJsonBlock(rawResponse));
    } catch (error) {
        const parseError = new Error("AI appraisal returned invalid JSON");
        parseError.details = error.message;
        throw parseError;
    }

    const listedPrice = Math.round(safeNumber(property.price) || 0);
    const normalized = normalizeAppraisal(parsed, listedPrice);

    if (!normalized.fairPrice) {
        throw new Error("AI appraisal returned incomplete pricing data");
    }

    return normalized;
}

export async function generatePropertyPriceEstimate(property = {}) {
    if (!validatePropertyForPriceEstimate(property)) {
        return null;
    }

    const systemPrompt = "You are a real-estate valuation assistant for a Bangladesh property marketplace. Estimate fair pricing only in Bangladeshi Taka (BDT). Return strict JSON only.";
    const userPrompt = `Estimate a fair asking price for this property in BDT.

Rules:
- Return valid JSON only.
- Do not include markdown or code fences.
- All prices must be numeric BDT values without commas or currency symbols.
- estimatedPrice, minPrice, and maxPrice must be monthly BDT for rent listings and total BDT for sale listings.
- confidence must be one of: low, medium, high.
- reasoning must be an array of 2 to 4 short strings.
- Base your estimate on the provided facts only.

Return this exact JSON shape:
{
  "estimatedPrice": 0,
  "minPrice": 0,
  "maxPrice": 0,
  "confidence": "medium",
  "reasoning": []
}

Property facts:
${buildAppraisalFacts(property)}`;

    const rawResponse = await generateGroqText({
        systemPrompt,
        userPrompt,
        temperature: 0.2,
        maxTokens: 220,
        topP: 0.9
    });

    let parsed;
    try {
        parsed = JSON.parse(extractJsonBlock(rawResponse));
    } catch (error) {
        const parseError = new Error("AI price estimate returned invalid JSON");
        parseError.details = error.message;
        throw parseError;
    }

    const estimatedPrice = Math.max(0, Math.round(safeNumber(parsed?.estimatedPrice) || 0));
    const minPrice = Math.max(0, Math.round(safeNumber(parsed?.minPrice) || 0));
    const maxPrice = Math.max(0, Math.round(safeNumber(parsed?.maxPrice) || 0));
    const fallbackBase = estimatedPrice || minPrice || maxPrice || 0;
    const normalizedMin = minPrice || Math.max(0, Math.round(fallbackBase * 0.95));
    const normalizedMax = maxPrice || Math.max(normalizedMin, Math.round(fallbackBase * 1.05));

    if (!fallbackBase) {
        throw new Error("AI price estimate returned incomplete pricing data");
    }

    return {
        estimatedPrice: estimatedPrice || fallbackBase,
        minPrice: Math.min(normalizedMin, normalizedMax),
        maxPrice: Math.max(normalizedMin, normalizedMax),
        confidence: normalizeConfidence(parsed?.confidence),
        reasoning: normalizeReasoning(parsed?.reasoning),
        model: APPRAISAL_MODEL,
        currency: "BDT"
    };
}
