export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur Vercel." });
  }

  // CORRECTION APPLIQUÉE : 
  // 1. Modèle : gemini-1.5-flash (Stable, rapide, 15 RPM gratuit)
  // 2. Endpoint : v1 (Stable) au lieu de v1beta pour éviter les erreurs 404 "Model not found"
  const modelId = "gemini-1.5-flash"; 
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`;

  // Prompt optimisé pour le formatage JSON strict
  const prompt = `Tu es un expert en recrutement. Analyse ce CV et extrais les données en JSON strict.
  
Règles de formatage IMPORTANTES :
1. "profile.summary" : Un paragraphe unique, clair et percutant (Max 7 lignes). Pas de liste à puces.
2. "experiences[].phases" : Une liste à puces commençant par des verbes d'action (ex: "• Pilotage de...", "• Développement de...").
3. Respecte scrupuleusement la structure JSON ci-dessous.

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
        generationConfig: { 
          responseMimeType: "application/json",
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
      
      // Si le modèle n'est pas trouvé (404), on renvoie une erreur explicite
      if (response.status === 404) {
         return res.status(404).json({ error: "Modèle IA introuvable sur l'API v1. Vérifiez que Gemini 1.5 Flash est actif." });
      }

      return res.status(response.status).json({ error: `Erreur Google API (${response.status})`, details: errorText });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("L'IA n'a renvoyé aucun contenu.");
    }

    const cleanedContent = content.replace(/```json|```/g, '').trim();
    
    return res.status(200).json(JSON.parse(cleanedContent));

  } catch (error) {
    console.error("Analyze Handler Error:", error);
    return res.status(500).json({ 
      error: "Erreur serveur lors de l'analyse. Vérifiez le format du CV." 
    });
  }
}
