import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Download, Plus, Trash2, MoveUp, MoveDown, 
  Upload, X, Briefcase, GraduationCap, User, Hexagon, Cpu, 
  Image as ImageIcon, ZoomIn, ZoomOut, Search, LayoutTemplate, 
  Save, FolderOpen, Eye, Shield, Check, Edit2,
  Bold, List, Copy, HelpCircle, RefreshCw, Cloud, Mail, Printer
} from 'lucide-react';

// --- THEME & UTILS ---
const THEME = { primary: "#2E86C1", bg: "#FFFFFF" };

const formatTextForPreview = (text) => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/&lt;b&gt;/g, "<b>").replace(/&lt;\/b&gt;/g, "</b>")
    .replace(/\n/g, "<br/>");
};

const chunkArray = (array, size) => {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) chunked.push(array.slice(i, i + size));
  return chunked;
};

// --- COMPOSANTS STRUCTURELLES ---
const A4Page = ({ children, isActive, id }) => (
  <div 
    id={id}
    className={`bg-white relative overflow-hidden mx-auto transition-all duration-500 ${
      isActive ? "ring-8 ring-blue-500/30 scale-100 shadow-2xl" : "opacity-40 scale-95 shadow-sm"
    }`}
    style={{ 
      width: '210mm', 
      height: '297mm', 
      marginBottom: '40px',
      pageBreakAfter: 'always'
    }}
  >
    {children}
  </div>
);

const CornerTriangle = ({ customLogo }) => (
  <div className="absolute top-0 left-0 w-[120px] h-[120px] z-20">
    <div className="absolute top-0 left-0 w-full h-full bg-[#2E86C1]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
    {customLogo ? (
      <img src={customLogo} className="absolute top-[15px] left-[15px] w-[50px] h-[50px] object-contain brightness-0 invert" style={{ transform: 'rotate(-45deg)' }} />
    ) : (
      <span className="absolute top-[30px] left-[25px] text-white font-black text-xl italic -rotate-45">SMILE</span>
    )}
  </div>
);

const Footer = () => (
  <div className="absolute bottom-8 left-12 right-12 border-t border-slate-100 pt-4 flex justify-between items-center">
    <div className="text-[8px] font-bold text-[#999999] uppercase">Smile - IT is Open <span className="text-[#2E86C1] ml-1">CRÉATEUR D'EXPÉRIENCE DIGITALE OUVERTE</span></div>
    <div className="text-[8px] font-bold text-[#333333]">#MadeWithSmile</div>
  </div>
);

