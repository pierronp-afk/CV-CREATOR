export const config = {
  runtime: 'edge', // Optimisé pour la rapidité sur Vercel
};

export default async function handler(req) {
  // 1. Sécurité : Vérifier la méthode
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    // 2. Récupérer la clé secrète côté serveur
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Configuration serveur incomplète : GOOGLE_API_KEY manquante.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Lire le corps de la requête (le texte du PDF envoyé par le front)
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Aucun texte fourni.' }), { status: 400 });
    }

    // 4. Définir le Prompt Système (Déplacé ici pour la sécurité et la propreté)
    const systemPrompt = `Tu es un expert en analyse de CV. Tu reçois du texte extrait d'un PDF. 
    TA MISSION : Transformer ce texte en un JSON valide.
    RÈGLES D'EXTRACTION CRITIQUES :
    1. EXHAUSTIVITÉ ABSOLUE : Tu dois extraire TOUTES les expériences professionnelles mentionnées dans le texte, sans exception.
    2. DÉTAILS : Sépare bien le contexte du projet, l'objectif principal et les réalisations (phases).
    3. STRUCTURE DU JSON : Respecte strictement ce schéma :
    {
      "profile": { "firstname": "", "lastname": "", "years_experience": "", "current_role": "", "main_tech": "", "summary": "" },
      "soft_skills": ["3 max"],
      "connaissances_sectorielles": [],
      "education": [{ "year": "", "degree": "", "location": "" }],
      "certifications": [{ "name": "Nom Certification", "logo": "" }],
      "skills_categories": { 
          "Langages": [{ "name": "Java", "rating": 3 }], 
          "Frameworks": [{ "name": "Spring", "rating": 3 }],
          "Outils": [{ "name": "Git", "rating": 3 }]
      },
      "experiences": [{ 
          "client_name": "", 
          "period": "", 
          "role": "", 
          "context": "Contexte du projet (équipe, enjeux...)", 
          "objective": "Objectif de la mission", 
          "phases": "Détail des réalisations et tâches techniques", 
          "tech_stack": [] 
      }]
    }
    4. QUALITÉ : Si une donnée est absente, laisse une chaîne vide "". Pour "years_experience", n'extrais que le nombre entier.`;

    // 5. Appeler l'API Google Gemini depuis le SERVEUR
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Texte intégral du CV à traiter : ${text}` }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { 
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
          temperature: 0.1
        }
      })
    });

    const data = await response.json();

    // 6. Renvoyer la réponse de Google au Frontend
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Erreur API:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
