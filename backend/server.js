import app from "./src/app.js";

import { connectDatabase } from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

async function startServer() {

    try {
        
        await connectDatabase();

        app.listen(PORT, () => {

            console.log(`🏠 GhorBari server is running at http://localhost:${PORT}`);

        });

    } catch (error) {

        console.error("❌ Server startup failed:", error.message);

        process.exit(1);

    }
}

startServer();
