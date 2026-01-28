import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Download, Plus, Trash2, MoveUp, MoveDown, 
  Upload, X, Briefcase, GraduationCap, User, Hexagon, Cpu, 
  Image as ImageIcon, ZoomIn, ZoomOut, Search, LayoutTemplate, 
  Save, FolderOpen, Eye, Shield, Check, Edit2,
  Bold, List, Copy, HelpCircle, RefreshCw, Cloud, Mail, Printer,
  ChevronUp, ChevronDown, Award, Factory, ToggleLeft, ToggleRight, FilePlus,
  FileSearch, Loader2, Lock, Sparkles, Wand2
} from 'lucide-react';

// --- CONFIGURATION & THÈME ---
const THEME = {
  primary: "#2E86C1", 
  secondary: "#006898", 
  textDark: "#333333", 
  textGrey: "#666666", 
  bg: "#FFFFFF"
};

// Sécurisation de l'accès à la clé pour éviter les crashs si import.meta n'est pas dispo
const getApiKey = () => {
  try {
    // @ts-ignore
    return import.meta.env?.VITE_GOOGLE_API_KEY || "";
  } catch (e) {
    return "";
  }
};
const apiKey = getApiKey();

const getIconUrl = (slug) => `https://cdn.simpleicons.org/${String(slug || '').toLowerCase().trim().split(' ')[0]}/white`;
const getBrandIconUrl = (slug) => `https://cdn.simpleicons.org/${String(slug || '').toLowerCase().trim().split(' ')[0]}`;

// --- DONNÉES PAR DÉFAUT ---
const DEFAULT_CV_DATA = {
  isAnonymous: false,
  showSecteur: true,
  showCertif: true,
  smileLogo: null, 
  profile: {
    firstname: "Prénom",
    lastname: "NOM",
    years_experience: "5",
    current_role: "Poste de Consultant",
    main_tech: "Techno principale",
    summary: "Forte expérience en gestion de projet Drupal et dans l'accompagnement de nos clients.",
    photo: null, 
    tech_logos: [
      { type: 'url', src: 'https://cdn.simpleicons.org/php/white', name: 'PHP' },
      { type: 'url', src: 'https://cdn.simpleicons.org/drupal/white', name: 'Drupal' },
      { type: 'url', src: 'https://cdn.simpleicons.org/symfony/white', name: 'Symfony' }
    ]
  },
  soft_skills: ["Agilité", "Rigueur", "Communication"],
  connaissances_sectorielles: ["Industrie", "E-commerce"],
  certifications: [{ name: "Drupal certified", logo: "https://cdn.simpleicons.org/drupal/white" }],
  experiences: [
    {
      id: 1,
      client_name: "Disney",
      client_logo: null,
      period: "Jan 2023 - Présent",
      role: "Développeur Frontend",
      objective: "Développer la partie frontend de l'outil Castresa...",
      phases: "Conception, Développement",
      tech_stack: ["Drupal", "Twig"],
      forceNewPage: false
    }
  ],
  education: [{ year: "2008/2010", degree: "Master Miage", location: "Orléans" }],
  skills_categories: {
    "Langages": [{ name: "JAVA", rating: 4 }, { name: "PHP", rating: 5 }],
    "Outils": [{ name: "Jira", rating: 5 }]
  }
};

// --- HELPERS ---
const formatTextForPreview = (text) => {
  if (!text) return "";
  return String(text)
    .replace(/</g, "&lt;").replace(/>/g, "&gt;") 
    .replace(/&lt;b&gt;/g, "<b>").replace(/&lt;\/b&gt;/g, "</b>") 
    .replace(/\n/g, "<br/>"); 
};

const paginateExperiences = (experiences) => {
  if (!Array.isArray(experiences)) return [];
  const pages = [];
  let currentPage = [];
  experiences.forEach((exp) => {
    if (exp.forceNewPage && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [exp];
    } else if (currentPage.length === 2) {
      pages.push(currentPage);
      currentPage = [exp];
    } else {
      currentPage.push(exp);
    }
  });
  if (currentPage.length > 0) pages.push(currentPage);
  return pages;
};

// --- COMPOSANTS UI ATOMIQUES ---

const HexagonRating = ({ score, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 100 100" onClick={onChange ? () => onChange(i) : undefined} className={`w-3 h-3 ${onChange ? 'cursor-pointer hover:scale-125 transition-transform' : ''} ${i <= score ? 'text-[#2E86C1] fill-current' : 'text-slate-200 fill-current'}`}>
        <polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" />
      </svg>
    ))}
  </div>
);

const ButtonUI = ({ children, onClick, variant = "primary", className = "", disabled = false, title = "" }) => {
  const variants = {
    primary: "bg-[#2E86C1] text-white hover:bg-[#2573a7] shadow-md",
    secondary: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    outline: "border-2 border-[#2E86C1] text-[#2E86C1] hover:bg-blue-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 p-2",
    ghost: "text-slate-500 hover:bg-slate-100",
    toolbar: "p-1.5 hover:bg-slate-200 rounded text-slate-600"
  };
  return <button onClick={onClick} disabled={disabled} title={title} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 justify-center ${variants[variant] || variants.primary} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>{children}</button>;
};

