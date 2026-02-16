const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Clé API absente sur Vercel." });

  // Ordre de priorité pour 2026 : Stable d'abord, Beta ensuite
  const modelsToTry = [
    { id: "gemini-1.5-flash", version: "v1" },      // Stable (évite 404)
    { id: "gemini-2.0-flash", version: "v1beta" }   // Backup rapide
  ];

  // Prompt renforcé pour le formatage sans erreur 400
  const prompt = `Tu es un expert en recrutement. Analyse ce CV et extrais les données en JSON strict.
  
  IMPORTANT : Ta réponse doit être uniquement l'objet JSON brut. 
  N'inclus aucun texte explicatif avant ou après le JSON. 
  Si tu utilises des balises Markdown ( \`\`\`json ), assure-toi de bien les fermer.

  Structure JSON :
  {
    "profile": { "firstname": "Prénom", "lastname": "NOM", "current_role": "Poste", "years_experience": "XP", "main_tech": "Tech", "summary": "Résumé" },
    "experiences": [ { "client_name": "Entreprise", "period": "Dates", "role": "Rôle", "context": "Contexte", "phases": "Actions", "tech_stack": [] } ],
    "education": [], 
    "certifications": [], 
    "skills_categories": {}
  }

  Texte du CV à analyser : ${text}`;

  let lastError = null;

  for (const config of modelsToTry) {
    try {
      console.log(`Tentative avec : ${config.id} (${config.version})...`);
      const apiUrl = `https://generativelanguage.googleapis.com/${config.version}/models/${config.id}:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.1, // Basse température pour plus de rigueur sur le JSON
          }
        })
      });

      // Gestion des erreurs de quota ou de syntaxe
      if (!response.ok) {
        const errorDetail = await response.text();
        console.warn(`Échec ${config.id} : Erreur ${response.status}`);
        lastError = `Modèle ${config.id} a renvoyé ${response.status}`;
        
        // Pause de sécurité pour réinitialiser le quota
        await sleep(2000); 
        continue;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) throw new Error("Réponse de l'IA vide.");

      // Nettoyage du JSON (enlève le texte superflu et les balises markdown)
      const jsonStr = content.replace(/```json|```/g, '').trim();
      const jsonResult = JSON.parse(jsonStr);

      console.log(`Succès avec ${config.id} !`);
      return res.status(200).json(jsonResult);

    } catch (e) {
      console.error(`Exception sur ${config.id}:`, e.message);
      lastError = e.message;
      await sleep(1000);
    }
  }

  return res.status(500).json({ 
    error: "L'analyse a échoué après plusieurs tentatives.", 
    details: lastError 
  });
}
