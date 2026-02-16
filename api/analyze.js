export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur Vercel." });
  }

  // --- STRATÉGIE DE MODÈLES STABLES (D'après ta liste) ---
  // On utilise les versions "001" ou stables qui ont les quotas les plus élevés.
  const modelsToTry = [
    // 1. La version STABLE 2.5 (La plus performante et généreuse en quota)
    { id: "gemini-2.5-flash", version: "v1beta" },
    
    // 2. La version STABLE 2.0 (Backup très robuste)
    { id: "gemini-2.0-flash", version: "v1beta" },

    // 3. L'alias générique (pointe toujours vers la dernière version flash rapide)
    { id: "gemini-flash-latest", version: "v1beta" }
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
      "phases": "• Action 1\n• Action 2 (Liste à puces avec verbes d'action)", 
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
      console.log(`Tentative avec le modèle : ${config.id}...`);
      
      const apiUrl = `https://generativelanguage.googleapis.com/${config.version}/models/${config.id}:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            // On force le JSON car on est sur v1beta
            responseMimeType: "application/json",
            temperature: 0.1
          }
        })
      });

      // Si erreur de quota (429), on passe au modèle suivant (le 2.0 a son propre quota séparé du 2.5)
      if (response.status === 429) {
        console.warn(`Quota dépassé sur ${config.id}. Bascule...`);
        lastError = "Quota dépassé";
        continue; 
      }

      if (!response.ok) {
        throw new Error(`Erreur API ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) throw new Error("Réponse vide de l'IA");

      // Nettoyage
      const cleanedContent = content.replace(/```json|```/g, '').trim();
      const jsonResult = JSON.parse(cleanedContent);

      console.log(`Succès avec ${config.id}`);
      return res.status(200).json(jsonResult);

    } catch (error) {
      console.warn(`Exception avec ${config.id}:`, error.message);
      lastError = error.message;
      // On continue vers le prochain modèle
    }
  }

  // Si on arrive ici, c'est que tous les modèles ont échoué
  return res.status(500).json({ 
    error: "Service momentanément surchargé. Veuillez réessayer.",
    details: lastError 
  });
}