const HeaderSmall = ({ name, role }) => (
  <div className="flex justify-between items-start border-b-2 border-[#2E86C1] pb-4 pt-10 px-12 mt-8">
    <div className="w-10 h-10"></div>
    <div className="text-right">
      <h3 className="text-sm font-bold text-[#333333] uppercase">{name}</h3>
      <p className="text-[10px] font-bold text-[#999999] uppercase">{role}</p>
    </div>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [step, setStep] = useState(1);
  const [zoom, setZoom] = useState(0.45);
  const [cvData, setCvData] = useState(/* ... charger tes données ici ... */);

  // Découpage des expériences (ex: 2 par page)
  const experienceChunks = chunkArray(cvData.experiences, 2);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      
      {/* COLONNE GAUCHE : FORMULAIRE */}
      <div className="w-[500px] bg-white border-r shadow-xl z-10 flex flex-col print:hidden">
        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
          <h1 className="font-bold text-[#2E86C1]">SMILE EDITOR</h1>
          <div className="flex gap-2">
            <button onClick={() => setStep(s => Math.max(1, s-1))} className="p-2 bg-white border rounded"><ArrowLeft size={16}/></button>
            <span className="text-sm font-bold self-center">Page {step}</span>
            <button onClick={() => setStep(s => Math.min(4, s+1))} className="p-2 bg-white border rounded"><ArrowRight size={16}/></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
           {/* Ton contenu de formulaire par étape ici (déjà présent dans ton code) */}
           {step === 1 && <div>{/* Form Profil */}</div>}
           {/* ... etc ... */}
        </div>
        
        <div className="p-6 border-t">
          <button onClick={() => window.print()} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold flex justify-center gap-2">
            <Printer size={18}/> Imprimer le CV complet
          </button>
        </div>
      </div>

      {/* COLONNE DROITE : PREVIEW A4 */}
      <div className="flex-1 overflow-auto bg-slate-800 p-12 flex flex-col items-center custom-scrollbar">
        
        <div className="flex flex-col gap-10 origin-top transition-transform" style={{ transform: `scale(${zoom})` }}>
          
          {/* PAGE 1 : PROFIL & SOFT SKILLS (Étapes 1 & 2) */}
          <A4Page isActive={step === 1 || step === 2} id="page-1">
            <CornerTriangle customLogo={cvData.smileLogo} />
            <div className="pt-32 px-20">
              <h1 className="text-6xl font-black text-[#333333] uppercase leading-tight">{cvData.profile.firstname} {cvData.profile.lastname}</h1>
              <div className="inline-block bg-[#2E86C1] text-white font-bold text-xl px-4 py-2 mt-4 uppercase">
                {cvData.profile.years_experience} ans d'expérience
              </div>
              <h2 className="text-3xl font-bold text-[#333333] mt-12 uppercase tracking-wide">{cvData.profile.current_role}</h2>
              <div className="mt-10 p-8 border-l-4 border-[#2E86C1] bg-slate-50">
                <p className="text-xl italic text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{__html: formatTextForPreview(cvData.profile.summary)}}></p>
              </div>
            </div>

            {/* Soft Skills Section */}
            <div className="mt-20 flex justify-center gap-12">
               {cvData.soft_skills.map((skill, i) => (
                 <div key={i} className="relative w-40 h-44 flex items-center justify-center">
                    <Hexagon className="absolute w-full h-full text-[#2E86C1] fill-current shadow-lg" />
                    <span className="relative z-10 text-white font-bold text-sm uppercase text-center px-4">{skill}</span>
                 </div>
               ))}
            </div>
            <Footer />
          </A4Page>

          {/* PAGE 2 : FORMATION & SKILLS (Étape 3) */}
          <A4Page isActive={step === 3} id="page-2">
            <CornerTriangle customLogo={cvData.smileLogo} />
            <HeaderSmall name={`${cvData.profile.firstname} ${cvData.profile.lastname}`} role={cvData.profile.current_role} />
            <div className="grid grid-cols-12 gap-10 px-16 mt-16">
              <div className="col-span-5">
                <h3 className="text-xl font-bold text-[#2E86C1] uppercase mb-8 flex items-center gap-2"><GraduationCap/> Formation</h3>
                {cvData.education.map((edu, i) => (
                  <div key={i} className="mb-6">
                    <div className="text-sm font-bold text-[#2E86C1]">{edu.year}</div>
                    <div className="text-md font-bold text-[#333333] uppercase">{edu.degree}</div>
                    <div className="text-sm text-slate-500">{edu.location}</div>
                  </div>
                ))}
              </div>
              <div className="col-span-7">
                <h3 className="text-xl font-bold text-[#2E86C1] uppercase mb-8 flex items-center gap-2"><Cpu/> Compétences</h3>
                {Object.entries(cvData.skills_categories).map(([cat, skills]) => (
                  <div key={cat} className="mb-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase border-b mb-3">{cat}</div>
                    <div className="grid grid-cols-1 gap-2">
                      {skills.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm font-bold">{s.name}</span>
                          <div className="flex gap-1">
                             {[1,2,3,4,5].map(v => <div key={v} className={`w-2 h-2 rotate-45 ${v <= s.rating ? 'bg-[#2E86C1]' : 'bg-slate-200'}`} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Footer />
          </A4Page>

          {/* PAGES 3+ : EXPÉRIENCES (Étape 4) */}
          {experienceChunks.map((chunk, pageIdx) => (
            <A4Page key={pageIdx} isActive={step === 4} id={`page-xp-${pageIdx}`}>
              <CornerTriangle customLogo={cvData.smileLogo} />
              <HeaderSmall name={`${cvData.profile.firstname} ${cvData.profile.lastname}`} role={cvData.profile.current_role} />
              <div className="px-16 mt-12">
                <h3 className="text-xl font-bold text-[#2E86C1] uppercase border-b-2 border-slate-100 pb-2 mb-8">
                  {pageIdx === 0 ? "Expériences Professionnelles" : "Expériences (suite)"}
                </h3>
                {chunk.map(exp => (
                  <div key={exp.id} className="mb-12 grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                      <div className="w-16 h-16 border rounded bg-white flex items-center justify-center p-2">
                        {exp.client_logo ? <img src={exp.client_logo} className="max-h-full" /> : <Briefcase className="text-slate-200"/>}
                      </div>
                    </div>
                    <div className="col-span-10 border-l pl-6">
                       <div className="flex justify-between items-baseline">
                         <h4 className="text-lg font-bold uppercase">{exp.client_name} <span className="font-light text-slate-400">| {exp.role}</span></h4>
                         <span className="text-xs font-bold text-[#2E86C1]">{exp.period}</span>
                       </div>
                       <div className="mt-4">
                         <h5 className="text-[10px] font-bold text-[#2E86C1] uppercase">Objectif</h5>
                         <p className="text-sm text-slate-600" dangerouslySetInnerHTML={{__html: formatTextForPreview(exp.objective)}}></p>
                       </div>
                       <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
                         <div>
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase">Réalisation</h5>
                            <p className="text-xs" dangerouslySetInnerHTML={{__html: formatTextForPreview(exp.phases)}}></p>
                         </div>
                         <div>
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase">Environnement</h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                               {exp.tech_stack.map((t, i) => <span key={i} className="text-[9px] bg-slate-100 px-2 py-0.5 rounded font-bold text-[#2E86C1]">{t}</span>)}
                            </div>
                         </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
              <Footer />
            </A4Page>
          ))}
          
        </div>

        {/* CONTROLES DE ZOOM */}
        <div className="fixed bottom-8 right-8 bg-white p-2 rounded-full shadow-2xl flex items-center gap-4 px-6 border">
          <button onClick={() => setZoom(z => Math.max(0.2, z-0.1))}><ZoomOut size={20}/></button>
          <span className="text-sm font-bold w-12 text-center">{Math.round(zoom*100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.5, z+0.1))}><ZoomIn size={20}/></button>
        </div>
      </div>
      
      {/* CSS PRINT STICT */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print-hidden, button, .z-10 { display: none !important; }
          .flex-1 { overflow: visible !important; display: block !important; padding: 0 !important; }
          .bg-slate-800 { background: white !important; }
          .scale-95, .opacity-40, .ring-8 { transform: scale(1) !important; opacity: 1 !important; ring: 0 !important; box-shadow: none !important; }
          .A4-page { margin: 0 !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}
