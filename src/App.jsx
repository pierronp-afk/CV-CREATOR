import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Download, Plus, Trash2, MoveUp, MoveDown, 
  Upload, X, Briefcase, GraduationCap, User, Hexagon, Cpu, 
  ImageIcon, ZoomIn, ZoomOut, Search, LayoutTemplate, 
  Save, FolderOpen, Eye, Shield, Check, Edit2,
  Bold, List, Copy, HelpCircle, RefreshCw, Cloud, Mail, Printer,
  ChevronUp, ChevronDown, Award, Factory, ToggleLeft, ToggleRight, FilePlus,
  FileSearch, Loader2, Lock, Sparkles, AlertCircle, LifeBuoy
} from 'lucide-react';

// --- CONFIGURATION DES LOGOS ENTREPRISE ---
const COMPANY_LOGOS = [
  { id: 'smile-std', label: 'Smile Standard', src: '/logos/smile-white.png' },
  // Ajoutez ici vos futurs logos (ex: { id: 'smile-ux', label: 'Smile UX', src: '/logos/smile-ux.png' })
];

// --- CONFIGURATION & THÈME ---
const THEME = {
  primary: "#2E86C1", 
  secondary: "#006898", 
  textDark: "#333333", 
  textGrey: "#666666", 
  bg: "#FFFFFF"
};

const getIconUrl = (slug) => `https://cdn.simpleicons.org/${String(slug || '').toLowerCase().replace(/\s+/g, '')}`;
const getClearbitUrl = (domain) => `https://logo.clearbit.com/${String(domain || '').trim()}`;

