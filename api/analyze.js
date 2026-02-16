const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Clé API absente." });

  // --- STRATÉGIE DE BASCULE BASÉE SUR VOTRE LISTE JSON ---
  const modelsToTry = [
    { id: "gemini-2.5-flash", version: "v1" },      // 1. Votre modèle principal stable
    { id: "gemini-2.0-flash", version: "v1" },      // 2. Bascule sur la version 2.0 (quota différent)
    { id: "gemini-flash-latest", version: "v1" },   // 3. Bascule sur l'alias dynamique
    { id: "gemini-2.0-flash-lite", version: "v1" }  // 4. Modèle ultra-léger (souvent très permissif)
  ];

  const prompt = `Tu es un expert en recrutement. Analyse ce CV et extrais les données en JSON strict.
  Structure : { "profile": {...}, "experiences": [...], "education": [...], "certifications": [...], "skills_categories": {} }
  Texte : ${text}`;

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Tentative avec ${model.id}...`);
      const apiUrl = `https://generativelanguage.googleapis.com/${model.version}/models/${model.id}:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      });

      // Si erreur 429 (Quota), on attend un peu et on passe au modèle suivant
      if (response.status === 429) {
        console.warn(`Quota atteint pour ${model.id}. Bascule en cours...`);
        lastError = "Erreur 429 (Quota)";
        await sleep(1500); // Pause de sécurité
        continue;
      }

      if (!response.ok) {
        lastError = `Erreur ${response.status}`;
        continue;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      // Nettoyage Markdown obligatoire sans responseMimeType
      const jsonStr = content.replace(/```json|```/g, '').trim();
      const jsonResult = JSON.parse(jsonStr);

      console.log(`Succès avec ${model.id}`);
      return res.status(200).json(jsonResult);

    } catch (error) {
      lastError = error.message;
      await sleep(1000);
    }
  }

  return res.status(500).json({ 
    error: "Tous les modèles sont saturés ou indisponibles.", 
    details: lastError 
  });
}
