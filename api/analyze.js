export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur Vercel." });
  }

  // --- STRATÉGIE DE REBOND ÉTENDUE (FALLBACK) ---
  // Liste ordonnée des modèles à tester.
  // L'algorithme essaiera chaque configuration jusqu'à ce que l'une d'elles fonctionne.
  const modelsToTry = [
    // 1. Le standard rapide (v1beta pour le mode JSON natif)
    { id: "gemini-1.5-flash", version: "v1beta" },
    
    // 2. La nouvelle génération rapide (v1beta)
    { id: "gemini-2.0-flash-exp", version: "v1beta" },
    
    // 3. Fallback sur l'API stable v1 (si v1beta plante)
    { id: "gemini-1.5-flash", version: "v1" },
    
    // 4. Variante légère "8b" (souvent moins chargée)
    { id: "gemini-1.5-flash-8b", version: "v1beta" },
    
    // 5. Modèles plus puissants (mais plus lents/chers en quota)
    { id: "gemini-2.0-pro-exp-02-05", version: "v1beta" },
    { id: "gemini-1.5-pro", version: "v1beta" }
  ];

  const prompt = `Tu es un expert en recrutement. Analyse ce CV et extrais les données en JSON strict.
  
IMPORTANT : Ne réponds RIEN d'autre que l'objet JSON brut. Pas de markdown, pas de balises.

Structure JSON attendue :
{
  "profile": {
    "firstname": "Prénom",
    "lastname": "NOM",
    "current_role": "Intitulé du poste",
    "years_experience": "Années d'XP (ex: 5)",
    "main_tech": "Technologie principale",
    "summary": "Résumé..."
  },
  "experiences": [
    { 
      "client_name": "Entreprise", 
      "period": "Dates", 
      "role": "Rôle", 
      "context": "Contexte du projet", 
      "phases": "• Action 1\n• Action 2", 
      "tech_stack": ["Tech1", "Tech2"] 
    }
  ],
  "education": [ { "year": "Année", "degree": "Diplôme", "location": "Lieu" } ],
  "certifications": [ { "name": "Nom de la certif" } ],
  "skills_categories": { "Langages": [ { "name": "Java", "rating": 4 } ] }
}

Texte du CV : ${text}`;

  let lastError = null;

  // Boucle de tentative sur les différents modèles
  for (const config of modelsToTry) {
    try {
      console.log(`Tentative avec le modèle : ${config.id} (${config.version})...`);
      
      const apiUrl = `https://generativelanguage.googleapis.com/${config.version}/models/${config.id}:generateContent?key=${apiKey}`;
      
      // Construction dynamique du payload
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.1
        }
      };

      // AJUSTEMENT CRITIQUE : 'responseMimeType' cause une erreur 400 sur l'API 'v1' stable.
      // On ne l'ajoute que si on est sur 'v1beta'.
      if (config.version === "v1beta") {
        payload.generationConfig.responseMimeType = "application/json";
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Si erreur 429 (Quota), on arrête tout de suite (inutile de changer de modèle, c'est la clé qui est limitée)
      if (response.status === 429) {
        return res.status(429).json({ error: "Quota API dépassé (429). Veuillez attendre une minute." });
      }

      // Si ça passe, on traite
      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) throw new Error("Réponse vide de l'IA");

        // Nettoyage au cas où (l'API v1 renvoie souvent du markdown ```json)
        const cleanedContent = content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
          
        const jsonResult = JSON.parse(cleanedContent);

        console.log(`Succès avec ${config.id}`);
        return res.status(200).json(jsonResult);
      }

      // Si erreur (404, 500...), on capture le texte et on continue la boucle
      const errorText = await response.text();
      console.warn(`Échec avec ${config.id} (${response.status}): ${errorText}`);
      lastError = `Erreur ${response.status} sur ${config.id} (${config.version})`;

    } catch (error) {
      console.warn(`Exception avec ${config.id}:`, error.message);
      lastError = error.message;
      // On continue vers le prochain modèle
    }
  }

  // Si on arrive ici, c'est que tous les modèles ont échoué
  console.error("Tous les modèles ont échoué.");
  return res.status(500).json({ 
    error: "Impossible d'analyser le document après plusieurs tentatives.",
    details: lastError 
  });
}