const InputUI = ({ label, value, onChange, placeholder, maxLength, type = "text" }) => (
  <div className="mb-4 text-left">
    <div className="flex justify-between items-baseline mb-1">
      <label className="text-xs font-bold text-[#333333] uppercase tracking-wide">{String(label)}</label>
      {maxLength && <span className={`text-[10px] ${String(value || '').length > maxLength ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{String(value || '').length} / {maxLength}</span>}
    </div>
    <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] text-sm text-[#333333] transition-all" />
  </div>
);

const RichTextareaUI = ({ label, value, onChange, placeholder, maxLength }) => {
  const textareaRef = useRef(null);

  const handleTextChange = (e) => {
    const val = e.target.value;
    const lines = val.split('\n');
    if (lines.length > 25) return; 
    onChange(val);
  };

  const insertTag = (tag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    if (tag === 'b') {
      onChange(`${before}<b>${selected}</b>${after}`);
    } else if (tag === 'list') {
      if (start !== end) {
        const bulletedLines = selected.split('\n').map(line => 
          line.trim() === "" ? line : (line.startsWith('• ') ? line : `• ${line}`)
        ).join('\n');
        onChange(before + bulletedLines + after);
      } else {
        onChange(`${before}• ${after}`);
      }
    }
  };

  const copyToClipboard = (url) => {
    if (value) {
      const prompt = "Agis comme un expert Smile. Reformule ce texte pour un CV de consultant. Ton 'corporate', direct. Corrige les fautes. PAS de markdown. Texte : \n";
      // Méthode compatible iframe
      const textArea = document.createElement("textarea");
      textArea.value = prompt + value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    window.open(url, '_blank');
  };

  const currentLines = String(value || '').split('\n').length;
  
  const llmTools = [
    { name: 'ChatGPT', url: 'https://chat.openai.com/', icon: 'openai' },
    { name: 'Gemini', url: 'https://gemini.google.com/', icon: 'googlegemini' },
    { name: 'Claude', url: 'https://claude.ai/', icon: 'anthropic/000000' }
  ];

  return (
    <div className="mb-6 text-left">
      <div className="flex justify-between items-end mb-1">
        <label className="text-xs font-bold text-[#333333] uppercase block">{String(label)}</label>
        <div className="flex items-center gap-1 bg-white px-2 py-1 border border-slate-200 rounded-t-lg shadow-sm">
           <ButtonUI variant="toolbar" onClick={() => insertTag('b')} title="Gras"><Bold size={12}/></ButtonUI>
           <ButtonUI variant="toolbar" onClick={() => insertTag('list')} title="Puce"><List size={12}/></ButtonUI>
           <div className="w-px h-3 bg-slate-300 mx-1"></div>
           <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">IA:</span>
           {llmTools.map((tool) => (
             <button key={tool.name} onClick={() => copyToClipboard(tool.url)} className="p-1 hover:bg-slate-100 rounded grayscale hover:grayscale-0 opacity-70 hover:opacity-100" title={`Copier & Ouvrir ${tool.name}`}>
               <img src={getBrandIconUrl(tool.icon)} className="w-4 h-4" alt={tool.name} />
             </button>
           ))}
        </div>
      </div>
      <textarea ref={textareaRef} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg rounded-tr-none text-sm h-32 resize-none focus:outline-none shadow-inner" value={value || ''} onChange={handleTextChange} maxLength={maxLength} placeholder={placeholder} />
      <span className={`text-[9px] font-bold block mt-1 ${currentLines >= 25 ? 'text-red-500' : 'text-slate-400'}`}>{currentLines} / 25 lignes conseillées</span>
    </div>
  );
};

const DropZoneUI = ({ onFile, label = "Fichier", icon = <Upload size={16}/>, className = "" }) => {
  const inputRef = useRef(null);
  return (
    <div className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 ${className} border-slate-300 bg-white hover:border-[#2E86C1] hover:bg-slate-50`} onClick={() => inputRef.current.click()}>
      <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      <div className="text-[#2E86C1]">{icon}</div>
      <span className="text-[10px] font-bold uppercase text-slate-500">{String(label)}</span>
    </div>
  );
};

const LogoSelectorUI = ({ onSelect, label = "Ajouter" }) => {
  const [search, setSearch] = useState("");
  const handleSearch = () => { if (search) onSelect({ type: 'url', src: getIconUrl(search), name: search }); setSearch(""); };
  // Ajout du DropZone pour les logos/certifs personnalisés
  const handleFile = (file) => { if (file) { const reader = new FileReader(); reader.onload = (ev) => onSelect({ type: 'file', src: ev.target.result, name: file.name.split('.')[0] }); reader.readAsDataURL(file); }};

  return (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-inner text-left">
      {label && <label className="text-[10px] font-bold text-[#333333] uppercase block mb-2">{String(label)}</label>}
      <div className="flex gap-2 mb-2">
        <input className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs" placeholder="Ex: Drupal" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        <ButtonUI variant="primary" className="px-2 py-1 h-auto" onClick={handleSearch}><Plus size={12}/></ButtonUI>
      </div>
      <div className="text-center text-[9px] text-slate-400 mb-2 font-bold uppercase">- OU -</div>
      <DropZoneUI onFile={handleFile} label="Glisser Image" icon={<Upload size={14}/>} />
    </div>
  );
};

// --- COMPOSANTS DE STRUCTURE PDF ---

