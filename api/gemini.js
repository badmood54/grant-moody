export default async function handler(req, res) {
    // Only allow POST requests from our frontend
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Wave functions require POST.' });
    }

    // Pull the highly secure hidden key from Vercel's Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ 
            error: 'Uplink Severed', 
            details: 'The GEMINI_API_KEY environment variable is not set in the Vercel dashboard.' 
        });
    }

    // Unpack the user's prompt and the system instructions sent from the HTML frontend
    const { prompt, systemInstructionText } = req.body;

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstructionText }] }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: 'Wave API Error', details: errorData });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error decoding wave pattern.";
        
        // Send the successful transmission back to the frontend
        res.status(200).json({ text });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