// --- DONNÉES PAR DÉFAUT ---
const DEFAULT_CV_DATA = {
  isAnonymous: false,
  showSecteur: true,
  showCertif: true,
  smileLogo: COMPANY_LOGOS[0].src, // Utilise le logo Smile par défaut
  profile: {
    firstname: "Prénom",
    lastname: "NOM",
    years_experience: "5",
    current_role: "Poste de Consultant",
    main_tech: "Techno principale",
    summary: "Forte expérience en gestion de projet Drupal et dans l'accompagnement de nos clients.",
    photo: null, 
    tech_logos: [
      { type: 'url', src: 'https://cdn.simpleicons.org/php', name: 'PHP' },
      { type: 'url', src: 'https://cdn.simpleicons.org/drupal', name: 'Drupal' },
      { type: 'url', src: 'https://cdn.simpleicons.org/symfony', name: 'Symfony' }
    ]
  },
  soft_skills: ["Agilité", "Rigueur", "Communication"],
  connaissances_sectorielles: ["Industrie", "E-commerce"],
  certifications: [{ name: "Drupal certified", logo: "https://cdn.simpleicons.org/drupal" }],
  experiences: [
    {
      id: 1,
      client_name: "Disney",
      client_logo: "https://logo.clearbit.com/disney.com",
      period: "Jan 2023 - Présent",
      role: "Développeur Frontend",
      context: "Projet de refonte globale du site consommateur.",
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

const handleImageError = (e) => {
  e.target.style.display = 'none';
};

// --- SOUS-COMPOSANTS ---

const ModalUI = ({ title, children, onClose, onConfirm, confirmText = "Confirmer", icon = <AlertCircle size={32} />, danger = true }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-left">
      <div className="p-6 text-left">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#2E86C1]'}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">{String(title)}</h3>
        <div className="text-sm text-slate-500 mb-8 text-left">{children}</div>
        <div className="flex gap-3">
          {onClose && <button onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors">Annuler</button>}
          <button onClick={onConfirm} className={`flex-1 px-4 py-3 text-white rounded-xl font-bold shadow-lg transition-colors ${danger ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-[#2E86C1] hover:bg-[#2573a7] shadow-blue-200'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  </div>
);

const A4Page = ({ children, className = "" }) => (
  <div className={`A4-page bg-white relative overflow-hidden mx-auto shadow-2xl flex-shrink-0 mb-10 ${className}`} style={{ width: '210mm', height: '297mm', display: 'flex', flexDirection: 'column' }}>
    {children}
  </div>
);

const CornerTriangle = ({ customLogo }) => (
  <div className="absolute top-0 left-0 w-[170px] h-[170px] z-50 pointer-events-none print:w-[150px] print:h-[150px]">
    <div className="absolute top-0 left-0 w-full h-full bg-[#2E86C1] triangle-bg" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
    {customLogo && (
      <div className="absolute top-[12px] left-[12px] w-[100px] h-[100px] flex items-center justify-center">
         <img src={customLogo} onError={handleImageError} className="max-w-full max-h-full object-contain brightness-0 invert" style={{ transform: 'rotate(-45deg)' }} alt="Logo" />
      </div>
    )}
  </div>
);

const HeaderSmall = ({ isAnonymous, profile, role, logo }) => {
  const nameDisplay = isAnonymous ? `${profile.firstname?.[0] || ''}${profile.lastname?.[0] || ''}` : `${profile.firstname} ${profile.lastname}`;
  return (
    <div className="flex justify-between items-start border-b-2 border-[#2E86C1] pb-4 pt-10 px-12 mt-8 flex-shrink-0 text-left">
      <div className="w-12 h-12 flex items-center justify-center text-left">
         {logo && <img src={logo} onError={handleImageError} className="max-w-full max-h-full object-contain brightness-0 invert" alt="Logo" />}
      </div>
      <div className="text-right">
        <h3 className="text-sm font-bold text-[#333333] uppercase">{String(nameDisplay)}</h3>
        <p className="text-[10px] font-bold text-[#999999] uppercase">{String(role || '')}</p>
      </div>
    </div>
  );
};

const Footer = () => (
  <div className="absolute bottom-8 left-12 right-12 border-t border-slate-100 pt-4 flex justify-between items-center bg-white flex-shrink-0 text-[8px] font-bold">
    <div className="text-[#999999] uppercase tracking-widest text-left">Smile - IT is Open <span className="text-[#2E86C1] ml-1">CRÉATEUR D'EXPÉRIENCE DIGITALE OUVERTE</span></div>
    <div className="text-[#333333]">#MadeWithSmile</div>
  </div>
);

const HexagonRating = ({ score, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} viewBox="0 0 100 100" onClick={onChange ? () => onChange(i) : undefined} className={`w-3 h-3 ${onChange ? 'cursor-pointer hover:scale-125 transition-transform' : ''} ${i <= score ? 'text-[#2E86C1] fill-current hexagon-fill' : 'text-slate-200 fill-current'}`}>
        <polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" />
      </svg>
    ))}
  </div>
);

const ExperienceItem = ({ exp }) => (
  <div className="grid grid-cols-12 gap-6 mb-8 break-inside-avoid print:break-inside-avoid text-left">
    <div className="col-span-2 flex flex-col items-center pt-2 text-left">
      {exp.client_logo && exp.client_logo !== "null" && (
        <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-white mb-2 p-1">
          <img src={exp.client_logo} onError={handleImageError} className="max-w-full max-h-full object-contain" alt="Logo Client" />
        </div>
      )}
      <span className="text-[10px] font-bold text-[#333333] uppercase text-center leading-tight">{String(exp.client_name || '')}</span>
    </div>
    <div className="col-span-10 border-l border-slate-100 pl-6 pb-4 text-left">
      <div className="flex justify-between items-baseline mb-3">
         <h4 className="text-lg font-bold text-[#333333] uppercase">{String(exp.client_name || '')} <span className="font-normal text-[#666666]">| {String(exp.role || '')}</span></h4>
         <span className="text-xs font-bold text-[#2E86C1] uppercase">{String(exp.period || '')}</span>
      </div>
      {exp.context && (
        <div className="mb-4 text-left">
           <h5 className="text-[10px] font-bold text-[#2E86C1] uppercase mb-1">Contexte</h5>
           <p className="text-sm text-[#333333] leading-relaxed break-words" dangerouslySetInnerHTML={{__html: formatTextForPreview(exp.context)}}></p>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-slate-50 space-y-4 text-left">
         <div className="text-left">
            <h5 className="text-[10px] font-bold text-[#999999] uppercase mb-1">Réalisation</h5>
            <p className="text-xs font-medium text-[#333333] break-words text-left" dangerouslySetInnerHTML={{__html: formatTextForPreview(exp.phases)}}></p>
         </div>
         <div className="text-left">
            <h5 className="text-[10px] font-bold text-[#999999] uppercase mb-1">Environnement</h5>
            <div className="flex flex-wrap gap-1 text-left">
              {(Array.isArray(exp.tech_stack) ? exp.tech_stack : []).map((t, i) => (
                <span key={i} className="text-xs font-bold text-[#2E86C1] bg-blue-50 px-2 py-0.5 rounded">{String(t)}</span>
              ))}
            </div>
         </div>
      </div>
    </div>
  </div>
);

// --- COMPOSANTS UI FORMULAIRE ---

const ButtonUI = ({ children, onClick, variant = "primary", className = "", disabled = false, title = "" }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 justify-center";
  const variants = {
    primary: "bg-[#2E86C1] text-white hover:bg-[#2573a7] shadow-md",
    secondary: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    outline: "border-2 border-[#2E86C1] text-[#2E86C1] hover:bg-blue-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 p-2",
    ghost: "text-slate-500 hover:bg-slate-100",
    toolbar: "p-1.5 hover:bg-slate-200 rounded text-slate-600"
  };
  return <button onClick={onClick} disabled={disabled} title={title} className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>{children}</button>;
};

const InputUI = ({ label, value, onChange, placeholder, maxLength, type = "text" }) => (
  <div className="mb-4 text-left">
    <div className="flex justify-between items-baseline mb-1 text-left">
      <label className="text-xs font-bold text-[#333333] uppercase tracking-wide">{String(label)}</label>
      {maxLength && <span className={`text-[10px] ${String(value || '').length > maxLength ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{String(value || '').length} / {maxLength}</span>}
    </div>
    <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] text-sm text-[#333333] transition-all" />
  </div>
);

const RichTextareaUI = ({ label, value, onChange, placeholder }) => {
  const textareaRef = useRef(null);
  const handleTextChange = (e) => onChange(e.target.value);
  const insertTag = (tag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    if (tag === 'b') onChange(`${before}<b>${selected}</b>${after}`);
    else if (tag === 'list') {
      if (start !== end) {
        const bulletedLines = selected.split('\n').map(line => line.trim() === "" ? line : (line.startsWith('• ') ? line : `• ${line}`)).join('\n');
        onChange(before + bulletedLines + after);
      } else onChange(`${before}• ${after}`);
    }
  };
  const copyToClipboard = (url) => {
    if (value) {
      const prompt = "Agis comme un expert Smile. Reformule ce texte pour un CV de consultant. Ton 'corporate', direct. Corrige les fautes. PAS de markdown. Texte : \n" + value;
      const textArea = document.createElement("textarea");
      textArea.value = prompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    window.open(url, '_blank');
  };

  return (
    <div className="mb-6 text-left">
      <label className="text-xs font-bold text-[#333333] uppercase block mb-1">{String(label)}</label>
      <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#2E86C1] transition-all shadow-sm">
        <div className="flex items-center gap-1 px-2 py-1.5 bg-white border-b border-slate-200">
          <ButtonUI variant="toolbar" onClick={() => insertTag('b')} title="Gras"><Bold size={12}/></ButtonUI>
          <ButtonUI variant="toolbar" onClick={() => insertTag('list')} title="Puce"><List size={12}/></ButtonUI>
          <div className="w-px h-3 bg-slate-300 mx-1"></div>
          {[
            { name: 'ChatGPT', url: 'https://chat.openai.com/', domain: 'openai.com' },
            { name: 'Gemini', url: 'https://gemini.google.com/', icon: 'googlegemini' }
          ].map((tool) => (
            <button key={tool.name} onClick={() => copyToClipboard(tool.url)} className="p-1 hover:bg-slate-100 rounded transition-all opacity-70 hover:opacity-100" title={`IA: ${tool.name}`}>
              <img src={tool.domain ? `https://www.google.com/s2/favicons?domain=${tool.domain}&sz=64` : `https://cdn.simpleicons.org/${tool.icon}`} className="w-4 h-4 object-contain grayscale hover:grayscale-0" alt={tool.name} />
            </button>
          ))}
        </div>
        <textarea ref={textareaRef} className="w-full px-4 py-3 bg-transparent text-sm h-32 resize-none focus:outline-none" value={value || ''} onChange={handleTextChange} placeholder={placeholder} />
      </div>
    </div>
  );
};

const DropZoneUI = ({ onFile, label = "Dépôt", icon = <Upload size={16}/>, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  return (
    <div className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 ${isDragging ? 'border-[#2E86C1] bg-blue-50' : 'border-slate-300 bg-white hover:border-[#2E86C1]'} ${className}`} onClick={() => inputRef.current.click()} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}>
      <input type="file" style={{display: 'none'}} ref={inputRef} accept="image/*" onChange={(e) => { if(e.target.files[0]) onFile(e.target.files[0]); }} />
      <div className={isDragging ? 'text-[#2E86C1]' : 'text-slate-400'}>{icon}</div>
      <span className="text-[10px] font-bold uppercase text-slate-500">{label}</span>
    </div>
  );
};

const LogoSelectorUI = ({ onSelect, label, suggestions = [] }) => {
  const [search, setSearch] = useState("");
  const handleSelect = (query) => {
    if (!query) return;
    const finalSrc = query.includes('.') ? getClearbitUrl(query) : getIconUrl(query);
    onSelect({ type: 'url', src: finalSrc, name: query });
    setSearch("");
  };
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
      <label className="text-[10px] font-black text-slate-500 uppercase block mb-3">{String(label)}</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((slug) => (
          <button key={slug} onClick={() => handleSelect(slug)} className="p-1.5 hover:bg-blue-50 rounded-md border border-white transition-all shadow-sm">
            <img src={getIconUrl(slug)} onError={handleImageError} className="w-5 h-5 object-contain grayscale hover:grayscale-0" alt={slug} />
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input className="w-full pl-8 pr-2 py-2 bg-white border border-slate-300 rounded-lg text-xs" placeholder="Nom (ex: drupal) ou Domaine (ex: google.com)" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSelect(search)} />
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
        </div>
        <ButtonUI variant="primary" className="px-3" onClick={() => handleSelect(search)}><Plus size={14}/></ButtonUI>
      </div>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---

export default function App() {
  const [step, setStep] = useState(1);
  const [zoom, setZoom] = useState(0.55);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showAIConsent, setShowAIConsent] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const jsonInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [newSecteur, setNewSecteur] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSkillsInput, setNewSkillsInput] = useState({});

  const [cvData, setCvData] = useState(() => {
    try {
      const saved = localStorage.getItem('smile_cv_data_v40');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return DEFAULT_CV_DATA;
  });

  useEffect(() => {
    if (!localStorage.getItem('smile_cv_privacy_accepted')) setShowPrivacyNotice(true);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => { if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    localStorage.setItem('smile_cv_data_v40', JSON.stringify(cvData));
  }, [cvData]);

  const getFilenameBase = () => {
    const year = new Date().getFullYear();
    if (cvData.isAnonymous) return `CV_Anonyme_${year}`;
    return `CV ${year} - ${String(cvData.profile.lastname).toUpperCase()} ${cvData.profile.firstname}`;
  };

  useEffect(() => { document.title = getFilenameBase(); }, [cvData.profile, cvData.isAnonymous]);

  const extractTextFromPDF = async (file) => {
    if (!window.pdfjsLib) throw new Error("Bibliothèque PDF non chargée.");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(" ") + "\n";
    }
    return fullText;
  };

  const confirmAIAnalysis = async () => {
    if (!pendingFile) return;
    setShowAIConsent(false);
    setIsImporting(true);
    setImportError(null);
    try {
      let rawText = await extractTextFromPDF(pendingFile);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText.substring(0, 30000) }) 
      });
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error("Données IA vides.");
      const result = JSON.parse(content);
      setCvData(prev => ({
        ...prev, ...result,
        profile: { ...prev.profile, ...result.profile },
        experiences: (result.experiences || []).map((exp, idx) => ({ ...exp, id: Date.now() + idx, forceNewPage: false }))
      }));
    } catch (err) {
      setImportError("Erreur d'analyse. Vérifiez que la route /api/analyze est active.");
    } finally {
      setIsImporting(false);
      setPendingFile(null);
    }
  };

  const handleProfileChange = (f, v) => setCvData(p => ({ ...p, profile: { ...p.profile, [f]: v } }));
  const handlePhotoUpload = (file) => { if(file) { const reader = new FileReader(); reader.onload = (ev) => setCvData(prev => ({...prev, profile: { ...prev.profile, photo: ev.target.result }})); reader.readAsDataURL(file); } };
  
  const moveItem = (listName, index, direction) => {
    const list = [...cvData[listName]];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target >= 0 && target < list.length) {
      [list[index], list[target]] = [list[target], list[index]];
      setCvData(p => ({ ...p, [listName]: list }));
    }
  };

  const updateExperience = (id, f, v) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, [f]: v } : e) }));
  const addExperience = () => setCvData(p => ({ ...p, experiences: [{ id: Date.now(), client_name: "", client_logo: null, period: "", role: "", context: "", phases: "", tech_stack: [], forceNewPage: false }, ...p.experiences] }));
  const removeExperience = (id) => setCvData(p => ({ ...p, experiences: p.experiences.filter(e => e.id !== id) }));
  
  const addSkillCategory = () => { if (newCategoryName) { setCvData(p => ({ ...p, skills_categories: { ...p.skills_categories, [newCategoryName]: [] } })); setNewCategoryName(""); } };
  const updateSkillInCategory = (cat, idx, f, v) => setCvData(p => { const s = [...p.skills_categories[cat]]; s[idx] = { ...s[idx], [f]: v }; return { ...p, skills_categories: { ...p.skills_categories, [cat]: s } }; });
  const addSkillToCategory = (cat) => { const i = newSkillsInput[cat] || { name: '', rating: 3 }; if (i.name) { setCvData(p => ({ ...p, skills_categories: { ...p.skills_categories, [cat]: [...p.skills_categories[cat], { name: i.name, rating: i.rating }] } })); setNewSkillsInput(p => ({ ...p, [cat]: { name: '', rating: 3 } })); } };
  
  const acceptPrivacy = () => { localStorage.setItem('smile_cv_privacy_accepted', 'true'); setShowPrivacyNotice(false); setShowGuide(true); };
  const resetCV = () => { setCvData(DEFAULT_CV_DATA); setShowResetConfirm(false); };
  const downloadJSON = () => { const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cvData)); a.download = `${getFilenameBase()}.json`; a.click(); };

  const experiencePages = paginateExperiences(cvData.experiences);
  const totalPages = 2 + experiencePages.length; 
  const scaledContentHeight = (totalPages * 1122.5 * zoom) + ((totalPages - 1) * 40 * zoom) + (20 * zoom);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row h-screen overflow-hidden font-sans text-left">
      
      {/* MODALES */}
      {showPrivacyNotice && (
        <ModalUI title="Notice RGPD" confirmText="J'accepte" onConfirm={acceptPrivacy} icon={<Shield size={32} />} danger={false}>
          <p>Vos données sont stockées uniquement dans <strong>votre navigateur</strong> (LocalStorage). L'import PDF utilise Gemini IA de manière éphémère.</p>
        </ModalUI>
      )}

      {showGuide && (
        <ModalUI title="Guide de Rédaction Smile" confirmText="C'est parti !" onConfirm={() => setShowGuide(false)} icon={<LifeBuoy size={32} />} danger={false}>
          <div className="space-y-4 text-sm text-slate-600">
            <p>Astuces pour un CV parfait :</p>
            <ul className="list-disc pl-4 space-y-2">
              <li><strong>Images & Logos :</strong> Glissez directement vos fichiers (photo, logos) depuis votre ordinateur sur les zones dédiées.</li>
              <li><strong>IA :</strong> Cliquez sur les icônes IA pour copier un prompt optimisé de reformulation corporate.</li>
              <li><strong>Mise en page :</strong> Si une expérience est coupée en bas de page, activez le <strong>saut de page manuel</strong>.</li>
              <li><strong>Structure :</strong> Séparez bien le <em>Contexte</em> (enjeux) de la <em>Réalisation</em> (actions concrètes).</li>
            </ul>
          </div>
        </ModalUI>
      )}

      {showAIConsent && (
        <ModalUI title="Analyser par l'IA ?" confirmText="Analyser" onClose={() => setShowAIConsent(false)} onConfirm={confirmAIAnalysis} icon={<Sparkles size={32} />} danger={false}>
          <p>Le texte du PDF sera envoyé à Gemini pour extraction structurée.</p>
        </ModalUI>
      )}

      {showResetConfirm && <ModalUI title="Réinitialiser ?" onClose={() => setShowResetConfirm(false)} onConfirm={resetCV}><p>Toutes les modifications seront perdues.</p></ModalUI>}

      {/* COLONNE FORMULAIRE */}
      <div className="w-full md:w-[500px] bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-xl print:hidden">
        
        {/* HEADER TOOLBAR */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col gap-3">
          <div className="flex gap-2">
            <button className="flex-1 bg-[#2E86C1] hover:bg-[#2573a7] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm text-sm" onClick={() => pdfInputRef.current.click()} disabled={isImporting}>
              {isImporting ? <Loader2 size={16} className="animate-spin"/> : <FileSearch size={16}/>} <span>{isImporting ? "Analyse..." : "Import PDF"}</span>
            </button>
            <button className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 border text-sm transition-all ${cvData.isAnonymous ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600'}`} onClick={() => setCvData(p => ({...p, isAnonymous: !p.isAnonymous}))}>
              <Lock size={14}/> {cvData.isAnonymous ? "Anonyme" : "Anonymiser"}
            </button>
            <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf" onChange={(e) => { if(e.target.files[0]) { setPendingFile(e.target.files[0]); setShowAIConsent(true); } e.target.value = null; }} />
          </div>
          <div className="flex justify-around bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
            <button onClick={() => setShowResetConfirm(true)} className="flex flex-col items-center gap-1 group"><RefreshCw size={18} className="text-slate-400 group-hover:text-smile"/><span className="text-[9px] font-bold text-slate-500 uppercase">Reset</span></button>
            <button onClick={downloadJSON} className="flex flex-col items-center gap-1 group"><Save size={18} className="text-slate-400 group-hover:text-smile"/><span className="text-[9px] font-bold text-slate-500 uppercase">Save</span></button>
            <button onClick={() => jsonInputRef.current.click()} className="flex flex-col items-center gap-1 group"><FolderOpen size={18} className="text-slate-400 group-hover:text-smile"/><span className="text-[9px] font-bold text-slate-500 uppercase">Load</span></button>
            <input type="file" ref={jsonInputRef} className="hidden" accept=".json" onChange={(e) => { const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload = (ev) => setCvData(JSON.parse(ev.target.result)); r.readAsText(f); } }} />
          </div>
        </div>

        {/* WIZARD HEADER */}
        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="font-black text-xl text-[#2E86C1]">Smile Editor</h1>
            <button onClick={() => setShowGuide(true)} className="text-slate-300 hover:text-smile transition-colors"><LifeBuoy size={20}/></button>
          </div>
          <div className="flex gap-1">
            <button className="bg-slate-100 p-2 rounded-lg disabled:opacity-30" onClick={() => setStep(s => s - 1)} disabled={step === 1}><ArrowLeft size={16}/></button>
            <div className="px-3 flex items-center text-xs font-bold text-slate-400 uppercase tracking-tighter">Étape {step}/4</div>
            {step < 4 ? <button className="bg-smile text-white p-2 rounded-lg" onClick={() => setStep(s => s + 1)}><ArrowRight size={16}/></button> : <button className="bg-smile text-white px-3 rounded-lg text-xs font-bold flex items-center gap-2" onClick={() => window.print()}><Printer size={14}/> PDF</button>}
          </div>
        </div>

        {/* CONTENU FORMULAIRE */}
        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <div className="flex items-center gap-3 text-smile"><User size={24}/><h2 className="font-bold uppercase">Profil & Logos</h2></div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase">Logo d'entreprise</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COMPANY_LOGOS.map(logo => (
                    <button key={logo.id} className={`p-2 rounded-lg border-2 transition-all ${cvData.smileLogo === logo.src ? 'border-smile bg-blue-50' : 'border-slate-100 bg-white'}`} onClick={() => setCvData(p => ({...p, smileLogo: logo.src}))}>
                      <img src={logo.src} className={`h-6 w-auto ${cvData.smileLogo === logo.src ? '' : 'grayscale opacity-50'}`} alt={logo.label} />
                    </button>
                  ))}
                  <button className={`p-2 rounded-lg border-2 border-dashed flex items-center gap-2 text-[10px] font-bold ${cvData.smileLogo && !cvData.smileLogo.startsWith('/logos/') ? 'border-smile bg-blue-50 text-smile' : 'border-slate-300 text-slate-400'}`} onClick={() => document.getElementById('custom-logo-input').click()}>
                    <Plus size={14}/> Custom
                    <input type="file" id="custom-logo-input" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload = (ev) => setCvData(p => ({...p, smileLogo: ev.target.result})); r.readAsDataURL(f); } }} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Photo de Profil</label>
                  <DropZoneUI onFile={handlePhotoUpload} label={cvData.profile.photo ? "Changer" : "Glisser photo"} icon={<User size={16}/>} className="h-24" />
                </div>
                <div className="space-y-4">
                  <InputUI label="Prénom" value={cvData.profile.firstname} onChange={(v) => handleProfileChange('firstname', v)} />
                  <InputUI label="NOM" value={cvData.profile.lastname} onChange={(v) => handleProfileChange('lastname', v)} />
                </div>
              </div>
              <InputUI label="Poste Actuel" value={cvData.profile.current_role} onChange={(v) => handleProfileChange('current_role', v)} />
              <div className="grid grid-cols-2 gap-4">
                <InputUI label="Années XP" value={cvData.profile.years_experience} onChange={(v) => handleProfileChange('years_experience', v)} />
                <InputUI label="Techno Principale" value={cvData.profile.main_tech} onChange={(v) => handleProfileChange('main_tech', v)} />
              </div>
              <RichTextareaUI label="Bio / Résumé" value={cvData.profile.summary} onChange={(v) => handleProfileChange('summary', v)} />
              <LogoSelectorUI onSelect={(o) => setCvData(p => ({ ...p, profile: { ...p.profile, tech_logos: [...p.profile.tech_logos, o] } }))} label="Technos Banner" suggestions={['drupal', 'symfony', 'react', 'amazonaws', 'azure', 'powerbi', 'postgresql']} />
              <div className="flex flex-wrap gap-2 p-3 bg-slate-900 rounded-lg">
                {cvData.profile.tech_logos.map((l, i) => (
                  <div key={i} className="relative group bg-white/10 p-1.5 rounded">
                    <img src={l.src} className="w-5 h-5 object-contain brightness-0 invert" alt={l.name} />
                    <button onClick={() => setCvData(p => ({ ...p, profile: { ...p.profile, tech_logos: p.profile.tech_logos.filter((_, idx) => idx !== i) } }))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={10}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <div className="flex items-center gap-3 text-smile"><Hexagon size={24}/><h2 className="font-bold uppercase">Soft Skills</h2></div>
              {[0, 1, 2].map(i => (<InputUI key={i} label={`Hexagone #${i+1}`} value={cvData.soft_skills[i]} onChange={(v) => {const s = [...cvData.soft_skills]; s[i] = v; setCvData(p => ({...p, soft_skills: s}));}} />))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <div className="flex items-center gap-3 text-smile"><GraduationCap size={24}/><h2 className="font-bold uppercase">Hard Skills & Formation</h2></div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex gap-2">
                  <input className="flex-1 px-3 py-2 border rounded-lg text-xs" placeholder="Catégorie (ex: Cloud...)" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkillCategory()} />
                  <ButtonUI onClick={addSkillCategory} className="px-3"><Plus size={16}/></ButtonUI>
                </div>
                {Object.entries(cvData.skills_categories).map(([cat, skills]) => (
                  <div key={cat} className="p-3 bg-slate-50 rounded-lg space-y-2 relative">
                    <div className="flex justify-between items-center"><h4 className="text-[10px] font-black uppercase text-slate-400">{cat}</h4><button onClick={() => setCvData(p => { const n = {...p.skills_categories}; delete n[cat]; return {...p, skills_categories: n}; })} className="text-red-300 hover:text-red-500"><Trash2 size={12}/></button></div>
                    {skills.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded shadow-sm gap-2">
                        <input className="text-xs flex-1 outline-none font-bold" value={s.name} onChange={e => updateSkillInCategory(cat, idx, 'name', e.target.value)} />
                        <div className="flex items-center gap-2"><HexagonRating score={s.rating} onChange={r => updateSkillInCategory(cat, idx, 'rating', r)} /><button onClick={() => setCvData(p => { const n = [...p.skills_categories[cat]]; n.splice(idx, 1); return {...p, skills_categories: {...p.skills_categories, [cat]: n}}; })} className="text-slate-300 hover:text-red-500"><X size={10}/></button></div>
                      </div>
                    ))}
                    <div className="flex gap-1 pt-1">
                      <input className="flex-1 px-2 py-1 text-[10px] border rounded" placeholder="Item..." value={newSkillsInput[cat]?.name || ''} onChange={e => setNewSkillsInput(p => ({...p, [cat]: {...(p[cat]||{rating:3}), name: e.target.value}}))} onKeyDown={e => e.key === 'Enter' && addSkillToCategory(cat)} />
                      <ButtonUI onClick={() => addSkillToCategory(cat)} className="p-1 h-auto"><Plus size={12}/></ButtonUI>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <div className="flex justify-between items-center"><div className="flex items-center gap-3 text-smile"><Briefcase size={24}/><h2 className="font-bold uppercase">Expériences</h2></div><ButtonUI onClick={addExperience} variant="outline" className="px-3 py-1 text-xs"><Plus size={14}/> Ajouter</ButtonUI></div>
              {cvData.experiences.map((exp, idx) => (
                <div key={exp.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 relative">
                  <div className="absolute top-4 right-4 flex gap-1">
                    <button onClick={() => moveItem('experiences', idx, 'up')} disabled={idx === 0} className="text-slate-300 hover:text-smile disabled:opacity-10"><ChevronUp size={18}/></button>
                    <button onClick={() => moveItem('experiences', idx, 'down')} disabled={idx === cvData.experiences.length - 1} className="text-slate-300 hover:text-smile disabled:opacity-10"><ChevronDown size={18}/></button>
                    <button onClick={() => removeExperience(exp.id)} className="text-red-300 hover:text-red-500 ml-1"><Trash2 size={16}/></button>
                  </div>
                  <div className="flex items-center gap-4">
                    <DropZoneUI onFile={f => { const r = new FileReader(); r.onload = ev => updateExperience(exp.id, 'client_logo', ev.target.result); r.readAsDataURL(f); }} label="Logo Client" className="flex-1 h-16" />
                    {exp.client_logo && <img src={exp.client_logo} className="h-12 w-12 object-contain" alt=""/>}
                  </div>
                  <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Saut de page manuel</span>
                    <button onClick={() => updateExperience(exp.id, 'forceNewPage', !exp.forceNewPage)}>{exp.forceNewPage ? <ToggleRight className="text-green-500"/> : <ToggleLeft className="text-slate-300"/>}</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputUI label="Client" value={exp.client_name} onChange={v => updateExperience(exp.id, 'client_name', v)} />
                    <InputUI label="Période" value={exp.period} onChange={v => updateExperience(exp.id, 'period', v)} />
                  </div>
                  <InputUI label="Rôle" value={exp.role} onChange={v => updateExperience(exp.id, 'role', v)} />
                  <RichTextareaUI label="Contexte" value={exp.context} onChange={v => updateExperience(exp.id, 'context', v)} />
                  <RichTextareaUI label="Réalisation" value={exp.phases} onChange={v => updateExperience(exp.id, 'phases', v)} />
                  <InputUI label="Environnement (tags séparés par virgules)" value={Array.isArray(exp.tech_stack) ? exp.tech_stack.join(', ') : ''} onChange={v => updateExperience(exp.id, 'tech_stack', v.split(',').map(s=>s.trim()))} />
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
          <div className="print-container block origin-top transition-transform duration-300" style={{ transform: `scale(${zoom})`, height: `${scaledContentHeight}px`, width: `${210 * zoom}mm`, minHeight: 'max-content' }}>
            
            <A4Page>
              <CornerTriangle customLogo={cvData.smileLogo} />
              {!cvData.isAnonymous && cvData.profile.photo && (
                <div className="absolute top-12 right-12 w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-xl z-20 bg-white flex items-center justify-center">
                  <img src={cvData.profile.photo} className="max-w-full max-h-full object-contain" alt="" />
                </div>
              )}
              <div className="pt-36 px-16 pb-0 flex-shrink-0 text-left">
                 <h1 className="uppercase leading-[0.85] mb-8 font-montserrat text-[#333333]">
                   {cvData.isAnonymous ? `${String(cvData.profile.firstname?.[0] || '')}${String(cvData.profile.lastname?.[0] || '')}` : <><span className="text-4xl block font-semibold opacity-90">{cvData.profile.firstname}</span><span className="text-6xl font-black">{cvData.profile.lastname}</span></>}
                 </h1>
                 <div className="inline-block bg-[#2E86C1] text-white font-bold text-xl px-4 py-1 rounded-sm uppercase mb-6 tracking-wider shadow-sm">{cvData.profile.years_experience} ans d'expérience</div>
                 <h2 className="text-3xl font-black text-[#333333] uppercase mb-1 tracking-wide font-montserrat opacity-90">{cvData.profile.current_role}</h2>
                 <div className="text-lg text-[#666666] font-medium uppercase tracking-widest mb-10 border-l-4 border-[#2E86C1] pl-4">{cvData.profile.main_tech}</div>
              </div>
              <div className="flex-1 flex flex-col justify-start pb-12">
                  <div className="px-24 mb-10 relative z-10 flex flex-col items-center">
                     <p className="text-lg text-[#333333] leading-relaxed italic border-t border-slate-100 pt-8 text-center break-words w-full max-w-[160mm]" dangerouslySetInnerHTML={{__html: formatTextForPreview(`"${cvData.profile.summary}"`)}}></p>
                  </div>
                  <div className="w-full bg-[#2E86C1] py-3 px-16 mb-1 flex items-center justify-center gap-10 shadow-inner relative z-10 flex-shrink-0">
                    {cvData.profile.tech_logos.map((logo, i) => (<img key={i} src={logo.src} className="h-14 w-auto object-contain brightness-0 invert opacity-95" alt="" />))}
                  </div>
                  <div className="flex justify-center gap-12 relative z-10 px-10 flex-shrink-0 mt-2">
                    {cvData.soft_skills.map((skill, i) => (
                      <div key={i} className="relative w-40 h-44 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#2E86C1] fill-current drop-shadow-xl"><polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" /></svg>
                        <span className="relative z-10 text-white font-bold text-sm uppercase text-center px-4 leading-tight font-montserrat">{skill || "Skill"}</span>
                      </div>
                    ))}
                  </div>
              </div>
              <Footer />
            </A4Page>

            <A4Page>
              <CornerTriangle customLogo={cvData.smileLogo} />
              <HeaderSmall isAnonymous={cvData.isAnonymous} profile={cvData.profile} role={cvData.profile.current_role} logo={cvData.smileLogo} />
              <div className="grid grid-cols-12 gap-10 mt-20 h-full px-12 flex-1 pb-32 overflow-hidden print:overflow-visible text-left">
                  <div className="col-span-5 border-r border-slate-100 pr-8">
                    <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-8 flex items-center gap-2"><Cpu size={20}/> Mes Compétences</h3>
                    <div className="space-y-8">{Object.entries(cvData.skills_categories).map(([cat, skills]) => (<div key={cat}><h4 className="text-[10px] font-bold text-[#999999] uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">{cat}</h4><div className="space-y-3">{skills.map((skill, i) => (<div key={i} className="flex items-center justify-between"><span className="text-xs font-bold text-[#333333] uppercase">{skill.name}</span><HexagonRating score={skill.rating} /></div>))}</div></div>))}</div>
                  </div>
                  <div className="col-span-7 flex flex-col gap-10">
                    <section>
                      <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-6 flex items-center gap-2"><GraduationCap size={20}/> Ma Formation</h3>
                      <div className="space-y-4">
                        {cvData.education.map((edu, i) => (<div key={i} className="border-l-2 border-slate-100 pl-4"><span className="text-[10px] font-bold text-[#999999] block mb-1">{edu.year}</span><h4 className="text-xs font-bold text-[#333333] uppercase leading-tight">{edu.degree}</h4><span className="text-[9px] text-[#2E86C1] font-medium uppercase">{edu.location}</span></div>))}
                      </div>
                    </section>
                  </div>
              </div>
              <Footer />
            </A4Page>

            {experiencePages.map((chunk, pageIndex) => (
              <A4Page key={pageIndex}>
                <CornerTriangle customLogo={cvData.smileLogo} />
                <HeaderSmall isAnonymous={cvData.isAnonymous} profile={cvData.profile} role={cvData.profile.current_role} logo={cvData.smileLogo} />
                <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-8 mt-16 px-12 flex-shrink-0 text-left">
                  <h3 className="text-xl font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat">{pageIndex === 0 ? "Mes dernières expériences" : "Expériences (Suite)"}</h3>
                  <span className="text-[10px] font-bold text-[#666666] uppercase">Références</span>
                </div>
                <div className="flex-1 px-12 pb-32 overflow-hidden print:overflow-visible">{chunk.map((exp) => (<ExperienceItem key={exp.id} exp={exp} />))}</div>
                <Footer />
              </A4Page>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&family=Open+Sans:wght@400;600;700&display=swap');
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
          .print-container { transform: none !important; margin: 0 !important; width: 100% !important; display: block !important; }
          .A4-page { margin: 0 !important; box-shadow: none !important; page-break-after: always !important; break-after: page !important; width: 210mm !important; height: 297mm !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
