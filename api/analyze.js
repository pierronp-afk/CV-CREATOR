export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Clé API absente sur Vercel." });

  const modelId = "gemini-1.5-flash";
  // On prépare les deux URLs possibles pour éviter le 404
  const urls = [
    `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`
  ];

  const prompt = `Tu es un expert en recrutement. Analyse ce CV et extrais les données en JSON strict.
  REPONDS UNIQUEMENT PAR LE JSON BRUT. PAS DE TEXTE AVANT OU APRES.
  Structure : { "profile": {...}, "experiences": [...], "education": [...], "certifications": [...], "skills_categories": {} }
  Texte : ${text}`;

  let lastError = null;

  for (const url of urls) {
    try {
      console.log(`Tentative d'appel API...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 } 
        })
      });

      if (response.status === 404) {
        console.warn("URL non trouvée, tentative sur la route alternative...");
        continue; // Passe à l'URL suivante (v1 -> v1beta)
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) throw new Error("Réponse vide de l'IA");

      // Nettoyage Markdown (indispensable)
      const jsonStr = content.replace(/```json|```/g, '').trim();
      const jsonResult = JSON.parse(jsonStr);

      console.log("Succès de l'analyse !");
      return res.status(200).json(jsonResult);

    } catch (error) {
      lastError = error.message;
      console.error("Erreur durant la tentative :", lastError);
    }
  }

  return res.status(500).json({ 
    error: "L'analyse a échoué.", 
    details: lastError 
  });
}
