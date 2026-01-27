import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Plus, Trash2, Briefcase, GraduationCap, 
  User, Hexagon, Cpu, ImageIcon, ZoomIn, ZoomOut, Search, 
  LayoutTemplate, Save, FolderOpen, Printer, Bold, List, Cloud, Mail, RefreshCw
} from 'lucide-react';

// --- DONNÉES PAR DÉFAUT ---
const DEFAULT_CV_DATA = {
  isAnonymous: false,
  smileLogo: null, 
  profile: {
    firstname: "Prénom",
    lastname: "NOM",
    years_experience: "5",
    current_role: "Poste",
    main_tech: "Techno principale",
    summary: "Forte expérience en gestion de projet Drupal et dans l'accompagnement de nos clients.",
    photo: null, 
    tech_logos: []
  },
  soft_skills: ["Autonomie", "Rigueur", "Communication"],
  experiences: [
    {
      id: 1,
      client_name: "Client Exemple",
      client_logo: null,
      period: "Jan 2023 - Présent",
      role: "Développeur",
      objective: "Objectif de la mission...",
      tech_stack: ["React", "NodeJS"],
      phases: "Conception, Développement"
    }
  ],
  education: [{ year: "2020", degree: "Master", location: "Ville" }],
  skills_categories: {
    "Langages": [{ name: "JavaScript", rating: 5 }],
    "Outils": [{ name: "Docker", rating: 4 }]
  }
};

// --- HELPERS ---
const formatTextForPreview = (text) => {
  if (!text) return "";
  return text.replace(/\n/g, "<br/>").replace(/<b>/g, "<strong>").replace(/<\/b>/g, "</strong>");
};

const chunkArray = (array, size) => {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) chunked.push(array.slice(i, i + size));
  return chunked;
};

// --- COMPOSANTS UI ---
const A4Page = ({ children, isActive }) => (
  <div 
    className={`bg-white relative overflow-hidden mx-auto transition-all duration-500 shadow-2xl ${
      isActive ? "ring-8 ring-blue-500/30 scale-100" : "opacity-30 scale-95"
    }`}
    style={{ width: '210mm', height: '297mm', marginBottom: '40px' }}
  >
    {children}
  </div>
);

const Footer = () => (
  <div className="absolute bottom-8 left-12 right-12 border-t border-slate-100 pt-4 flex justify-between items-center bg-white">
    <div className="text-[8px] font-bold text-[#999999] uppercase">Smile - IT is Open <span className="text-[#2E86C1] ml-1">CRÉATEUR D'EXPÉRIENCE DIGITALE OUVERTE</span></div>
    <div className="text-[8px] font-bold text-[#333333]">#MadeWithSmile</div>
  </div>
);

const CornerTriangle = ({ customLogo }) => (
  <div className="absolute top-0 left-0 w-[120px] h-[120px] z-20">
    <div className="absolute top-0 left-0 w-full h-full bg-[#2E86C1]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
    <span className="absolute top-[30px] left-[25px] text-white font-black text-xl italic -rotate-45">SMILE</span>
  </div>
);

