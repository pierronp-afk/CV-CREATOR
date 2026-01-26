export default async function handler(req, res) {
  // 1. Récupération de la clé stockée en sécurité sur Vercel
  const apiKey = process.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur." });
  }

  // 2. Récupération du texte envoyé par le CV
  const { text, type } = JSON.parse(req.body);

  // 3. Construction du Prompt
  const contextPrompt = type === "bullet" 
    ? "Reformule cette réalisation pour un CV (action + résultat). Sois direct, professionnel. PAS de markdown, PAS de gras, PAS de guillemets. Juste le texte :" 
    : "Reformule ce résumé pour un CV consultant. Ton corporate et percutant. Donne UNIQUEMENT le résultat final sans phrase d'intro. PAS de markdown (**), PAS de gras. Texte :";

  try {
    // 4. Appel sécurisé à Google Gemini depuis le serveur
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${contextPrompt} "${text}"` }] }]
      })
    });

    const data = await response.json();
    let cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text || text;

    // 5. Nettoyage
    cleanText = cleanText
      .replace(/\*\*/g, '') 
      .replace(/^"|"$/g, '') 
      .replace(/^Voici.*?:\s*/i, '')
      .trim();

    // 6. Envoi de la réponse propre au site
    res.status(200).json({ result: cleanText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la génération" });
  }
}
