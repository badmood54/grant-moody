// COPY THIS TEXT AND SAVE AS: api/gemini.js
export default async function handler(req, res) {
    // 1. Security Check: Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Wave functions require POST.' });
    }

    // 2. Pull the highly secure hidden key from Vercel's Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ 
            error: 'Uplink Severed', 
            details: 'The GEMINI_API_KEY environment variable is not set in the Vercel dashboard.' 
        });
    }

    // 3. Unpack the user's prompt and the system instructions sent from the HTML frontend
    const { prompt, systemInstructionText } = req.body;

    // 4. THE FIX: Pointing specifically to the standard public model
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

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'Google API Error', 
                details: data.error?.message || 'Unknown Error' 
            });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error decoding wave pattern.";
        
        // 5. Send the successful transmission back to the frontend
        res.status(200).json({ text });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