const A4Page = ({ children, className = "" }) => (
  <div className={`A4-page bg-white relative overflow-hidden mx-auto shadow-2xl flex-shrink-0 ${className}`} style={{ width: '210mm', height: '297mm', marginBottom: '40px', display: 'flex', flexDirection: 'column' }}>
    {children}
  </div>
);

const CornerTriangle = ({ customLogo }) => (
  <div className="absolute top-0 left-0 w-[170px] h-[170px] z-50 pointer-events-none print:w-[150px] print:h-[150px]">
    <div className="absolute top-0 left-0 w-full h-full bg-[#2E86C1]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
    {customLogo && (
      <div className="absolute top-[12px] left-[12px] w-[100px] h-[100px] flex items-center justify-center">
         <img src={customLogo} className="max-w-full max-h-full object-contain brightness-0 invert" style={{ transform: 'rotate(-45deg)' }} alt="Logo" />
      </div>
    )}
  </div>
);

const HeaderSmall = ({ isAnonymous, profile, role }) => {
  const nameDisplay = isAnonymous 
    ? `${String(profile?.firstname?.[0] || '')}${String(profile?.lastname?.[0] || '')}`
    : `${String(profile?.firstname || '')} ${String(profile?.lastname || '')}`;
  return (
    <div className="flex justify-between items-start border-b-2 border-[#2E86C1] pb-4 pt-10 px-12 mt-8 flex-shrink-0">
      <div><div className="w-10 h-10"></div></div>
      <div className="text-right">
        <h3 className="text-sm font-bold text-[#333333] uppercase">{String(nameDisplay)}</h3>
        <p className="text-[10px] font-bold text-[#999999] uppercase">{String(role || '')}</p>
      </div>
    </div>
  );
};

const Footer = () => (
  <div className="absolute bottom-8 left-12 right-12 border-t border-slate-100 pt-4 flex justify-between items-center bg-white flex-shrink-0 text-[8px] font-bold">
    <div className="text-[#999999] uppercase tracking-widest">Smile - IT is Open <span className="text-[#2E86C1] ml-1">CRÉATEUR D'EXPÉRIENCE DIGITALE OUVERTE</span></div>
    <div className="text-[8px] font-bold text-[#333333]">#MadeWithSmile</div>
  </div>
);

