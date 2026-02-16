// Fonction pour espacer les tentatives et éviter l'erreur 429 (Too Many Requests)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée." });
  }

  // --- CONFIGURATION 2026 : MODÈLES ET CANAUX ---
  const modelsToTry = [
    // 1. Priorité au 1.5 Flash sur le canal STABLE (v1) pour éviter le 404
    { id: "gemini-1.5-flash", version: "v1" }, 
    
    // 2. Secours sur le 2.0 Flash (v1beta)
    { id: "gemini-2.0-flash", version: "v1beta" },

    // 3. Dernier recours sur le 2.5 (v1beta)
    { id: "gemini-2.5-flash-preview-09-2025", version: "v1beta" }
  ];

  const prompt = `Tu es un expert en recrutement. Analyse ce CV et extrais les données en JSON strict.
  
Structure JSON attendue :
{
  "profile": { "firstname": "Prénom", "lastname": "NOM", "current_role": "Poste", "years_experience": "XP", "main_tech": "Tech", "summary": "Résumé" },
  "experiences": [ { "client_name": "Entreprise", "period": "Dates", "role": "Rôle", "context": "Contexte", "phases": "Actions", "tech_stack": [] } ],
  "education": [], "certifications": [], "skills_categories": {}
}

Texte du CV : ${text}`;

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
            responseMimeType: "application/json",
            temperature: 0.1
          }
        })
      });

      // Si erreur de quota (429) ou introuvable (404), on attend et on passe au suivant
      if (response.status === 429 || response.status === 404 || response.status === 403) {
        const errorText = await response.text();
        console.warn(`Échec ${config.id} (${response.status}).`);
        lastError = `${config.id}: ${response.status}`;
        
        // PAUSE : On attend 1.5 seconde pour laisser respirer l'API avant le prochain modèle
        await sleep(1500); 
        continue; 
      }

      if (!response.ok) throw new Error(`Erreur API ${response.status}`);

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error("Réponse vide");

      const jsonResult = JSON.parse(content.replace(/```json|```/g, '').trim());
      console.log(`Succès avec ${config.id}`);
      return res.status(200).json(jsonResult);

    } catch (error) {
      console.error(`Erreur sur ${config.id}:`, error.message);
      lastError = error.message;
      await sleep(1000);
    }
  }

  return res.status(500).json({ error: "Tous les modèles ont échoué.", details: lastError });
}
