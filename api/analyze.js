const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Clé API absente." });

  // On simplifie à l'extrême : une seule tentative sur le modèle le plus stable
  const config = { id: "gemini-1.5-flash", version: "v1" };

  const prompt = `Tu es un expert en recrutement. Analyse ce CV et extrais les données en JSON strict.
  REPONDS UNIQUEMENT PAR LE JSON BRUT. PAS DE TEXTE AVANT OU APRES.
  
  Structure : { "profile": {...}, "experiences": [...], "education": [...], "certifications": [...], "skills_categories": {} }
  Texte : ${text}`;

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/${config.version}/models/${config.id}:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 } 
      })
    });

    if (!response.ok) {
      throw new Error(`Statut API: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Nettoyage Markdown (indispensable sans responseMimeType)
    const jsonStr = content.replace(/```json|```/g, '').trim();
    const jsonResult = JSON.parse(jsonStr);

    return res.status(200).json(jsonResult);

  } catch (error) {
    console.error("Erreur critique :", error.message);
    return res.status(error.message.includes('429') ? 429 : 500).json({ 
      error: "L'IA est temporairement indisponible. Réessayez dans 2 minutes.",
      details: error.message 
    });
  }
}
