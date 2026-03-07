import { getDatabase } from "../config/db.js";


// ========== NID REGISTRY SERVICE ==========

/**
 * NID Registry Service - External NID Verification
 * 
 * Acts as a dummy external NID server/registry for Bangladesh NID verification.
 * Uses a dedicated MongoDB collection "nids" to store verified NID records.
 * 
 * In production, this could integrate with actual government NID APIs
 * to verify National ID numbers from Bangladesh BBS (Bangladesh Bureau of Statistics)
 * 
 * Example NID document in "nids" collection:
 * {
 *   _id: ObjectId("..."),
 *   nidNumber: "1234567890",     // National ID number (REQUIRED, UNIQUE)
 *   fullName: "John Doe",        // Person's full name (optional, for reference)
 *   dateOfBirth: "1990-01-01",   // Date of birth ISO 8601 format (optional)
 *   address: "Dhaka, Bangladesh" // Registered address (optional)
 * }
 */

/**
 * Collection name for storing NID records in MongoDB
 * @constant {string}
 */
const COLLECTION_NAME = "nids";


// ========== NID LOOKUP ==========

/**
 * Find NID record by National ID number
 * 
 * Searches the NID registry for a matching NID number.
 * Performs basic validation and trimming on input.
 * Returns exact document if found, null otherwise.
 * 
 * @param {string} nidNumber - National ID number to look up (will be trimmed)
 * 
 * @returns {Promise<Object|null>} NID document if found, null if not found or invalid input
 * @returns {string} result.nidNumber - The verified NID number
 * @returns {string} result.fullName - Person's full name (if available)
 * @returns {string} result.dateOfBirth - Date of birth ISO 8601 (if available)
 * @returns {string} result.address - Registered address (if available)
 * 
 * @example
 * // Find existing NID
 * const nidRecord = await findByNidNumber("1234567890");
 * if (nidRecord) {
 *   console.log(`Found: ${nidRecord.fullName}`);
 * } else {
 *   console.log("NID not registered");
 * }
 * 
 * @example
 * // Invalid input returns null (no error thrown)
 * const result = await findByNidNumber("  ");  // null
 * const result = await findByNidNumber(null);  // null
 * const result = await findByNidNumber(12345); // null (not string)
 */
export async function findByNidNumber(nidNumber) {

    // Validate input is non-empty string
    if (!nidNumber || typeof nidNumber !== "string") {
        return null;
    }

    // Get database connection
    const db = getDatabase();

    // Trim whitespace from input
    const trimmed = nidNumber.trim();

    // Return null if becomes empty after trimming
    if (!trimmed) {
        return null;
    }

    // Query NID collection for exact match
    const record = await db.collection(COLLECTION_NAME).findOne({
        nidNumber: trimmed,
    });

    // Return found document or null
    return record;

}

