export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur Vercel. Vérifiez la variable GOOGLE_API_KEY." });
  }

  // Modèle 2.5 Flash Preview comme demandé
  const modelId = "gemini-2.5-flash-preview-09-2025";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const prompt = `Agis comme un expert en recrutement. Analyse ce texte de CV et retourne uniquement un objet JSON (sans texte avant ou après) respectant ce schéma :
{
  "profile": {
    "firstname": "Prénom",
    "lastname": "NOM",
    "current_role": "Poste",
    "years_experience": "Nombre",
    "main_tech": "Techno principale",
    "summary": "Résumé de 5 lignes max"
  },
  "experiences": [
    { "client_name": "Nom", "period": "Dates", "role": "Poste", "context": "Contexte", "phases": "Réalisations", "tech_stack": ["Tag1"] }
  ],
  "education": [ { "year": "Dates", "degree": "Diplôme", "location": "Ville" } ],
  "certifications": [ { "name": "Nom" } ],
  "skills_categories": { "Langages": [ { "name": "Skill", "rating": 5 } ] }
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
      // Si on reçoit une 404 ici, c'est que le modèle spécifié n'est pas accessible avec cette clé
      return res.status(response.status).json({ error: `Erreur Google API ${response.status}`, details: errorText });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("L'IA n'a renvoyé aucun contenu exploitable.");
    }

    return res.status(200).json(JSON.parse(content));

  } catch (error) {
    console.error("Analyze Handler Error:", error);
    return res.status(500).json({ 
      error: "Erreur serveur lors de l'analyse : " + error.message 
    });
  }
}