// --- APP ---
export default function App() {
  const [step, setStep] = useState(1);
  const [zoom, setZoom] = useState(0.45);
  const [cvData, setCvData] = useState(() => {
    const saved = localStorage.getItem('smile_cv_data');
    return saved ? JSON.parse(saved) : DEFAULT_CV_DATA;
  });

  useEffect(() => {
    localStorage.setItem('smile_cv_data', JSON.stringify(cvData));
  }, [cvData]);

  const experienceChunks = chunkArray(cvData.experiences, 2);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* GAUCHE: FORMULAIRE */}
      <div className="w-[450px] bg-white border-r shadow-xl flex flex-col z-10 print:hidden">
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
          <h1 className="font-bold text-[#2E86C1]">SMILE EDITOR</h1>
          <div className="flex gap-2">
            <button onClick={() => setStep(s => Math.max(1, s-1))} className="p-2 border rounded bg-white hover:bg-slate-100"><ArrowLeft size={16}/></button>
            <button onClick={() => setStep(s => Math.min(4, s+1))} className="p-2 border rounded bg-white hover:bg-slate-100"><ArrowRight size={16}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-6">Étape {step} sur 4</h2>
          {step === 1 && (
            <div className="space-y-4">
              <input className="w-full p-3 border rounded" placeholder="Prénom" value={cvData.profile.firstname} onChange={e => setCvData({...cvData, profile: {...cvData.profile, firstname: e.target.value}})} />
              <input className="w-full p-3 border rounded" placeholder="Nom" value={cvData.profile.lastname} onChange={e => setCvData({...cvData, profile: {...cvData.profile, lastname: e.target.value}})} />
              <textarea className="w-full p-3 border rounded h-32" placeholder="Résumé" value={cvData.profile.summary} onChange={e => setCvData({...cvData, profile: {...cvData.profile, summary: e.target.value}})} />
            </div>
          )}
          {/* ... Ajouter les autres champs pour step 2, 3, 4 ... */}
        </div>

        <div className="p-6 border-t bg-slate-50">
          <button onClick={() => window.print()} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold flex justify-center gap-2 hover:bg-black transition-colors">
            <Printer size={18}/> Imprimer PDF
          </button>
        </div>
      </div>

      {/* DROITE: PREVIEW */}
      <div className="flex-1 bg-slate-800 overflow-y-auto p-12 flex flex-col items-center">
        <div className="origin-top transition-transform duration-300 flex flex-col gap-10" style={{ transform: `scale(${zoom})` }}>
          
          {/* PAGE 1: PROFIL (Étapes 1-2) */}
          <A4Page isActive={step === 1 || step === 2}>
            <CornerTriangle />
            <div className="pt-32 px-20">
              <h1 className="text-6xl font-black text-[#333333] uppercase leading-tight">{cvData.profile.firstname} {cvData.profile.lastname}</h1>
              <div className="inline-block bg-[#2E86C1] text-white font-bold text-xl px-4 py-2 mt-4 uppercase">{cvData.profile.years_experience} ans d'expérience</div>
              <div className="mt-12 text-3xl font-bold uppercase">{cvData.profile.current_role}</div>
              <p className="mt-10 text-xl italic text-slate-600 leading-relaxed border-l-4 border-[#2E86C1] pl-6" dangerouslySetInnerHTML={{__html: formatTextForPreview(cvData.profile.summary)}} />
              
              <div className="mt-20 flex justify-center gap-10">
                {cvData.soft_skills.map((s, i) => (
                  <div key={i} className="w-32 h-32 relative flex items-center justify-center">
                    <Hexagon className="absolute w-full h-full text-[#2E86C1] fill-current" />
                    <span className="relative z-10 text-white font-bold text-xs uppercase text-center px-2">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <Footer />
          </A4Page>

          {/* PAGE 2: FORMATION (Étape 3) */}
          <A4Page isActive={step === 3}>
            <CornerTriangle />
            <div className="p-20 mt-20">
              <h3 className="text-2xl font-bold text-[#2E86C1] uppercase border-b-2 pb-2 mb-10">Formation & Compétences</h3>
              {cvData.education.map((edu, i) => (
                <div key={i} className="mb-6">
                  <div className="font-bold text-[#2E86C1]">{edu.year}</div>
                  <div className="text-lg font-bold uppercase">{edu.degree}</div>
                  <div className="text-slate-500">{edu.location}</div>
                </div>
              ))}
            </div>
            <Footer />
          </A4Page>

          {/* PAGES 3+: EXPERIENCES (Étape 4) */}
          {experienceChunks.map((chunk, idx) => (
            <A4Page key={idx} isActive={step === 4}>
              <CornerTriangle />
              <div className="p-20 mt-20">
                <h3 className="text-2xl font-bold text-[#2E86C1] uppercase border-b-2 pb-2 mb-10">Expériences {idx > 0 && "(Suite)"}</h3>
                {chunk.map(exp => (
                  <div key={exp.id} className="mb-10 border-l-2 border-slate-100 pl-6">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="uppercase">{exp.client_name} - {exp.role}</span>
                      <span className="text-[#2E86C1]">{exp.period}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{exp.objective}</p>
                  </div>
                ))}
              </div>
              <Footer />
            </A4Page>
          ))}

        </div>

        {/* CONTROLES ZOOM */}
        <div className="fixed bottom-8 right-8 bg-white p-2 rounded-full shadow-2xl flex items-center gap-4 px-6 border print:hidden">
          <button onClick={() => setZoom(z => Math.max(0.3, z-0.1))}><ZoomOut size={20}/></button>
          <span className="text-sm font-bold w-12 text-center">{Math.round(zoom*100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.2, z+0.1))}><ZoomIn size={20}/></button>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          .print\\:hidden { display: none !important; }
          body { background: white; }
          .flex-1 { overflow: visible !important; background: white !important; padding: 0 !important; }
          .origin-top { transform: scale(1) !important; gap: 0 !important; }
          .opacity-30 { opacity: 1 !important; scale: 1 !important; }
        }
      `}</style>
    </div>
  );
}
