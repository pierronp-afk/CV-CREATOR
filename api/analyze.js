export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur Vercel." });
  }

  // CORRECTION : Utilisation du modèle 1.5 Flash (Stable & Quotas élevés)
  // Le modèle 2.5 a un quota de 3 RPM qui cause les erreurs 429
  const modelId = "gemini-1.5-flash"; 
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  // Prompt optimisé pour le formatage demandé
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
      
      // Gestion spécifique de l'erreur 429 (Trop de requêtes)
      if (response.status === 429) {
        return res.status(429).json({ error: "Trop de requêtes à l'IA (Quota dépassé). Attendez 1 minute et réessayez." });
      }
      
      return res.status(response.status).json({ error: `Erreur Google API (${response.status})`, details: errorText });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("L'IA n'a renvoyé aucun contenu.");
    }

    // Nettoyage au cas où l'IA renverrait des balises markdown
    const cleanedContent = content.replace(/```json|```/g, '').trim();
    
    return res.status(200).json(JSON.parse(cleanedContent));

  } catch (error) {
    console.error("Analyze Handler Error:", error);
    return res.status(500).json({ 
      error: "Erreur serveur lors de l'analyse. Vérifiez le format du CV." 
    });
  }
}
