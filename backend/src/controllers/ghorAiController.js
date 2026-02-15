const SYSTEM_PROMPT = `You are "Ghor AI", a friendly and helpful AI assistant for GhorBari — a property buy/rent platform in Bangladesh. Your role is to help users with:
- Finding and choosing properties (buy or rent)
- Understanding areas, price ranges, and property types (flat, building, etc.)
- Tips on negotiations, paperwork, and dealing with owners
- General real estate advice for Bangladesh (e.g. locations, safety, amenities)
- How to use the GhorBari website (search, filters, applications, chat with owners)

Keep answers concise, practical, and in a helpful tone. Use simple language. If the user asks something outside property/real estate, you can briefly help but steer back to how GhorBari can assist. Do not make up specific listings or prices; suggest they use the site's search and filters.`;

export const chat = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(503).json({
                success: false,
                message: "Ghor AI is not set up yet. Add your Gemini API key in the server's .env as GEMINI_API_KEY (get one free at aistudio.google.com/app/apikey)."
            });
        }

        const { message } = req.body;
        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const userMessage = message.trim();
        const fullPrompt = `${SYSTEM_PROMPT}\n\n---\nUser question: ${userMessage}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
        const fetchResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }]
            })
        });

        const data = await fetchResponse.json();

        if (!fetchResponse.ok) {
            const errMsg = data?.error?.message || fetchResponse.statusText || "Gemini request failed";
            console.error("Gemini API error:", data?.error || errMsg);
            return res.status(502).json({
                success: false,
                message: "Ghor AI is temporarily unavailable. Try again later."
            });
        }

        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I couldn't generate a response. Please try again.";

        return res.status(200).json({
            success: true,
            reply: text
        });
    } catch (error) {
        console.error("Ghor AI chat error:", error);
        return res.status(500).json({
            success: false,
            message: "Ghor AI is temporarily unavailable. Try again later."
        });
    }
};
