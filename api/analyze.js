export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur Vercel." });
  }

  const prompt = `Agis comme un expert en recrutement. Analyse ce texte de CV et retourne un objet JSON structuré respectant EXACTEMENT ce schéma :
{
  "profile": {
    "firstname": "Prénom",
    "lastname": "NOM",
    "current_role": "Poste",
    "years_experience": "Nombre",
    "main_tech": "Techno principale",
    "summary": "Résumé de 5 lignes max sans puces"
  },
  "experiences": [
    { "client_name": "Nom", "period": "Dates", "role": "Poste", "context": "Contexte", "phases": "Réalisations sous forme de puces •", "tech_stack": ["Tag1", "Tag2"] }
  ],
  "education": [ { "year": "Dates", "degree": "Diplôme", "location": "Ville" } ],
  "certifications": [ { "name": "Nom" } ],
  "skills_categories": { "Catégorie": [ { "name": "Skill", "rating": 5 } ] }
}

Texte du CV : ${text}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`Google API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("Réponse vide de l'IA");
    }

    // On renvoie directement l'objet JSON extrait
    return res.status(200).json(JSON.parse(content));

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de l'analyse : " + error.message });
  }
}
