import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Download, Plus, Trash2, MoveUp, MoveDown, 
  Upload, X, Briefcase, GraduationCap, User, Hexagon, Cpu, 
  ImageIcon, ZoomIn, ZoomOut, Search, LayoutTemplate, 
  Save, FolderOpen, Eye, Shield, Check, Edit2,
  Bold, List, Copy, HelpCircle, RefreshCw, Cloud, Mail, Printer,
  ChevronUp, ChevronDown, Award, Factory, ToggleLeft, ToggleRight, FilePlus,
  FileSearch, Loader2, Lock, Sparkles, AlertCircle, LifeBuoy, GripVertical
} from 'lucide-react';

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
    {customLogo && customLogo !== "null" && (
      <div className="absolute top-[12px] left-[12px] w-[100px] h-[100px] flex items-center justify-center">
         <img src={customLogo} onError={handleImageError} className="max-w-full max-h-full object-contain brightness-0 invert" style={{ transform: 'rotate(-45deg)' }} alt="Logo" />
      </div>
    )}
  </div>
);

const HeaderSmall = ({ isAnonymous, profile, role, logo }) => {
  const nameDisplay = isAnonymous 
    ? `${profile.firstname?.[0] || ''}${profile.lastname?.substring(0, 2) || ''}` 
    : `${profile.firstname} ${profile.lastname}`;
    
  return (
    <div className="flex justify-between items-start border-b-2 border-[#2E86C1] pb-4 pt-6 px-12 flex-shrink-0 text-left">
      <div className="w-12 h-12 flex items-center justify-center text-left">
          {logo && logo !== "null" && <img src={logo} onError={handleImageError} className="max-w-full max-h-full object-contain brightness-0 invert" alt="Logo" />}
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
      <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-white mb-2 p-1 text-center">
        {exp.client_logo && exp.client_logo !== "null" ? (
          <img src={exp.client_logo} onError={handleImageError} className="max-w-full max-h-full object-contain" alt="Logo Client" />
        ) : (
          <span className="text-[8px] font-black text-[#2E86C1] uppercase leading-tight px-1 break-words">
            {String(exp.client_name || '')}
          </span>
        )}
      </div>
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

  const handleTextChange = (e) => {
    onChange(e.target.value);
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
      const fullText = prompt + value;
      const textArea = document.createElement("textarea");
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    window.open(url, '_blank');
  };

  return (
    <div className="mb-6 text-left">
      <div className="flex justify-between items-end mb-1 text-left">
        <label className="text-xs font-bold text-[#333333] uppercase block">{String(label)}</label>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#2E86C1] transition-all shadow-sm">
        <div className="flex flex-col bg-white border-b border-slate-200 text-left">
          <div className="px-3 py-1 bg-blue-50/50 border-b border-slate-50">
            <p className="text-[9px] font-bold text-[#2E86C1] flex items-center gap-1 uppercase tracking-tight text-left">
              <Sparkles size={10}/> Cliquez sur l'IA, puis faites simplement COLLER dans la fenêtre qui s'ouvre.
            </p>
          </div>
          
          <div className="flex items-center gap-1 px-2 py-1.5 text-left">
            <ButtonUI variant="toolbar" onClick={() => insertTag('b')} title="Gras"><Bold size={12}/></ButtonUI>
            <ButtonUI variant="toolbar" onClick={() => insertTag('list')} title="Puce"><List size={12}/></ButtonUI>
            <div className="w-px h-3 bg-slate-300 mx-1"></div>
            <span className="text-[9px] text-slate-400 font-bold mr-1 uppercase tracking-tighter">IA:</span>
            {[
              { name: 'ChatGPT', url: 'https://chat.openai.com/', domain: 'openai.com' },
              { name: 'Gemini', url: 'https://gemini.google.com/', icon: 'googlegemini' },
              { name: 'Claude', url: 'https://claude.ai/', icon: 'anthropic' },
              { name: 'Mistral', url: 'https://chat.mistral.ai/', domain: 'mistral.ai' }
            ].map((tool) => (
              <button key={tool.name} onClick={() => copyToClipboard(tool.url)} className="p-1 hover:bg-slate-100 rounded transition-all hover:scale-110 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 text-left" title={`Copier & Ouvrir ${tool.name}`}>
                <img 
                  src={tool.domain ? `https://www.google.com/s2/favicons?domain=${tool.domain}&sz=64` : `https://cdn.simpleicons.org/${tool.icon}`} 
                  onError={handleImageError} 
                  className="w-4 h-4 object-contain" 
                  alt={tool.name} 
                />
              </button>
            ))}
          </div>
        </div>
        <textarea 
          ref={textareaRef} 
          className="w-full px-4 py-3 bg-transparent text-sm h-32 resize-none focus:outline-none border-none shadow-inner text-left" 
          value={value || ''} 
          onChange={handleTextChange} 
          placeholder={placeholder} 
        />
      </div>
    </div>
  );
};

const DropZoneUI = ({ onFile, label = "Déposez une image", icon = <Upload size={16}/>, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 ${isDragging ? 'border-[#2E86C1] bg-blue-50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-[#2E86C1] hover:bg-slate-50'} ${className}`} 
      onClick={() => inputRef.current.click()} 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} 
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
    >
      <input type="file" style={{display: 'none'}} ref={inputRef} accept="image/*" onChange={(e) => { if(e.target.files[0]) onFile(e.target.files[0]); }} />
      <div className={`transition-colors ${isDragging ? 'text-[#2E86C1]' : 'text-slate-400'}`}>{icon}</div>
      <span className={`text-[10px] font-bold uppercase transition-colors px-2 leading-tight ${isDragging ? 'text-[#2E86C1]' : 'text-slate-500'}`}>{isDragging ? "Lâchez l'image !" : label}</span>
    </div>
  );
};

// --- MÉTHODE MIXTE HARMONISÉE AVEC SUGGESTIONS ---
const LogoSelectorUI = ({ onSelect, label, suggestions = [] }) => {
  const [search, setSearch] = useState("");
  
  const handleSelect = (query) => {
    if (!query) return;
    let finalSrc = "";
    if (query.includes('.')) {
      finalSrc = getClearbitUrl(query);
    } else {
      finalSrc = getIconUrl(query);
    }
    onSelect({ type: 'url', src: finalSrc, name: query });
    setSearch("");
  };

  const handleFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onSelect({ type: 'file', src: ev.target.result, name: file.name.split('.')[0] });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner text-left mb-4">
      {label && <label className="text-[10px] font-black text-slate-500 uppercase block mb-3 tracking-widest">{String(label)}</label>}
      
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
          {suggestions.map((slug) => (
            <button 
              key={slug} 
              onClick={() => handleSelect(slug)} 
              className="p-1.5 hover:bg-blue-50 rounded-md transition-all group relative"
              title={slug}
            >
              <img 
                src={getIconUrl(slug)} 
                onError={handleImageError} 
                className="w-5 h-5 object-contain grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100 group-hover:scale-110" 
                alt={slug} 
              />
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-3 text-left">
        <div className="relative flex-1 text-left">
          <input 
            className="w-full pl-8 pr-2 py-2 bg-white border border-slate-300 rounded-lg text-xs text-left focus:ring-2 focus:ring-[#2E86C1] outline-none transition-all" 
            placeholder="Nom (ex: drupal) ou Domaine (ex: google.com)" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSelect(search)} 
          />
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
        </div>
        <ButtonUI variant="primary" className="px-3 h-auto" onClick={() => handleSelect(search)}><Plus size={14}/></ButtonUI>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-200"></div></div>
        <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-tighter"><span className="bg-slate-50 px-2 text-slate-400">Ou charger un fichier</span></div>
      </div>

      <DropZoneUI onFile={handleFile} label="Glisser image personnalisée" icon={<Upload size={14}/>} className="mt-3 py-4" />
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
  
  // États pour gérer le drag and drop
  const [draggedSkill, setDraggedSkill] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [draggedEduIndex, setDraggedEduIndex] = useState(null);
  const [draggedExpIndex, setDraggedExpIndex] = useState(null);
  const [draggedCertIndex, setDraggedCertIndex] = useState(null);

  const [cvData, setCvData] = useState(() => {
    try {
      const saved = localStorage.getItem('smile_cv_data_final_v30_stable');
      if (saved) return JSON.parse(saved);
    } catch(e) { console.error(e); }
    return DEFAULT_CV_DATA;
  });

  useEffect(() => {
    const accepted = localStorage.getItem('smile_cv_privacy_accepted');
    if (!accepted) {
      setShowPrivacyNotice(true);
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => { 
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; 
      }
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('smile_cv_data_final_v30_stable', JSON.stringify(cvData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cvData]);

  const getFilenameBase = () => {
    const year = new Date().getFullYear();
    if (cvData.isAnonymous) return `CV_Anonyme_${year}`;
    const clean = (str) => String(str || "").replace(/[^a-z0-9]/gi, '_').toUpperCase();
    return `CV ${year} - ${clean(cvData.profile.lastname)} - ${clean(cvData.profile.firstname)}`;
  };

  useEffect(() => { document.title = getFilenameBase(); }, [cvData.profile, cvData.isAnonymous]);

  const extractTextFromPDF = async (file) => {
    if (!window.pdfjsLib) {
      throw new Error("La bibliothèque PDF n'est pas encore prête. Réessayez dans un instant.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const handlePDFImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    setShowAIConsent(true);
    e.target.value = null; 
  };

  const confirmAIAnalysis = async () => {
    if (!pendingFile) return;
    setShowAIConsent(false);
    setIsImporting(true);
    setImportError(null);
    try {
      let rawText = await extractTextFromPDF(pendingFile);
      // Nettoyage agressif pour limiter la taille du payload
      rawText = rawText.replace(/\s+/g, ' ').trim().substring(0, 15000);
      
      const prompt = `Agis comme un expert Smile. Analyse ce texte de CV et retourne un objet JSON structuré. 
Règles de formatage impératives :
- profile.summary : doit être un paragraphe unique (PAS DE PUCES), maximum 7 lignes.
- experiences[].phases : doit être une liste à puces (•) avec les ACTIONS réalisées (commençant par des verbes d'action).
- profile (firstname, lastname, current_role, years_experience, main_tech)
- education (year, degree, location)
- skills_categories (Langages, Outils, etc.)
- certifications (name)
Texte : ${rawText}`;

      // Appel vers le backend (Proxy Vercel)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erreur lors de l'analyse");
      }

      const result = await response.json();
      
      setCvData(prev => ({
        ...prev,
        ...result,
        profile: { ...prev.profile, ...result.profile },
        experiences: (result.experiences || []).map((exp, idx) => ({ 
          ...exp, 
          id: Date.now() + idx, 
          client_logo: null,
          forceNewPage: false 
        }))
      }));
    } catch (err) {
      console.error("Détails de l'erreur d'import:", err);
      setImportError(err.message || "Erreur lors de l'analyse IA.");
    } finally {
      setIsImporting(false);
      setPendingFile(null);
    }
  };

  const handleProfileChange = (f, v) => setCvData(p => ({ ...p, profile: { ...p.profile, [f]: v } }));
  const handlePhotoUpload = (file) => { if(file) { const reader = new FileReader(); reader.onload = (ev) => setCvData(prev => ({...prev, profile: { ...prev.profile, photo: ev.target.result }})); reader.readAsDataURL(file); } };
  const addTechLogo = (o) => setCvData(p => ({ ...p, profile: { ...p.profile, tech_logos: [...p.profile.tech_logos, o] } }));
  const removeTechLogo = (i) => setCvData(p => ({ ...p, profile: { ...p.profile, tech_logos: p.profile.tech_logos.filter((_, idx) => idx !== i) } }));
  const handleSmileLogo = (file) => { if(file) { const reader = new FileReader(); reader.onload = (ev) => setCvData(prev => ({...prev, smileLogo: ev.target.result})); reader.readAsDataURL(file); } };
  
  const moveItem = (listName, index, direction) => {
    const list = [...cvData[listName]];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target >= 0 && target < list.length) {
      [list[index], list[target]] = [list[target], list[index]];
      setCvData(p => ({ ...p, [listName]: list }));
    }
  };

  const updateExperience = (id, f, v) => setCvData(p => ({ ...p, experiences: p.experiences.map(e => e.id === id ? { ...e, [f]: v } : e) }));
  const addExperience = () => setCvData(p => ({ ...p, experiences: [{ id: Date.now(), client_name: "", client_logo: null, period: "", role: "", context: "", phases: "", achievements: [], tech_stack: [], forceNewPage: false }, ...p.experiences] }));
  const removeExperience = (id) => setCvData(p => ({ ...p, experiences: p.experiences.filter(e => e.id !== id) }));
  
  const addSkillCategory = () => { if (newCategoryName) { setCvData(p => ({ ...p, skills_categories: { ...p.skills_categories, [newCategoryName]: [] } })); setNewCategoryName(""); } };
  const deleteCategory = (n) => setCvData(p => { const newC = { ...p.skills_categories }; delete newC[n]; return { ...p, skills_categories: newC }; });
  const updateSkillInCategory = (cat, idx, f, v) => setCvData(p => { const s = [...p.skills_categories[cat]]; s[idx] = { ...s[idx], [f]: v }; return { ...p, skills_categories: { ...p.skills_categories, [cat]: s } }; });
  const addSkillToCategory = (cat) => { const i = newSkillsInput[cat] || { name: '', rating: 3 }; if (i.name) { setCvData(p => ({ ...p, skills_categories: { ...p.skills_categories, [cat]: [...p.skills_categories[cat], { name: i.name, rating: i.rating }] } })); setNewSkillsInput(p => ({ ...p, [cat]: { name: '', rating: 3 } })); } };
  const updateNewSkillInput = (cat, field, val) => { setNewSkillsInput(p => ({ ...p, [cat]: { ...(p[cat] || { name: '', rating: 3 }), [field]: val } })); };
  const removeSkillFromCategory = (cat, idx) => setCvData(p => ({ ...p, skills_categories: { ...p.skills_categories, [cat]: p.skills_categories[cat].filter((_, i) => i !== idx) } }));
  
  const handleDragOver = (e) => e.preventDefault();

  const handleSkillDragStart = (cat, index) => setDraggedSkill({ cat, index });
  const handleSkillDrop = (targetCat, targetIndex) => {
    if (!draggedSkill || draggedSkill.cat !== targetCat) { setDraggedSkill(null); return; }
    const skills = [...cvData.skills_categories[targetCat]];
    const [moved] = skills.splice(draggedSkill.index, 1);
    skills.splice(targetIndex, 0, moved);
    setCvData(prev => ({ ...prev, skills_categories: { ...prev.skills_categories, [targetCat]: skills } }));
    setDraggedSkill(null);
  };

  const handleCategoryDragStart = (catName) => setDraggedCategory(catName);
  const handleCategoryDrop = (targetCatName) => {
    if (!draggedCategory || draggedCategory === targetCatName) { setDraggedCategory(null); return; }
    const keys = Object.keys(cvData.skills_categories);
    const fromIdx = keys.indexOf(draggedCategory);
    const toIdx = keys.indexOf(targetCatName);
    const newKeys = [...keys];
    const [moved] = newKeys.splice(fromIdx, 1);
    newKeys.splice(toIdx, 0, moved);
    const newCategories = {};
    newKeys.forEach(k => { newCategories[k] = cvData.skills_categories[k]; });
    setCvData(prev => ({ ...prev, skills_categories: newCategories }));
    setDraggedCategory(null);
  };

  const handleEduDragStart = (index) => setDraggedEduIndex(index);
  const handleEduDrop = (targetIndex) => {
    if (draggedEduIndex === null || draggedEduIndex === targetIndex) { setDraggedEduIndex(null); return; }
    const list = [...cvData.education];
    const [moved] = list.splice(draggedEduIndex, 1);
    list.splice(targetIndex, 0, moved);
    setCvData(prev => ({ ...prev, education: list }));
    setDraggedEduIndex(null);
  };

  const handleExpDragStart = (index) => setDraggedExpIndex(index);
  const handleExpDrop = (targetIndex) => {
    if (draggedExpIndex === null || draggedExpIndex === targetIndex) { setDraggedExpIndex(null); return; }
    const list = [...cvData.experiences];
    const [moved] = list.splice(draggedExpIndex, 1);
    list.splice(targetIndex, 0, moved);
    setCvData(prev => ({ ...prev, experiences: list }));
    setDraggedExpIndex(null);
  };

  const handleCertDragStart = (index) => setDraggedCertIndex(index);
  const handleCertDrop = (targetIndex) => {
    if (draggedCertIndex === null || draggedCertIndex === targetIndex) { setDraggedCertIndex(null); return; }
    const list = [...cvData.certifications];
    const [moved] = list.splice(draggedCertIndex, 1);
    list.splice(targetIndex, 0, moved);
    setCvData(prev => ({ ...prev, certifications: list }));
    setDraggedCertIndex(null);
  };

  const addSecteur = () => { if (newSecteur) { setCvData(p => ({ ...p, connaissances_sectorielles: [...p.connaissances_sectorielles, newSecteur] })); setNewSecteur(""); }};
  const removeSecteur = (idx) => setCvData(p => ({ ...p, connaissances_sectorielles: p.connaissances_sectorielles.filter((_, i) => i !== idx) }));
  
  const addCertification = (o) => setCvData(p => ({ ...p, certifications: [...p.certifications, { name: o.name, logo: o.src }] }));
  const removeCertification = (idx) => setCvData(p => ({ ...p, certifications: p.certifications.filter((_, i) => i !== idx) }));
  
  const updateEducation = (i, f, v) => { const n = [...cvData.education]; n[i][f] = v; setCvData(p => ({ ...p, education: n })); };
  const addEducation = () => setCvData(p => ({ ...p, education: [...p.education, { year: "", degree: "", location: "" }] }));
  
  const removeEducation = (i) => setCvData(prev => ({
    ...prev,
    education: prev.education.filter((_, idx) => idx !== i)
  }));
  
  const acceptPrivacy = () => {
    localStorage.setItem('smile_cv_privacy_accepted', 'true');
    setShowPrivacyNotice(false);
    setShowGuide(true);
  };

  const handlePurgeData = () => {
    localStorage.removeItem('smile_cv_data_final_v30_stable');
    localStorage.removeItem('smile_cv_privacy_accepted');
    setCvData(DEFAULT_CV_DATA);
    setShowPurgeConfirm(false);
    setShowPrivacyNotice(true); 
  };

  const resetCV = () => { setCvData(DEFAULT_CV_DATA); setShowResetConfirm(false); };
  const downloadJSON = () => { const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cvData)); a.download = `${getFilenameBase()}.json`; a.click(); };
  
  const uploadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImportError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const importedData = JSON.parse(String(ev.target.result));
        setCvData(prev => ({
          ...DEFAULT_CV_DATA,
          ...importedData,
          profile: { ...DEFAULT_CV_DATA.profile, ...(importedData.profile || {}) },
          experiences: Array.isArray(importedData.experiences) ? importedData.experiences : prev.experiences,
          education: Array.isArray(importedData.education) ? importedData.education : prev.education,
          connaissances_sectorielles: Array.isArray(importedData.connaissances_sectorielles) ? importedData.connaissances_sectorielles : prev.connaissances_sectorielles,
          certifications: Array.isArray(importedData.certifications) ? importedData.certifications : prev.certifications,
          soft_skills: Array.isArray(importedData.soft_skills) ? importedData.soft_skills : prev.soft_skills,
          skills_categories: importedData.skills_categories || prev.skills_categories
        }));
      } catch (err) {
        console.error("Erreur lecture JSON:", err);
        setImportError("Le fichier JSON est corrompu ou invalide.");
      } finally {
        e.target.value = ""; 
      }
    };
    reader.readAsText(file);
  };
  
  const handleEmailSend = () => {
    const namePart = cvData.isAnonymous ? "Anonyme" : `${cvData.profile.firstname} ${cvData.profile.lastname}`;
    const subject = encodeURIComponent(`CV Smile : ${namePart}`);
    const body = encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint mon CV aux formats PDF et JSON.\n\nCordialement.`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const experiencePages = paginateExperiences(cvData.experiences);
  const totalPages = 2 + experiencePages.length; 
  const scaledContentHeight = (totalPages * 1122.5 * zoom) + ((totalPages - 1) * 40 * zoom) + (20 * zoom);

  const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      const content = document.querySelector('.print-container').innerHTML;
      const styles = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML).join('\n');
      printWindow.document.write(`<html><head><title>${getFilenameBase()}</title><script src="https://cdn.tailwindcss.com"></script><style>${styles}</style><style>@page { size: A4; margin: 0; } body { margin: 0; padding: 0; background: white; width: 210mm; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .A4-page { box-shadow: none !important; margin: 0 !important; page-break-after: always !important; height: 297mm !important; width: 210mm !important; display: flex !important; flex-direction: column !important; } .triangle-bg, .bg-[#2E86C1], .bg-blue-50, .hexagon-fill { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: inherit !important; fill: inherit !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }</style></head><body onload="setTimeout(() => { window.print(); window.close(); }, 1000)"><div class="flex flex-col">${content}</div></body></html>`);
      printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row h-screen overflow-hidden font-sans text-left">
      
      {showPrivacyNotice && (
        <ModalUI 
          title="Notice de Confidentialité & RGPD" 
          confirmText="J'ai compris et j'accepte"
          onConfirm={acceptPrivacy}
          icon={<Shield size={32} />}
          danger={false}
        >
          <div className="space-y-3">
            <p>Pour garantir la protection de vos données personnelles conformément au RGPD :</p>
            <ul className="list-disc pl-4 space-y-1 text-xs text-left">
              <li><strong>Stockage Local :</strong> Vos données sont enregistrées exclusivement dans votre navigateur (localStorage). Elles ne sont jamais stockées sur nos serveurs.</li>
              <li><strong>Intelligence Artificielle :</strong> L'importation PDF utilise l'API Google Gemini via un proxy sécurisé.</li>
              <li><strong>Services Tiers :</strong> L'affichage des logos s'appuie sur SimpleIcons et Clearbit.</li>
            </ul>
          </div>
        </ModalUI>
      )}

      {showGuide && (
        <ModalUI 
          title="Guide de Rédaction Smile" 
          confirmText="C'est noté !"
          onConfirm={() => setShowGuide(false)}
          icon={<LifeBuoy size={32} />}
          danger={false}
        >
          <div className="space-y-4 text-left text-sm text-slate-600">
            <p>Quelques conseils pour un CV parfait :</p>
            <ul className="list-disc pl-4 space-y-2">
              <li><strong>Photo :</strong> Privilégiez un fond neutre et une tenue professionnelle.</li>
              <li><strong>Résumé :</strong> Soyez concis (3-4 lignes max) et mettez en avant votre valeur ajoutée.</li>
              <li><strong>Expériences :</strong> Distinguez bien le <em>Contexte</em> (équipe, méthode, enjeux) de la <em>Réalisation</em> (vos actions concrètes).</li>
            </ul>
          </div>
        </ModalUI>
      )}

      {showAIConsent && (
        <ModalUI 
          title="Autoriser l'analyse par l'IA ?" 
          confirmText="Autoriser et Analyser"
          onClose={() => { setShowAIConsent(false); setPendingFile(null); }}
          onConfirm={confirmAIAnalysis}
          icon={<Sparkles size={32} />}
          danger={false}
        >
          <div className="space-y-3 text-left">
            <p>Le contenu de votre fichier sera envoyé à l'intelligence artificielle pour extraction des données.</p>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-[11px] text-blue-700">
              Note : Les données sont traitées de manière éphémère.
            </div>
          </div>
        </ModalUI>
      )}

      {showResetConfirm && (
        <ModalUI title="Réinitialiser le formulaire ?" onClose={() => setShowResetConfirm(false)} onConfirm={resetCV}>
          <p>Toutes les modifications non sauvegardées seront perdues.</p>
        </ModalUI>
      )}

      {showPurgeConfirm && (
        <ModalUI title="Supprimer définitivement ?" onClose={() => setShowPurgeConfirm(false)} onConfirm={handlePurgeData} confirmText="Oui, purger tout">
          <p>Toutes vos données seront supprimées de votre navigateur. Cette action est irréversible.</p>
        </ModalUI>
      )}

      {/* FORMULAIRE */}
      <div className="w-full md:w-[500px] bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-xl print:hidden text-left">
        
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 space-y-4 text-left">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 text-left">
              <button className="flex-1 bg-[#2E86C1] hover:bg-[#2573a7] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md transition-all uppercase text-sm" onClick={() => pdfInputRef.current.click()} disabled={isImporting}>
                {isImporting ? <Loader2 size={18} className="animate-spin text-white"/> : <FileSearch size={18} className="text-white"/>}
                <span className="drop-shadow-sm">{isImporting ? "Analyse..." : "Import PDF"}</span>
              </button>
              <button className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 border transition-all text-sm uppercase ${cvData.isAnonymous ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white text-slate-600 border-slate-200 shadow-sm hover:bg-slate-50'}`} onClick={() => setCvData(p => ({...p, isAnonymous: !p.isAnonymous}))}>
                <Lock size={16}/> {cvData.isAnonymous ? "Anonyme" : "Anonymiser"}
              </button>
              <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf" onChange={handlePDFImport} />
            </div>
            {importError && (
              <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-[10px] font-bold">
                <AlertCircle size={14} /> {importError}
                <button onClick={() => setImportError(null)} className="ml-auto hover:text-red-800"><X size={12}/></button>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between px-2 py-4 text-left">
            <button className="flex-1 flex flex-col items-center gap-1.5 group" onClick={() => setShowResetConfirm(true)}>
              <RefreshCw size={22} className="text-slate-400 group-hover:text-[#2E86C1] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Refresh</span>
            </button>
            <div className="w-px h-10 bg-slate-100"></div>
            <button className="flex-1 flex flex-col items-center gap-1.5 group" onClick={downloadJSON}>
              <Save size={22} className="text-slate-400 group-hover:text-[#2E86C1] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Save</span>
            </button>
            <div className="w-px h-10 bg-slate-100"></div>
            <button className="flex-1 flex flex-col items-center gap-1.5 group" onClick={() => jsonInputRef.current.click()}>
              <FolderOpen size={22} className="text-slate-400 group-hover:text-[#2E86C1] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Upload</span>
              <input type="file" ref={jsonInputRef} className="hidden" accept=".json" onChange={uploadJSON} />
            </button>
            <div className="w-px h-10 bg-slate-100"></div>
            <button className="flex-1 flex flex-col items-center gap-1.5 group" onClick={handleEmailSend}>
              <Mail size={22} className="text-slate-400 group-hover:text-[#2E86C1] transition-colors"/>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-left">Send</span>
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-20 text-left">
          <div className="flex justify-between items-center mb-6 text-left">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl text-[#2E86C1] text-left">Smile Editor</h1>
              <button onClick={() => setShowGuide(true)} className="text-slate-400 hover:text-[#2E86C1] transition-colors p-1 rounded-full hover:bg-slate-50" title="Guide de rédaction">
                <LifeBuoy size={20} />
              </button>
            </div>
            <span className="text-xs font-bold text-slate-400 text-left">Étape {step} / 4</span>
          </div>
          <div className="flex gap-2 text-left">
            <button className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed text-left" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}><ArrowLeft size={16} /></button>
            {step < 4 ? (
              <button className="flex-[2] bg-[#2E86C1] text-white hover:bg-[#2573a7] px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2 justify-center" onClick={() => setStep(s => Math.min(4, s + 1))}>Suivant <ArrowRight size={16} /></button>
            ) : (
              <button className="flex-[2] bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2 justify-center" onClick={handlePrint}><Printer size={16} /> Générer PDF</button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar text-left">
            {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right transition-all text-left">
              <div className="flex items-center gap-3 mb-4 text-[#2E86C1] text-left"><User size={24} /><h2 className="text-lg font-bold uppercase text-left">Profil</h2></div>
              <div className="grid grid-cols-2 gap-4 mb-6 text-left">
                <div className="p-3 border border-blue-100 bg-blue-50/50 rounded-lg flex flex-col gap-2 text-left">
                  <span className="text-[10px] font-bold text-[#2E86C1] uppercase text-left">Logo Entreprise (Import Manuel)</span>
                  <DropZoneUI onFile={handleSmileLogo} label={cvData.smileLogo ? "Changer Logo" : "Charger Logo"} className="h-24 bg-white text-left" />
                </div>
                <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg flex flex-col gap-2 text-left">
                  <span className="text-[10px] font-bold text-slate-600 uppercase flex items-center justify-between text-left">Photo Profil</span>
                  <DropZoneUI onFile={handlePhotoUpload} label={cvData.profile.photo ? "Changer" : "Glisser-déposer photo"} icon={<User size={16}/>} className="h-24 bg-white text-left" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <InputUI label="Prénom" value={cvData.profile.firstname} onChange={(v) => handleProfileChange('firstname', v)} />
                <InputUI label="NOM" value={cvData.profile.lastname} onChange={(v) => handleProfileChange('lastname', v)} />
              </div>
              <InputUI label="Poste Actuel" value={cvData.profile.current_role} onChange={(v) => handleProfileChange('current_role', v)} />
              <div className="grid grid-cols-2 gap-4 text-left">
                <InputUI label="Années XP" value={cvData.profile.years_experience} onChange={(v) => handleProfileChange('years_experience', v)} />
                <InputUI label="Techno Principale" value={cvData.profile.main_tech} onChange={(v) => handleProfileChange('main_tech', v)} />
              </div>
              <RichTextareaUI label="Bio / Résumé" value={cvData.profile.summary} onChange={(val) => handleProfileChange('summary', val)} />
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-left">
                <LogoSelectorUI 
                  onSelect={addTechLogo} 
                  label="Technologies (Suggestions Smile)" 
                  suggestions={[
                    'drupal', 'symfony', 'php', 'react', 'python', 
                    'powerbi', 'snowflake', 'databricks', 'apachenifi', 'amazonaws', 'googlecloud', 'azure', 
                    'mysql', 'postgresql', 'docker', 'git', 'javascript', 'tailwindcss'
                  ]}
                />
                
                <div className="flex flex-wrap gap-2 mt-4 p-4 bg-slate-900 rounded-lg border border-slate-800 shadow-inner text-left">
                  {cvData.profile.tech_logos.map((logo, i) => (
                    <div key={i} className="relative group bg-white/10 p-2 rounded-md border border-white/5 transition-colors hover:bg-white/20 text-left">
                      <img src={logo.src} onError={handleImageError} className="w-6 h-6 object-contain brightness-0 invert text-left" alt={logo.name} />
                      <button onClick={() => removeTechLogo(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 shadow-sm text-left"><X size={10} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 text-left">
                <button onClick={() => setShowPrivacyNotice(true)} className="text-[10px] text-slate-400 hover:text-[#2E86C1] flex items-center gap-1 uppercase font-bold transition-colors text-left">
                  <Shield size={12}/> Notice de confidentialité
                </button>
                <button onClick={() => setShowPurgeConfirm(true)} className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 uppercase font-bold transition-colors text-left">
                  <Trash2 size={12}/> Supprimer mes données
                </button>
              </div>
            </div>
            )}

            {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right transition-all text-left">
                <div className="flex items-center gap-3 mb-4 text-[#2E86C1] text-left"><Hexagon size={24} /><h2 className="text-lg font-bold uppercase text-left">Soft Skills</h2></div>
                {[0, 1, 2].map(i => (<InputUI key={i} label={`Hexagone #${i+1}`} value={cvData.soft_skills[i]} onChange={(v) => {const s = [...cvData.soft_skills]; s[i] = v; setCvData(p => ({...p, soft_skills: s}));}} />))}
            </div>
            )}

            {step === 3 && (
             <div className="space-y-8 animate-in slide-in-from-right transition-all text-left">
               <div className="flex items-center gap-3 mb-4 text-[#2E86C1] text-left"><GraduationCap size={24} /><h2 className="text-lg font-bold uppercase text-left">Formation & Compétences</h2></div>
               
               {/* SECTION CERTIFICATIONS AVEC DRAG & DROP */}
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm text-left">
                 <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 text-left">Secteur & Certifs</h3>
                 <div className="flex gap-2 mb-4 text-left">
                   <input className="flex-1 px-3 py-1.5 border rounded text-xs text-left" placeholder="Secteur..." value={newSecteur} onChange={e=>setNewSecteur(e.target.value)} onKeyDown={e=>e.key==='Enter' && addSecteur()} />
                   <ButtonUI variant="primary" className="p-1 h-auto text-left" onClick={addSecteur}><Plus size={10}/></ButtonUI>
                 </div>
                 <div className="flex flex-wrap gap-1 mb-4 text-left">{(cvData.connaissances_sectorielles || []).map((s, i) => (<span key={i} className="bg-white text-[9px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 uppercase text-left">{s} <X size={10} className="cursor-pointer text-left" onClick={() => removeSecteur(i)}/></span>))}</div>
                 
                 <LogoSelectorUI 
                   onSelect={addCertification} 
                   label="Certifications (Suggestions Smile)" 
                   suggestions={['drupal', 'scrumalliance', 'amazonwebservices', 'googlecloud', 'microsoftazure', 'symfony']}
                 />
                 
                 <div className="mt-2 space-y-1 text-left">
                    {(cvData.certifications || []).map((c, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center justify-between text-[10px] bg-white p-1.5 rounded border uppercase font-bold text-left gap-2 transition-all ${draggedCertIndex === i ? 'opacity-30 border-dashed border-blue-400' : 'hover:bg-blue-50/50 cursor-default'}`}
                        draggable
                        onDragStart={() => handleCertDragStart(i)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleCertDrop(i)}
                      >
                        <GripVertical size={14} className="text-slate-300 cursor-grab active:cursor-grabbing" />
                        {c.logo && <img src={c.logo} onError={handleImageError} className="w-5 h-5 object-contain" alt="" />}
                        <span className="flex-1 text-left">{c.name}</span>
                        <button onClick={()=>removeCertification(i)} className="text-slate-300 hover:text-red-500"><X size={12}/></button>
                      </div>
                    ))}
                 </div>
               </div>

               {/* SECTION DIPLÔMES AVEC DRAG & DROP */}
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm text-left">
                 <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 text-left">Parcours Académique</h3>
                 {(cvData.education || []).map((edu, i) => (
                    <div 
                      key={i} 
                      className={`bg-white p-3 rounded-lg border mb-3 relative group shadow-sm text-left transition-all ${draggedEduIndex === i ? 'opacity-30 border-dashed border-blue-400' : ''}`}
                      draggable
                      onDragStart={() => handleEduDragStart(i)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleEduDrop(i)}
                    >
                      <div className="absolute top-2 left-2 text-slate-200 group-hover:text-slate-400 transition-colors cursor-grab active:cursor-grabbing">
                        <GripVertical size={16}/>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 text-left">
                        <button onClick={() => moveItem('education', i, 'up')} disabled={i === 0} className="text-slate-300 hover:text-blue-500 disabled:opacity-20 transition-colors text-left"><ChevronUp size={16}/></button>
                        <button onClick={() => moveItem('education', i, 'down')} disabled={i === cvData.education.length - 1} className="text-slate-300 hover:text-blue-500 disabled:opacity-20 transition-colors text-left"><ChevronDown size={16}/></button>
                        <button onClick={() => removeEducation(i)} className="text-slate-300 hover:text-red-500 ml-1 text-left"><Trash2 size={14}/></button>
                      </div>
                      <div className="pl-6">
                        <InputUI label="Diplôme" value={edu.degree} onChange={v => updateEducation(i, 'degree', v)} />
                        <div className="grid grid-cols-2 gap-2 text-left">
                          <InputUI label="Année" value={edu.year} onChange={v => updateEducation(i, 'year', v)} />
                          <InputUI label="Lieu" value={edu.location} onChange={v => updateEducation(i, 'location', v)} />
                        </div>
                      </div>
                    </div>
                 ))}
                 <ButtonUI onClick={addEducation} variant="secondary" className="w-full text-xs py-2 mt-2 shadow-sm text-left">Ajouter Formation</ButtonUI>
               </div>

               {/* SECTION COMPÉTENCES */}
               <div className="bg-white p-4 rounded-xl border border-slate-200 text-left">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 text-left">Niveau Compétences</h3>
                  {Object.entries(cvData.skills_categories).map(([cat, skills], catIdx) => (
                    <div 
                      key={cat} 
                      className={`mb-4 p-3 bg-slate-50 rounded-lg text-left relative transition-all ${draggedCategory === cat ? 'opacity-30 border-dashed border-2 border-blue-400' : ''}`}
                      draggable
                      onDragStart={() => handleCategoryDragStart(cat)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleCategoryDrop(cat)}
                    >
                      <div className="flex justify-between items-center mb-2 text-left">
                        <div className="flex items-center gap-2 flex-1">
                          <GripVertical size={16} className="text-slate-300 cursor-grab active:cursor-grabbing flex-shrink-0" />
                          <h4 className="text-xs font-bold uppercase text-left">{cat}</h4>
                        </div>
                        <button onClick={() => deleteCategory(cat)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                      </div>
                      
                      <div className="space-y-1 mb-3 text-left">
                        {(skills || []).map((skill, idx) => (
                          <div 
                            key={`${cat}-${idx}`} 
                            className="flex items-center justify-between text-xs bg-white p-1.5 rounded shadow-sm text-left gap-2 group/item"
                            draggable
                            onDragStart={() => handleSkillDragStart(cat, idx)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleSkillDrop(cat, idx)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                               <GripVertical size={14} className="text-slate-300 cursor-grab flex-shrink-0" />
                               <input 
                                 className="bg-transparent outline-none flex-1 font-medium text-left truncate" 
                                 value={skill.name} 
                                 onChange={(e) => updateSkillInCategory(cat, idx, 'name', e.target.value)} 
                               />
                            </div>
                            <HexagonRating score={skill.rating} onChange={(r) => updateSkillInCategory(cat, idx, 'rating', r)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
               </div>
             </div>
            )}

            {step === 4 && (
             <div className="space-y-8 animate-in slide-in-from-right duration-300 text-left">
               <div className="flex justify-between items-center mb-4 text-[#2E86C1] text-left">
                 <div className="flex items-center gap-3 text-left">
                   <Briefcase size={24} />
                   <h2 className="text-lg font-bold uppercase text-left">Expériences</h2>
                 </div>
                 <ButtonUI onClick={addExperience} variant="outline" className="px-3 py-1 text-xs text-left"><Plus size={14} /> Ajouter</ButtonUI>
               </div>
               
               {(cvData.experiences || []).map((exp, index) => (
                 <div 
                   key={exp.id} 
                   className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group mb-4 text-left transition-all ${draggedExpIndex === index ? 'opacity-30 border-dashed border-blue-400' : ''}`}
                   draggable
                   onDragStart={() => handleExpDragStart(index)}
                   onDragOver={handleDragOver}
                   onDrop={() => handleExpDrop(index)}
                 >
                   <div className="absolute top-4 left-4 text-slate-200 group-hover:text-slate-400 cursor-grab">
                      <GripVertical size={20}/>
                   </div>

                   <div className="absolute top-4 right-4 flex gap-1 text-left">
                     <button onClick={() => moveItem('experiences', index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-blue-500 disabled:opacity-20 transition-colors text-left"><ChevronUp size={18}/></button>
                     <button onClick={() => moveItem('experiences', index, 'down')} disabled={index === cvData.experiences.length - 1} className="text-slate-300 hover:text-blue-500 disabled:opacity-20 transition-colors text-left"><ChevronDown size={18}/></button>
                     <button onClick={() => removeExperience(exp.id)} className="text-red-300 hover:text-red-500 ml-1 text-left"><Trash2 size={16}/></button>
                   </div>

                   <div className="pl-8">
                     <div className="mb-4 text-left">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Logo Client (Import Manuel)</span>
                        <DropZoneUI 
                          onFile={(file) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => updateExperience(exp.id, 'client_logo', ev.target.result);
                            reader.readAsDataURL(file);
                          }}
                          label={exp.client_logo ? "Changer Logo" : "Charger Logo"}
                          className="h-20 bg-slate-50 border-slate-200"
                        />
                        {exp.client_logo && (
                          <div className="mt-2 relative inline-block">
                             <img src={exp.client_logo} onError={handleImageError} className="h-12 w-auto object-contain bg-white rounded border p-1" alt="" />
                             <button onClick={() => updateExperience(exp.id, 'client_logo', null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm"><X size={10}/></button>
                          </div>
                        )}
                     </div>

                     <InputUI label="Nom du Client" value={exp.client_name} onChange={(v) => updateExperience(exp.id, 'client_name', v)} />
                     <InputUI label="Rôle" value={exp.role} onChange={(v) => updateExperience(exp.id, 'role', v)} />
                     <div className="grid grid-cols-2 gap-4 text-left">
                       <InputUI label="Période" value={exp.period} onChange={(v) => updateExperience(exp.id, 'period', v)} />
                       <InputUI label="Environnement Tech" value={Array.isArray(exp.tech_stack) ? exp.tech_stack.join(', ') : exp.tech_stack} onChange={(v) => updateExperience(exp.id, 'tech_stack', String(v).split(',').map(s=>s.trim()))} />
                     </div>
                     <RichTextareaUI label="Contexte" value={exp.context} onChange={(v) => updateExperience(exp.id, 'context', v)} />
                     <RichTextareaUI label="Réalisation" value={exp.phases} onChange={(v) => updateExperience(exp.id, 'phases', v)} />
                   </div>
                 </div>
               ))}
             </div>
            )}
        </div>
      </div>

      {/* --- PREVIEW AREA --- */}
      <div className="flex-1 bg-slate-800 overflow-hidden relative flex flex-col items-center text-left">
        <div className="absolute bottom-6 z-50 flex items-center gap-4 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-2xl print:hidden transition-all hover:scale-105 text-left">
            <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="p-2 hover:bg-slate-100 rounded-full"><ZoomOut size={18} /></button>
            <span className="text-xs font-bold text-slate-600 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-2 hover:bg-slate-100 rounded-full"><ZoomIn size={18} /></button>
        </div>

        <div className="flex-1 overflow-auto w-full p-8 flex justify-center custom-scrollbar border-l border-slate-700 text-left">
          <div 
            className="print-container block origin-top transition-transform duration-300 text-left" 
            style={{ transform: `scale(${zoom})`, height: `${scaledContentHeight}px`, width: `${210 * zoom}mm`, minHeight: 'max-content' }}
          >
            <A4Page>
              <CornerTriangle customLogo={cvData.smileLogo} />
              {!cvData.isAnonymous && cvData.profile.photo && cvData.profile.photo !== "null" && (
                <div className="absolute top-12 right-12 w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-xl z-20 bg-white flex items-center justify-center text-left">
                  <img src={cvData.profile.photo} onError={handleImageError} className="max-w-full max-h-full object-contain" alt="Portrait" />
                </div>
              )}
              <div className="pt-36 px-16 pb-0 flex-shrink-0 text-left">
                 <h1 className="uppercase leading-[0.85] mb-8 font-montserrat text-[#333333] text-left">
                   {cvData.isAnonymous 
                    ? `${String(cvData.profile.firstname?.[0] || '')}${String(cvData.profile.lastname?.substring(0, 2) || '')}` 
                    : <><span className="text-4xl block font-semibold opacity-90 text-left">{String(cvData.profile.firstname)}</span><span className="text-6xl font-black text-left">{String(cvData.profile.lastname)}</span></>}
                 </h1>
                 <div className="inline-block bg-[#2E86C1] text-white font-bold text-xl px-4 py-1 rounded-sm uppercase mb-6 tracking-wider shadow-sm text-left">{String(cvData.profile.years_experience)} ans d'expérience</div>
                 <h2 className="text-3xl font-black text-[#333333] uppercase mb-1 tracking-wide font-montserrat opacity-90 text-left">{String(cvData.profile.current_role)}</h2>
                 <div className="text-lg text-[#666666] font-medium uppercase tracking-widest mb-10 border-l-4 border-[#2E86C1] pl-4 text-left">{String(cvData.profile.main_tech)}</div>
              </div>
              <div className="flex-1 flex flex-col justify-start pt-0 pb-12 overflow-hidden text-center text-left">
                  <div className="px-24 mb-10 relative z-10 flex flex-col items-center text-center text-left">
                     <p className="text-lg text-[#333333] leading-relaxed italic border-t border-slate-100 pt-8 text-center break-words w-full max-w-[160mm] text-left" dangerouslySetInnerHTML={{__html: formatTextForPreview(`"${cvData.profile.summary}"`)}}></p>
                  </div>
                  <div className="w-full bg-[#2E86C1] py-3 px-16 mb-1 flex items-center justify-center gap-10 shadow-inner relative z-10 flex-shrink-0 text-left tech-banner">
                    {(cvData.profile.tech_logos || []).map((logo, i) => (
                      logo.src && logo.src !== "null" ? <img key={i} src={logo.src} onError={handleImageError} className="h-14 w-auto object-contain brightness-0 invert opacity-95 transition-transform" alt={String(logo.name)} /> : null
                    ))}
                  </div>
                  <div className="flex justify-center gap-12 relative z-10 px-10 flex-shrink-0 mt-2 text-left">
                    {(cvData.soft_skills || []).map((skill, i) => (
                      <div key={i} className="relative w-40 h-44 flex items-center justify-center text-left">
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#2E86C1] fill-current drop-shadow-xl text-left hexagon-shape"><polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" /></svg>
                        <span className="relative z-10 text-white font-bold text-sm uppercase text-center px-4 leading-tight font-montserrat text-left">{String(skill || "Skill")}</span>
                      </div>
                    ))}
                  </div>
              </div>
              <Footer />
            </A4Page>

            <A4Page>
              <CornerTriangle customLogo={cvData.smileLogo} />
              <HeaderSmall isAnonymous={cvData.isAnonymous} profile={cvData.profile} role={cvData.profile.current_role} logo={cvData.smileLogo} />
              <div className="grid grid-cols-12 gap-10 mt-8 h-full px-12 flex-1 pb-32 overflow-hidden print:overflow-visible text-left">
                  <div className="col-span-5 border-r border-slate-100 pr-8 text-left">
                    <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-8 flex items-center gap-2 text-left"><Cpu size={20}/> Mes Compétences</h3>
                    <div className="space-y-8 text-left">{Object.entries(cvData.skills_categories || {}).map(([cat, skills]) => (<div key={cat}><h4 className="text-[10px] font-bold text-[#999999] uppercase tracking-widest border-b border-slate-100 pb-2 mb-3 text-left">{String(cat)}</h4><div className="space-y-3 text-left">{(skills || []).map((skill, i) => (<div key={i} className="flex items-center justify-between text-left"><span className="text-xs font-bold text-[#333333] uppercase text-left">{String(skill.name)}</span><HexagonRating score={skill.rating} /></div>))}</div></div>))}</div>
                  </div>
                  <div className="col-span-7 flex flex-col gap-10 text-left">
                    {cvData.showSecteur && (cvData.connaissances_sectorielles || []).length > 0 && (<section className="text-left"><h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-4 flex items-center gap-2 text-left"><Factory size={20}/> Connaissances Sectorielles</h3><div className="flex flex-wrap gap-2 text-left">{(cvData.connaissances_sectorielles || []).map((s, i) => (<span key={i} className="border-2 border-[#2E86C1] text-[#2E86C1] text-[10px] font-black px-3 py-1 rounded uppercase tracking-wider text-left">{String(s)}</span>))}</div></section>)}
                    {cvData.showCertif && (cvData.certifications || []).length > 0 && (
                      <section className="text-left">
                        <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-4 flex items-center gap-2 text-left"><Award size={20}/> Certifications</h3>
                        <div className="grid grid-cols-2 gap-4 text-left">
                          {cvData.certifications.map((c, i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-50 p-2 rounded text-left">
                              {c.logo && c.logo !== "null" && <img src={c.logo} onError={handleImageError} className="w-8 h-8 object-contain" alt={String(c.name)} />}
                              <span className="text-[10px] font-bold text-slate-700 uppercase leading-tight text-left">{String(c.name)}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                    <section className="text-left"><h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-6 flex items-center gap-2 text-left"><GraduationCap size={20}/> Ma Formation</h3><div className="space-y-4 text-left">{(cvData.education || []).map((edu, i) => (<div key={i} className="border-l-2 border-slate-100 pl-4 text-left"><span className="text-[10px] font-bold text-[#999999] block mb-1 text-left">{String(edu.year)}</span><h4 className="text-xs font-bold text-[#333333] uppercase leading-tight text-left">{String(edu.degree)}</h4><span className="text-[9px] text-[#2E86C1] font-medium uppercase text-left">{String(edu.location)}</span></div>))}</div></section>
                  </div>
              </div>
              <Footer />
            </A4Page>

            {experiencePages.map((chunk, pageIndex) => (
              <A4Page key={pageIndex}>
                <CornerTriangle customLogo={cvData.smileLogo} />
                <HeaderSmall isAnonymous={cvData.isAnonymous} profile={cvData.profile} role={cvData.profile.current_role} logo={cvData.smileLogo} />
                <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-8 mt-8 px-12 flex-shrink-0 text-left"><h3 className="text-xl font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat">{pageIndex === 0 ? "Mes dernières expériences" : "Expériences (Suite)"}</h3><span className="text-[10px] font-bold text-[#666666] uppercase text-left">Références</span></div>
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
          .print-container { transform: none !important; margin: 0 !important; width: 100% !important; display: block !important; }
          .A4-page { margin: 0 !important; box-shadow: none !important; page-break-after: always !important; break-after: page !important; width: 210mm !important; height: 297mm !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
