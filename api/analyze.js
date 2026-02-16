const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Clé API manquante." });

  const modelsToTry = [
    { id: "gemini-1.5-flash", version: "v1" },
    { id: "gemini-2.0-flash", version: "v1beta" }
  ];

  const prompt = `Tu es un expert en recrutement. Analyse ce CV et extrais les données en JSON strict.
  REPONDS UNIQUEMENT PAR LE JSON BRUT. PAS DE TEXTE AVANT OU APRES.
  
  Structure : { "profile": {...}, "experiences": [...], "education": [...], "certifications": [...], "skills_categories": {} }
  Texte : ${text}`;

  let lastError = null;

  for (const config of modelsToTry) {
    try {
      console.log(`Tentative avec : ${config.id}...`);
      const apiUrl = `https://generativelanguage.googleapis.com/${config.version}/models/${config.id}:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.1 
            // On a supprimé responseMimeType pour supprimer l'erreur 400
          }
        })
      });

      if (!response.ok) {
        lastError = `Erreur ${response.status}`;
        await sleep(2000); // Pause anti-429
        continue;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      // Nettoyage Markdown
      const jsonStr = content.replace(/```json|```/g, '').trim();
      const jsonResult = JSON.parse(jsonStr);

      console.log(`SUCCÈS avec ${config.id}`);
      return res.status(200).json(jsonResult);
    } catch (e) {
      lastError = e.message;
      await sleep(1000);
    }
  }

  return res.status(500).json({ error: "Échec", details: lastError });
}
