export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur Vercel." });
  }

  // --- STRATÉGIE DE CONTOURNEMENT DES ERREURS 403/429 ---
  // Nous définissons une liste de priorité.
  // 1. On tente le modèle demandé (2.5 Flash).
  // 2. S'il échoue (Quota, Droits, Introuvable), on bascule automatiquement sur le 1.5 Flash qui est plus permissif.
  const modelsToTry = [
    // PRIORITÉ 1 : Le modèle que vous voulez utiliser (Attention: Quota très faible ~3 RPM)
    { id: "gemini-2.5-flash-preview-09-2025", version: "v1beta" },
    
    // PRIORITÉ 2 : La version expérimentale 2.0 (Souvent disponible quand la 2.5 bloque)
    { id: "gemini-2.0-flash-exp", version: "v1beta" },

    // PRIORITÉ 3 : Le "Sauveur" (Stable, 15 RPM, fonctionne toujours en secours)
    { id: "gemini-1.5-flash", version: "v1beta" }
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
      console.log(`Tentative avec le modèle : ${config.id} (${config.version})...`);
      
      const apiUrl = `https://generativelanguage.googleapis.com/${config.version}/models/${config.id}:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            // On force le JSON car on est sur v1beta pour tous les modèles listés ici
            responseMimeType: "application/json",
            temperature: 0.1
          }
        })
      });

      // Si erreur 429 (Too Many Requests) ou 403 (Forbidden), on passe au modèle suivant
      if (response.status === 429 || response.status === 403 || response.status === 404) {
        const msg = await response.text();
        console.warn(`Échec ${config.id} (Erreur ${response.status}): ${msg}. Bascule sur le modèle suivant...`);
        lastError = `Le modèle ${config.id} a bloqué (${response.status})`;
        continue; // On force la boucle à essayer le suivant
      }

      if (!response.ok) {
        throw new Error(`Erreur API ${response.status}: ${await response.text()}`);
      }

      // Si ça passe, on traite
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

  // Si on arrive ici, c'est que TOUS les modèles (2.5, 2.0 et 1.5) ont échoué
  console.error("Tous les modèles ont échoué.");
  return res.status(500).json({ 
    error: "Service surchargé. Veuillez réessayer dans une minute.",
    details: lastError 
  });
}
