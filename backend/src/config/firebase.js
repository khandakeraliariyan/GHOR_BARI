import admin from "firebase-admin";
import { createRequire } from "module";


// Load Firebase service account credentials
const require = createRequire(import.meta.url);
const serviceAccount = require("../../ghor-bari-firebase-admin-sdk.json");


/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials for backend authentication
 */
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


export default admin;