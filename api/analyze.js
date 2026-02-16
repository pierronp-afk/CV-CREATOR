export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur Vercel." });
  }

  // ON RESTE SUR V1 (STABLE) car v1beta posait problème de 404 chez vous
  const modelId = "gemini-1.5-flash"; 
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`;

  // Prompt renforcé pour exiger du JSON brut car on ne peut pas utiliser le mode 'json' natif en v1
  const prompt = `Tu es un expert en recrutement. Analyse ce CV et extrais les données en JSON strict.
  
IMPORTANT : Ne réponds RIEN d'autre que l'objet JSON. Pas de "Voici le JSON", pas de balises markdown. Juste le JSON brut.

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

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // CORRECTION : Suppression de 'responseMimeType' qui cause l'erreur 400 sur l'API v1
        generationConfig: { 
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API Response Error:", errorText);
      
      if (response.status === 429) {
        return res.status(429).json({ error: "Trop de requêtes à l'IA (Quota dépassé). Attendez 1 minute." });
      }

      return res.status(response.status).json({ error: `Erreur Google API (${response.status})`, details: errorText });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("L'IA n'a renvoyé aucun contenu.");
    }

    // Nettoyage manuel des balises markdown (```json ... ```) car l'IA en met souvent même sans le mode forcé
    const cleanedContent = content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    return res.status(200).json(JSON.parse(cleanedContent));

  } catch (error) {
    console.error("Analyze Handler Error:", error);
    // Gestion spécifique si le JSON est mal formé par l'IA
    if (error instanceof SyntaxError) {
       return res.status(500).json({ error: "L'IA a renvoyé un format invalide. Réessayez." });
    }
    return res.status(500).json({ 
      error: "Erreur serveur : " + error.message 
    });
  }
}