const ExperienceItem = ({ exp }) => (
  <div className="grid grid-cols-12 gap-6 mb-8 break-inside-avoid print:break-inside-avoid">
    <div className="col-span-2 flex flex-col items-center pt-2 text-center">
      {exp.client_logo && (
        <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-white mb-2 p-1">
          <img src={exp.client_logo} className="max-w-full max-h-full object-contain" alt="Logo Client" />
        </div>
      )}
      <span className="text-[10px] font-bold text-[#333333] uppercase leading-tight">{String(exp.client_name || '')}</span>
    </div>
    <div className="col-span-10 border-l border-slate-100 pl-6 pb-4">
      <div className="flex justify-between items-baseline mb-3">
         <h4 className="text-lg font-bold text-[#333333] uppercase">{String(exp.client_name || '')} <span className="font-normal text-[#666666]">| {String(exp.role || '')}</span></h4>
         <span className="text-xs font-bold text-[#2E86C1] uppercase">{String(exp.period || '')}</span>
      </div>
      {exp.objective && (
        <div className="mb-4">
           <h5 className="text-[10px] font-bold text-[#2E86C1] uppercase mb-1 text-left">Objectif</h5>
           <p className="text-sm text-[#333333] leading-relaxed break-words text-left" dangerouslySetInnerHTML={{__html: formatTextForPreview(exp.objective)}}></p>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-slate-50 space-y-4 text-left">
         <div><h5 className="text-[10px] font-bold text-[#999999] uppercase mb-1 text-left">Réalisation</h5><p className="text-xs font-medium text-[#333333] break-words text-left" dangerouslySetInnerHTML={{__html: formatTextForPreview(exp.phases)}}></p></div>
         <div><h5 className="text-[10px] font-bold text-[#999999] uppercase mb-1 text-left">Environnement</h5><div className="flex flex-wrap gap-1">{(Array.isArray(exp.tech_stack) ? exp.tech_stack : []).map((t, i) => <span key={i} className="text-xs font-bold text-[#2E86C1] bg-blue-50 px-2 py-0.5 rounded">{String(t)}</span>)}</div></div>
      </div>
    </div>
  </div>
);

// --- APP PRINCIPALE ---

export default function App() {
  const [step, setStep] = useState(1);
  const [zoom, setZoom] = useState(0.55);
  const [isImporting, setIsImporting] = useState(false);
  const jsonInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [newSecteur, setNewSecteur] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSkillsInput, setNewSkillsInput] = useState({});

  const [cvData, setCvData] = useState(() => {
    try {
      const saved = localStorage.getItem('smile_cv_data_final_v32_stable');
      if (saved) return JSON.parse(saved);
    } catch(e) { console.error(e); }
    return DEFAULT_CV_DATA;
  });

  useEffect(() => { localStorage.setItem('smile_cv_data_final_v32_stable', JSON.stringify(cvData)); }, [cvData]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => { 
      // @ts-ignore
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; 
    };
    document.head.appendChild(script);
  }, []);

  const getFilenameBase = () => {
    const year = new Date().getFullYear();
    const clean = (str) => String(str || "").replace(/[^a-z0-9]/gi, '_').toUpperCase();
    return `CV ${year} - ${clean(cvData.profile.lastname)} - ${clean(cvData.profile.firstname)}`;
  };

  useEffect(() => { document.title = getFilenameBase(); }, [cvData.profile]);

  // --- ACTIONS ---
  const resetCV = () => { if (confirm("Réinitialiser tout le CV ?")) setCvData(DEFAULT_CV_DATA); };
  
  const uploadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { try { setCvData(JSON.parse(String(ev.target.result))); } catch (err) { alert("Format invalide"); } };
    reader.readAsText(file);
  };

  const downloadJSON = () => {
    const a = document.createElement('a');
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cvData));
    a.download = `${getFilenameBase()}.json`;
    a.click();
  };

  const handlePDFImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!apiKey) { alert("Clé API non configurée."); return; }
    setIsImporting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // @ts-ignore
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let rawText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        rawText += textContent.items.map(it => it.str).join(" ") + "\n";
      }
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyse ce CV et renvoie uniquement un JSON structuré (profile, experiences, education, soft_skills) : ${rawText}` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResult) {
        const result = JSON.parse(textResult);
        setCvData(prev => ({ ...prev, ...result, profile: { ...prev.profile, ...result.profile } }));
      }
    } catch (err) { alert("Import échoué."); }
    finally { setIsImporting(false); }
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    const content = document.querySelector('.print-container').innerHTML;
    const styles = document.querySelector('style').innerHTML;
    printWindow.document.write(`<html><head><title>${getFilenameBase()}</title><script src="https://cdn.tailwindcss.com"></script><style>${styles}</style><style>@page{size:A4;margin:0}body{margin:0;padding:0;width:210mm}.A4-page{box-shadow:none!important;margin:0!important;page-break-after:always; height: auto !important; min-height: 297mm;}* {-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}</style></head><body onload="window.print();window.close()"><div class="flex flex-col">${content}</div></body></html>`);
    printWindow.document.close();
  };

  // State modifiers
  const handleProfileChange = (f, v) => setCvData(p => ({ ...p, profile: { ...p.profile, [f]: v } }));
  const handlePhotoUpload = (file) => { if(file) { const reader = new FileReader(); reader.onload = (ev) => setCvData(prev => ({...prev, profile: { ...prev.profile, photo: ev.target.result }})); reader.readAsDataURL(file); } };
  const addTechLogo = (o) => setCvData(p => ({ ...p, profile: { ...p.profile, tech_logos: [...(p.profile.tech_logos || []), o] } }));
  const removeTechLogo = (i) => setCvData(p => ({ ...p, profile: { ...p.profile, tech_logos: p.profile.tech_logos.filter((_, idx) => idx !== i) } }));
  const handleSmileLogo = (f) => { if(f) { const r = new FileReader(); r.onload = (ev) => setCvData(p => ({...p, smileLogo: ev.target.result})); r.readAsDataURL(f); } };
  const updateExperience = (id, f, v) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, [f]: v } : e) }));
  const moveExperience = (index, direction) => { const newExp = [...cvData.experiences]; const target = direction === 'up' ? index - 1 : index + 1; if (target >= 0 && target < newExp.length) { [newExp[index], newExp[target]] = [newExp[target], newExp[index]]; setCvData({ ...cvData, experiences: newExp }); } };
  const addExperience = () => setCvData(p => ({ ...p, experiences: [{ id: Date.now(), client_name: "", client_logo: null, period: "", role: "", objective: "", phases: "", tech_stack: [] }, ...p.experiences] }));
  const removeExperience = (id) => setCvData(p => ({ ...p, experiences: p.experiences.filter(e => e.id !== id) }));
  
  const addSecteur = () => { if (newSecteur) { setCvData(p => ({ ...p, connaissances_sectorielles: [...(p.connaissances_sectorielles||[]), newSecteur] })); setNewSecteur(""); }};
  const removeSecteur = (idx) => setCvData(p => ({ ...p, connaissances_sectorielles: p.connaissances_sectorielles.filter((_, i) => i !== idx) }));
  const addCertification = (o) => setCvData(p => ({ ...p, certifications: [...(p.certifications||[]), { name: o.name, logo: o.src }] }));
  const removeCertification = (idx) => setCvData(p => ({ ...p, certifications: p.certifications.filter((_, i) => i !== idx) }));
  const updateCertification = (idx, field, val) => { const certs = [...cvData.certifications]; certs[idx][field] = val; setCvData({ ...cvData, certifications: certs }); };

  const addSkillCategory = () => { if (newCategoryName) { setCvData(p => ({ ...p, skills_categories: { ...p.skills_categories, [newCategoryName]: [] } })); setNewCategoryName(""); } };
  const deleteCategory = (cat) => setCvData(p => { const newC = { ...p.skills_categories }; delete newC[cat]; return { ...p, skills_categories: newC }; });
  const updateSkillInCategory = (cat, idx, f, v) => setCvData(p => { const s = [...p.skills_categories[cat]]; s[idx] = { ...s[idx], [f]: v }; return { ...p, skills_categories: { ...p.skills_categories, [cat]: s } }; });
  const updateNewSkillInput = (cat, f, v) => { setNewSkillsInput(p => ({ ...p, [cat]: { ...(p[cat] || { name: '', rating: 3 }), [f]: v } })); };
  const addSkillToCategory = (cat) => { const i = newSkillsInput[cat] || { name: '', rating: 3 }; if (i.name) { setCvData(p => ({ ...p, skills_categories: { ...p.skills_categories, [cat]: [...p.skills_categories[cat], { name: i.name, rating: i.rating }] } })); setNewSkillsInput(p => ({ ...p, [cat]: { name: '', rating: 3 } })); } };
  
  const updateEducation = (i, f, v) => { const n = [...cvData.education]; n[i][f] = v; setCvData(p => ({ ...p, education: n })); };
  const addEducation = () => setCvData(p => ({ ...p, education: [...p.education, { year: "", degree: "", location: "" }] }));
  const removeEducation = (i) => setCvData(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));

  const formatNameHeader = () => {
    if (cvData.isAnonymous) return <div className="text-6xl font-black">{String(cvData.profile.firstname?.[0] || '')}{String(cvData.profile.lastname?.[0] || '')}</div>;
    return (
      <div className="flex flex-col text-left">
        <span className="text-4xl font-semibold opacity-90 leading-tight">{String(cvData.profile.firstname)}</span>
        <span className="text-6xl font-black leading-tight">{String(cvData.profile.lastname)}</span>
      </div>
    );
  };

  const experiencePages = paginateExperiences(cvData.experiences);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row h-screen overflow-hidden font-sans">
      
      {/* SIDEBAR WIZARD */}
      <div className="w-full md:w-[500px] bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-xl print:hidden text-left">
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex justify-between items-center px-4">
           <div className="flex items-center gap-1">
             <ButtonUI variant="ghost" className="px-2 py-1 h-7 text-slate-400" onClick={resetCV} title="Reset"><RefreshCw size={14}/></ButtonUI>
             <ButtonUI variant="ghost" className="px-2 py-1 h-7 text-slate-400" onClick={downloadJSON} title="Save JSON"><Save size={14}/></ButtonUI>
             <ButtonUI variant="ghost" className="px-2 py-1 h-7 text-slate-400" onClick={() => jsonInputRef.current.click()} title="Load JSON"><FolderOpen size={14}/></ButtonUI>
             <input type="file" ref={jsonInputRef} className="hidden" accept=".json" onChange={uploadJSON} />
             <div className="w-px h-4 bg-slate-300 mx-1"></div>
             <ButtonUI variant="primary" className="px-3 py-1 h-9 bg-[#006898] hover:bg-[#004a6d] shadow-sm" onClick={() => pdfInputRef.current.click()} disabled={isImporting}>
               {isImporting ? <Loader2 size={14} className="animate-spin text-white"/> : <FileSearch size={14} className="text-white"/>} 
               <span className="text-white drop-shadow-sm font-bold uppercase ml-1">{isImporting ? "Analyse..." : "Import PDF"}</span>
             </ButtonUI>
             <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf" onChange={handlePDFImport} />
           </div>
           {/* BOUTON ANONYMISER / VISIBLE */}
           <ButtonUI variant={cvData.isAnonymous ? "danger" : "secondary"} className="px-2 py-1 h-7" onClick={() => setCvData(p => ({...p, isAnonymous: !p.isAnonymous}))}>
             <Lock size={12}/> {cvData.isAnonymous ? "Visible" : "Anonymiser"}
           </ButtonUI>
        </div>

        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex justify-between items-center mb-6"><h1 className="font-bold text-xl text-[#2E86C1]">Smile Editor</h1><span className="text-xs font-bold text-slate-400">Étape {step} / 4</span></div>
          <div className="flex gap-2">
            <ButtonUI variant="secondary" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="flex-1"><ArrowLeft size={16} /></ButtonUI>
            {step < 4 ? <ButtonUI onClick={() => setStep(s => Math.min(4, s + 1))} className="flex-[2]">Suivant <ArrowRight size={16} /></ButtonUI> : <ButtonUI onClick={handlePrintPDF} className="flex-[2] bg-slate-900 hover:bg-black text-white"><Printer size={16} /> Générer PDF</ButtonUI>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
           {step === 1 && (
             <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Logo Entreprise</span>
                    <DropZoneUI onFile={handleSmileLogo} label="Logo" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ma Photo</span>
                    <DropZoneUI onFile={handlePhotoUpload} label="Photo" />
                  </div>
                </div>
                <InputUI label="Prénom" value={cvData.profile.firstname} onChange={v => handleProfileChange('firstname', v)} />
                <InputUI label="NOM" value={cvData.profile.lastname} onChange={v => handleProfileChange('lastname', v)} />
                <InputUI label="Poste" value={cvData.profile.current_role} onChange={v => handleProfileChange('current_role', v)} />
                <RichTextareaUI label="Bio / Résumé" value={cvData.profile.summary} onChange={v => handleProfileChange('summary', v)} maxLength={400} />
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-[#333333] uppercase block mb-3 text-left">Bandeau Technos</label>
                  <div className="flex gap-2 mb-4">
                     <input className="flex-1 px-3 py-1.5 border rounded text-xs" placeholder="Ex: React" id="tech-search-input-ref-final" />
                     <ButtonUI variant="primary" className="p-1 h-auto" onClick={() => {
                        const val = document.getElementById('tech-search-input-ref-final').value;
                        if(val) addTechLogo({ type: 'url', src: getIconUrl(val), name: val });
                     }}><Plus size={12}/></ButtonUI>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(cvData.profile.tech_logos || []).map((logo, i) => (
                      <div key={i} className="relative group bg-slate-100 p-2 rounded-md border border-slate-200">
                        <img src={logo.src} className="w-6 h-6 object-contain" alt={logo.name} />
                        <button onClick={() => removeTechLogo(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
           )}

           {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300 text-left">
               <h2 className="font-bold text-lg text-slate-700 flex items-center gap-2 text-left uppercase tracking-tighter"><Hexagon size={20}/> Soft Skills</h2>
               {[0, 1, 2].map(i => (<InputUI key={i} label={`Skill #${i+1}`} value={cvData.soft_skills[i]} onChange={(v) => {const s = [...cvData.soft_skills]; s[i] = v; setCvData(p => ({...p, soft_skills: s}));}} />))}
            </div>
           )}

           {step === 3 && (
             <div className="space-y-8 animate-in slide-in-from-right duration-300 text-left">
               <h2 className="font-bold text-lg text-slate-700 flex items-center gap-2 text-left uppercase tracking-tighter"><GraduationCap size={20}/> Formation & Compétences</h2>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm text-left">
                 <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4">Secteur & Certifs</h3>
                 <div className="flex gap-2 mb-4">
                   <input className="flex-1 px-3 py-1.5 border rounded text-xs" placeholder="Secteur..." value={newSecteur} onChange={e=>setNewSecteur(e.target.value)} onKeyDown={e=>e.key==='Enter' && addSecteur()} />
                   <ButtonUI variant="primary" className="p-1 h-auto" onClick={addSecteur}><Plus size={10}/></ButtonUI>
                 </div>
                 <div className="flex flex-wrap gap-1 mb-4">{(cvData.connaissances_sectorielles || []).map((s, i) => (<span key={i} className="bg-white text-[9px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 uppercase">{s} <X size={10} className="cursor-pointer" onClick={() => removeSecteur(i)}/></span>))}</div>
                 {/* LOGO SELECTOR AVEC DROPZONE */}
                 <div className="space-y-2">
                    <LogoSelectorUI onSelect={addCertification} label="Certifications" />
                    <div className="mt-2 space-y-1">{(cvData.certifications || []).map((c, i) => (<div key={i} className="flex items-center justify-between text-[10px] bg-white p-1.5 rounded border uppercase font-bold"><span>{c.name}</span><button onClick={()=>removeCertification(i)}><X size={10}/></button></div>))}</div>
                 </div>
               </div>
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm text-left">
                 <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 text-left">Parcours Académique</h3>
                 {(cvData.education || []).map((edu, i) => (<div key={i} className="bg-white p-3 rounded-lg border mb-3 relative group shadow-sm text-left"><button onClick={() => removeEducation(i)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 size={12}/></button><InputUI label="Diplôme" value={edu.degree} onChange={v => updateEducation(i, 'degree', v)} /><div className="grid grid-cols-2 gap-2"><InputUI label="Année" value={edu.year} onChange={v => updateEducation(i, 'year', v)} /><InputUI label="Lieu" value={edu.location} onChange={v => updateEducation(i, 'location', v)} /></div></div>))}
                 <ButtonUI onClick={addEducation} variant="secondary" className="w-full text-xs py-2 mt-2 shadow-sm">Ajouter Formation</ButtonUI>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 text-left">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 text-left">Niveau Compétences</h3>
                  <div className="flex gap-2 mb-4"><input className="flex-1 px-3 py-2 border rounded text-xs" placeholder="Catégorie (Outils...)" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkillCategory()} /><ButtonUI variant="outline" className="px-3" onClick={addSkillCategory}><Plus size={14}/></ButtonUI></div>
                  {Object.entries(cvData.skills_categories).map(([cat, skills]) => (
                    <div key={cat} className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2"><h4 className="text-xs font-bold uppercase">{cat}</h4><button onClick={() => deleteCategory(cat)} className="text-red-300"><Trash2 size={12}/></button></div>
                      <div className="space-y-1 mb-3">{(skills || []).map((skill, idx) => (<div key={idx} className="flex items-center justify-between text-xs bg-white p-1.5 rounded shadow-sm"><input className="bg-transparent outline-none w-1/2 font-medium" value={skill.name} onChange={(e) => updateSkillInCategory(cat, idx, 'name', e.target.value)} /><HexagonRating score={skill.rating} onChange={(r) => updateSkillInCategory(cat, idx, 'rating', r)} /></div>))}</div>
                      <div className="flex gap-1"><input className="flex-1 px-2 py-1 text-[10px] border rounded" placeholder="Ajouter..." value={newSkillsInput[cat]?.name || ''} onChange={(e) => updateNewSkillInput(cat, 'name', e.target.value)} /><ButtonUI variant="primary" className="p-1 h-auto" onClick={() => addSkillToCategory(cat)}><Plus size={10}/></ButtonUI></div>
                    </div>
                  ))}
               </div>
             </div>
           )}

           {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300 text-left">
              <div className="flex justify-between items-center mb-4 text-[#2E86C1]"><div className="flex items-center gap-3"><Briefcase size={24} /><h2 className="text-lg font-bold uppercase">Expériences</h2></div><ButtonUI onClick={addExperience} variant="outline" className="px-3 py-1 text-xs"><Plus size={14} /> Ajouter</ButtonUI></div>
              {(cvData.experiences || []).map((exp, index) => (
                <div key={exp.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group mb-4">
                  <div className="absolute top-4 right-4 flex gap-1"><button onClick={() => moveExperience(index, 'up')} disabled={index===0} className="text-slate-300 hover:text-blue-500"><ChevronUp size={16}/></button><button onClick={() => removeExperience(exp.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button></div>
                  <div className="mb-4 text-left"><span className="text-xs font-bold text-[#333333] uppercase block mb-2">Logo Client</span><div className="flex items-center gap-4 text-left"><DropZoneUI label="Logo" onFile={(f) => {const r=new FileReader(); r.onload=(ev)=>updateExperience(exp.id, 'client_logo', ev.target.result); r.readAsDataURL(f);}} className="h-16 flex-1" />{exp.client_logo && <img src={exp.client_logo} className="w-12 h-12 object-contain" />}</div></div>
                  <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100"><div className="flex items-center gap-2"><FilePlus size={16} className="text-[#2E86C1]"/><span className="text-xs font-bold text-slate-600">Saut de page manuel</span></div><button onClick={() => updateExperience(exp.id, 'forceNewPage', !exp.forceNewPage)}>{exp.forceNewPage ? <ToggleRight className="text-green-500"/> : <ToggleLeft className="text-slate-300"/>}</button></div>
                  <InputUI label="Client" value={exp.client_name} onChange={(v) => updateExperience(exp.id, 'client_name', v)} />
                  <InputUI label="Rôle" value={exp.role} onChange={(v) => updateExperience(exp.id, 'role', v)} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputUI label="Période" value={exp.period} onChange={(v) => updateExperience(exp.id, 'period', v)} />
                    <InputUI label="Environnement Tech" value={Array.isArray(exp.tech_stack) ? exp.tech_stack.join(', ') : exp.tech_stack} onChange={(v) => updateExperience(exp.id, 'tech_stack', String(v).split(',').map(s=>s.trim()))} />
                  </div>
                  <RichTextareaUI label="Objectif" value={exp.objective} onChange={(v) => updateExperience(exp.id, 'objective', v)} />
                  <RichTextareaUI label="Réalisation" value={exp.phases} onChange={(v) => updateExperience(exp.id, 'phases', v)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- PREVIEW AREA --- */}
      <div className="flex-1 bg-slate-800 overflow-hidden relative flex flex-col items-center">
        <div className="absolute bottom-6 z-50 flex items-center gap-4 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-2xl print:hidden transition-all hover:scale-105">
           <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="p-2 hover:bg-slate-100 rounded-full"><ZoomOut size={18} /></button>
           <span className="text-xs font-bold text-slate-600 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
           <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-2 hover:bg-slate-100 rounded-full"><ZoomIn size={18} /></button>
        </div>

        <div className="flex-1 overflow-auto w-full p-8 flex justify-center custom-scrollbar border-l border-slate-700">
          <div className="print-container flex flex-col origin-top transition-transform duration-300 gap-10" style={{ transform: `scale(${zoom})`, marginBottom: `${zoom * 100}px` }}>
            {/* PAGE 1 */}
            <A4Page>
              <CornerTriangle customLogo={cvData.smileLogo} />
              {!cvData.isAnonymous && cvData.profile.photo && (
                <div className="absolute top-12 right-12 w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-xl z-20 bg-white">
                  <img src={cvData.profile.photo} className="w-full h-full object-cover" alt="Portrait" />
                </div>
              )}
              <div className="pt-36 px-16 pb-0 flex-shrink-0 text-left">
                 <h1 className="uppercase leading-[0.85] mb-8 font-montserrat text-[#333333] text-left">
                   {cvData.isAnonymous ? `${String(cvData.profile.firstname?.[0] || '')}${String(cvData.profile.lastname?.[0] || '')}` : <><span className="text-4xl block font-semibold opacity-90">{String(cvData.profile.firstname)}</span><span className="text-6xl font-black">{String(cvData.profile.lastname)}</span></>}
                 </h1>
                 <div className="inline-block bg-[#2E86C1] text-white font-bold text-xl px-4 py-1 rounded-sm uppercase mb-6 tracking-wider shadow-sm">{String(cvData.profile.years_experience)} ans d'expérience</div>
                 <h2 className="text-3xl font-black text-[#333333] uppercase mb-1 tracking-wide font-montserrat opacity-90 text-left">{String(cvData.profile.current_role)}</h2>
                 <div className="text-lg text-[#666666] font-medium uppercase tracking-widest mb-4 border-l-4 border-[#2E86C1] pl-4 text-left">{String(cvData.profile.main_tech)}</div>
              </div>
              <div className="flex-1 flex flex-col justify-start pt-0 pb-12 overflow-hidden text-center">
                  <div className="px-24 mb-10 relative z-10 flex flex-col items-center">
                     <p className="text-lg text-[#333333] leading-relaxed italic border-t border-slate-100 pt-8 text-center break-words w-full max-w-[160mm]" dangerouslySetInnerHTML={{__html: formatTextForPreview(`"${cvData.profile.summary}"`)}}></p>
                  </div>
                  <div className="w-full bg-[#2E86C1] py-6 px-16 mb-8 flex items-center justify-center gap-10 shadow-inner relative z-10 flex-shrink-0">
                    {(cvData.profile.tech_logos || []).map((logo, i) => (<img key={i} src={logo.src} className="h-14 w-auto object-contain brightness-0 invert opacity-95 transition-transform" alt={String(logo.name)} />))}
                  </div>
                  <div className="flex justify-center gap-12 relative z-10 px-10 flex-shrink-0 mt-12">
                    {(cvData.soft_skills || []).map((skill, i) => (
                      <div key={i} className="relative w-40 h-44 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#2E86C1] fill-current drop-shadow-xl"><polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" /></svg>
                        <span className="relative z-10 text-white font-bold text-sm uppercase text-center px-4 leading-tight font-montserrat">{String(skill || "Skill")}</span>
                      </div>
                    ))}
                  </div>
              </div>
              <Footer />
            </A4Page>

            <A4Page>
              <CornerTriangle customLogo={cvData.smileLogo} />
              <HeaderSmall isAnonymous={cvData.isAnonymous} profile={cvData.profile} role={cvData.profile.current_role} />
              <div className="grid grid-cols-12 gap-10 mt-20 h-full px-12 flex-1 pb-32 overflow-hidden print:overflow-visible text-left">
                  <div className="col-span-5 border-r border-slate-100 pr-8">
                    <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-8 flex items-center gap-2 text-left"><Cpu size={20}/> Mes Compétences</h3>
                    <div className="space-y-8">{Object.entries(cvData.skills_categories || {}).map(([cat, skills]) => (<div key={cat}><h4 className="text-[10px] font-bold text-[#999999] uppercase tracking-widest border-b border-slate-100 pb-2 mb-3 text-left">{cat}</h4><div className="space-y-3">{skills.map((skill, i) => (<div key={i} className="flex items-center justify-between text-left"><span className="text-xs font-bold text-[#333333] uppercase text-left">{String(skill.name)}</span><HexagonRating score={skill.rating} /></div>))}</div></div>))}</div>
                  </div>
                  <div className="col-span-7 flex flex-col gap-10">
                    {cvData.showSecteur && (cvData.connaissances_sectorielles || []).length > 0 && (<section><h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-4 flex items-center gap-2"><Factory size={20}/> Secteurs</h3><div className="flex flex-wrap gap-2">{(cvData.connaissances_sectorielles || []).map((s, i) => (<span key={i} className="border-2 border-[#2E86C1] text-[#2E86C1] text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider">{String(s)}</span>))}</div></section>)}
                    {cvData.showCertif && (cvData.certifications || []).length > 0 && (<section><h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-4 flex items-center gap-2 text-left"><Award size={20}/> Certifications</h3><div className="grid grid-cols-2 gap-4">{cvData.certifications.map((c, i) => (<div key={i} className="flex items-center gap-3 bg-slate-50 p-2 rounded text-left">{c.logo && <img src={c.logo} className="w-8 h-8 object-contain" alt={String(c.name)} />}<span className="text-[10px] font-bold text-slate-700 uppercase leading-tight text-left">{String(c.name)}</span></div>))}</div></section>)}
                    <section><h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-6 flex items-center gap-2 text-left"><GraduationCap size={20}/> Ma Formation</h3><div className="space-y-4">{(cvData.education || []).map((edu, i) => (<div key={i} className="border-l-2 border-slate-100 pl-4 text-left"><span className="text-[10px] font-bold text-[#999999] block mb-1 text-left">{String(edu.year)}</span><h4 className="text-xs font-bold text-[#333333] uppercase leading-tight text-left">{String(edu.degree)}</h4><span className="text-[9px] text-[#2E86C1] font-medium uppercase text-left">{String(edu.location)}</span></div>))}</div></section>
                  </div>
              </div>
              <Footer />
            </A4Page>

            {experiencePages.map((chunk, pageIndex) => (
              <A4Page key={pageIndex}>
                <CornerTriangle customLogo={cvData.smileLogo} />
                <HeaderSmall isAnonymous={cvData.isAnonymous} profile={cvData.profile} role={cvData.profile.current_role} />
                <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-8 mt-16 px-12 flex-shrink-0 text-left"><h3 className="text-xl font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat">{pageIndex === 0 ? "Mes dernières expériences" : "Expériences (Suite)"}</h3><span className="text-[10px] font-bold text-[#666666] uppercase">Références</span></div>
                <div className="flex-1 px-12 pb-32 overflow-hidden print:overflow-visible text-left">{chunk.map((exp) => (<ExperienceItem key={exp.id} exp={exp} />))}</div>
                <Footer />
              </A4Page>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-sans { font-family: 'Open Sans', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .A4-page { width: 210mm; height: 297mm; background: white; flex-shrink: 0; box-sizing: border-box; position: relative; }
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-hidden { display: none !important; }
          .flex-1.bg-slate-800 { display: block !important; height: auto !important; overflow: visible !important; background: white !important; padding: 0 !important; }
          .print-container { transform: none !important; margin: 0 !important; width: 100% !important; display: block !important; gap: 0 !important; }
          .A4-page { margin: 0 !important; box-shadow: none !important; page-break-after: always !important; break-after: page !important; width: 210mm !important; height: 297mm !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; }
          .A4-page { height: auto !important; min-height: 297mm !important; overflow: visible !important; }
          .break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
