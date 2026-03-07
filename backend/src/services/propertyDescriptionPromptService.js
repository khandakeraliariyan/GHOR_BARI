// ========== TEXT FORMATTING UTILITIES ==========

/**
 * Compact text by trimming and removing extra whitespace
 * Ensures consistent text formatting in property descriptions
 * 
 * @param {string} value - Text to compact
 * @returns {string} Compacted text with single spaces
 */
function compactText(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
}


/**
 * Format amenity array as comma-separated string
 * Handles missing or invalid amenity arrays gracefully
 * 
 * @param {Array<string>} amenities - List of amenity names
 * 
 * @returns {string} Formatted amenities or "Not specified" if empty
 */
function formatAmenities(amenities = []) {

    // Return default if not an array or empty
    if (!Array.isArray(amenities) || amenities.length === 0) {
        return "Not specified";
    }

    // Compact and join amenities with commas
    return amenities.map(compactText).filter(Boolean).join(", ");

}


// ========== PROPERTY FACT BUILDER ==========

/**
 * Build property facts string from payload for prompt
 * Formats key property attributes for AI description generation
 * 
 * Extracts: title, listing type, property type, price, area, location, amenities
 * For flats: adds room and bathroom counts
 * For buildings: adds floor count and total units
 * 
 * @param {Object} payload - Property data object
 * @param {string} payload.title - Property listing title
 * @param {string} payload.listingType - 'sale' or 'rent'
 * @param {string} payload.propertyType - Type of property (flat, building, etc.)
 * @param {number} payload.price - Price in BDT
 * @param {number} payload.areaSqFt - Property area in square feet
 * @param {string} payload.divisionName - Bangladesh division name (e.g., 'Dhaka')
 * @param {string} payload.districtName - District name
 * @param {string} payload.upazilaName - Upazila/Thana name
 * @param {string} payload.address - Street or area name
 * @param {Array<string>} payload.amenities - List of amenities
 * @param {number} payload.roomCount - Number of rooms (if flat)
 * @param {number} payload.bathrooms - Number of bathrooms (if flat)
 * @param {number} payload.floorCount - Number of floors (if building)
 * @param {number} payload.totalUnits - Total units (if building)
 * 
 * @returns {string} Formatted property facts for LLM prompt
 */
function buildPropertyFacts(payload) {

    // Build core facts applicable to all properties
    const facts = [
        `Title: ${compactText(payload.title)}`,
        `Listing type: ${compactText(payload.listingType)}`,
        `Property type: ${compactText(payload.propertyType)}`,
        `Price in BDT: ${payload.price}`,
        `Area in square feet: ${payload.areaSqFt}`,
        `Division: ${compactText(payload.divisionName)}`,
        `District: ${compactText(payload.districtName)}`,
        `Upazila/Thana: ${compactText(payload.upazilaName)}`,
        `Street/Area: ${compactText(payload.address)}`,
        `Amenities: ${formatAmenities(payload.amenities)}`
    ];

    // Add apartment-specific facts
    if (payload.propertyType === "flat") {
        facts.push(`Rooms: ${payload.roomCount}`);
        facts.push(`Bathrooms: ${payload.bathrooms}`);
    }

    // Add building-specific facts
    if (payload.propertyType === "building") {
        facts.push(`Floor count: ${payload.floorCount}`);
        facts.push(`Total units: ${payload.totalUnits}`);
    }

    // Join facts with newlines for readable prompt format
    return facts.join("\n");

}


// ========== PAYLOAD VALIDATION ==========

/**
 * Validate property payload contains all required fields
 * Checks for required strings, valid numbers, and type-specific fields
 * 
 * @param {Object} payload - Property data to validate
 * 
 * @returns {string|null} Error message if validation fails, null if valid
 * 
 * @example
 * const error = validatePropertyDescriptionPayload(property);
 * if (error) {
 *   console.error(`Validation failed: ${error}`);
 * }
 */
export function validatePropertyDescriptionPayload(payload = {}) {

    // Define required string fields with error messages
    const requiredStringFields = [
        ["title", "Property title is required"],
        ["listingType", "Listing type is required"],
        ["propertyType", "Property type is required"],
        ["divisionName", "Division is required"],
        ["districtName", "District is required"],
        ["upazilaName", "Upazila/Thana is required"],
        ["address", "Street address is required"]
    ];

    // Validate each required string field
    for (const [field, message] of requiredStringFields) {
        if (!compactText(payload[field])) {
            return message;
        }
    }

    // Validate price is positive number
    if (!Number.isFinite(Number(payload.price)) || Number(payload.price) <= 0) {
        return "Valid price is required";
    }

    // Validate area is positive number
    if (!Number.isFinite(Number(payload.areaSqFt)) || Number(payload.areaSqFt) <= 0) {
        return "Valid area is required";
    }

    // Validate flat-specific fields
    if (payload.propertyType === "flat") {

        // Validate room count
        if (!Number.isFinite(Number(payload.roomCount)) || Number(payload.roomCount) < 1) {
            return "Valid room count is required";
        }

        // Validate bathroom count
        if (!Number.isFinite(Number(payload.bathrooms)) || Number(payload.bathrooms) < 1) {
            return "Valid bathroom count is required";
        }

    }

    // Validate building-specific fields
    if (payload.propertyType === "building") {

        // Validate floor count
        if (!Number.isFinite(Number(payload.floorCount)) || Number(payload.floorCount) < 1) {
            return "Valid floor count is required";
        }

        // Validate total units
        if (!Number.isFinite(Number(payload.totalUnits)) || Number(payload.totalUnits) < 1) {
            return "Valid total unit count is required";
        }

    }

    // All validations passed
    return null;

}


// ========== PROMPT GENERATION ==========

/**
 * Build AI prompt for property description generation
 * Creates dynamic prompt with property facts for LLM to generate marketplace description
 * 
 * Generated description will be:
 * - Exactly one paragraph
 * - 90-140 words long
 * - Professional and appealing
 * - Marketplace-ready (no markdown, emojis, hashtags)
 * - No invented features or details
 * - Reflective of sale vs. rent context
 * - With natural location mention
 * - Ending with call to action
 * 
 * @param {Object} payload - Property data for description generation
 *                          Must pass validation before calling this
 * 
 * @returns {string} Complete AI prompt for description generation
 * 
 * @example
 * const prompt = buildPropertyDescriptionPrompt({
 *   title: "Beautiful 3 BHK Apartment",
 *   listingType: "sale",
 *   propertyType: "flat",
 *   price: 2500000,
 *   areaSqFt: 1200,
 *   divisionName: "Dhaka",
 *   districtName: "Dhaka",
 *   upazilaName: "Gulshan",
 *   address: "Block J",
 *   amenities: ["gym", "parking", "pool"],
 *   roomCount: 3,
 *   bathrooms: 2
 * });
 * 
 * // Can then pass to AI model:
 * // const description = await generateGroqText({ userPrompt: prompt });
 */
export function buildPropertyDescriptionPrompt(payload) {

    return `Write a clean, attractive, marketplace-ready property description for a Bangladesh property platform.

Rules:
- Write exactly one paragraph.
- Keep it between 90 and 140 words.
- Be professional, clear, and appealing.
- Do not use markdown, bullet points, emojis, or hashtags.
- Do not invent features, locations, views, legal status, or amenities that are not provided.
- Reflect whether the property is for sale or rent.
- Mention the location naturally.
- End with a light call to action.

Property facts:
${buildPropertyFacts(payload)}`;

}
}
