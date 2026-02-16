export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur Vercel." });
  }

  // --- STRATÉGIE MISE À JOUR : PRIORITÉ 1.5 LATEST ---
  const modelsToTry = [
    // PRIORITÉ 1 : La version 1.5 la plus stable (Canal v1)
    { id: "gemini-1.5-flash-latest", version: "v1" }, 

    // PRIORITÉ 2 : Secours sur le 1.5 Pro (Plus intelligent pour les CV complexes)
    { id: "gemini-1.5-pro-latest", version: "v1" },

    // PRIORITÉ 3 : Repli sur la branche 2.x si le 1.5 est indisponible
    { id: "gemini-2.5-flash-preview-09-2025", version: "v1beta" }
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
    "summary": "Résumé court (7 lignes max)"
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

  for (const config of modelsToTry) {
    try {
      console.log(`Tentative avec le modèle : ${config.id} (${config.version})...`);
      
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

      // Gestion des erreurs de quota ou de modèle introuvable
      if (response.status === 429 || response.status === 403 || response.status === 404) {
        const msg = await response.text();
        console.warn(`Échec ${config.id} (Erreur ${response.status}). Bascule...`);
        lastError = `Erreur ${response.status} sur ${config.id}`;
        continue; 
      }

      if (!response.ok) {
        throw new Error(`Erreur API ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) throw new Error("Réponse vide");

      // Nettoyage et parsing
      const cleanedContent = content.replace(/```json|```/g, '').trim();
      const jsonResult = JSON.parse(cleanedContent);

      console.log(`Succès confirmé avec ${config.id}`);
      return res.status(200).json(jsonResult);

    } catch (error) {
      console.warn(`Exception sur ${config.id}:`, error.message);
      lastError = error.message;
    }
  }

  return res.status(500).json({ 
    error: "Tous les modèles ont échoué.",
    details: lastError 
  });
}
