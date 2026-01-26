import React, { useState, useRef } from 'react';
import { 
  ArrowRight, ArrowLeft, Download, Plus, Trash2, MoveUp, MoveDown, 
  Upload, X, Briefcase, GraduationCap, User, Hexagon, Cpu, 
  Image as ImageIcon, ZoomIn, ZoomOut, Search, LayoutTemplate, 
  Save, FolderOpen, Eye, EyeOff, Shield, Edit2, Check,
  Bold, List, Copy
} from 'lucide-react';

// --- CHARTE GRAPHIQUE SMILE ---
const THEME = {
  primary: "#2E86C1", // Smile Blue
  secondary: "#006898", // Darker Blue
  textDark: "#333333", // Anthracite
  textGrey: "#666666", // Grey
  bg: "#FFFFFF"
};

// Helper pour les icônes blanches (Fond bleu)
const getIconUrl = (slug) => `https://cdn.simpleicons.org/${slug.toLowerCase().replace(/\s+/g, '')}/white`;
// Helper pour les icônes colorées (Barre d'outils)
const getBrandIconUrl = (slug) => `https://cdn.simpleicons.org/${slug.toLowerCase().replace(/\s+/g, '')}`;

// --- HELPER FORMATTING ---

// Nettoie et interprète le texte pour l'affichage (Gras, Puces, Sauts de ligne)
const formatTextForPreview = (text) => {
  if (!text) return "";
  // Protection XSS basique : on ne laisse passer que <b>, </b>, <br>, •
  let clean = text
    .replace(/</g, "&lt;").replace(/>/g, "&gt;") // Escape tout
    .replace(/&lt;b&gt;/g, "<b>").replace(/&lt;\/b&gt;/g, "</b>") // Restaure le gras
    .replace(/\n/g, "<br/>"); // Sauts de ligne
  return clean;
};

// --- COMPOSANTS UI ---

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, title = "" }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 justify-center";
  const variants = {
    primary: "bg-[#2E86C1] text-white hover:bg-[#2573a7] shadow-md",
    secondary: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    outline: "border-2 border-[#2E86C1] text-[#2E86C1] hover:bg-blue-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 p-2",
    ghost: "text-slate-500 hover:bg-slate-100",
    toolbar: "p-1.5 hover:bg-slate-200 rounded text-slate-600"
  };
  return (
    <button onClick={onClick} disabled={disabled} title={title} className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, placeholder, maxLength, type = "text" }) => (
  <div className="mb-4">
    <div className="flex justify-between items-baseline mb-1">
      <label className="text-xs font-bold text-[#333333] uppercase tracking-wide">{label}</label>
      {maxLength && <span className={`text-[10px] ${value?.length > maxLength ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{value?.length || 0} / {maxLength}</span>}
    </div>
    <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E86C1] text-sm text-[#333333] transition-all" />
  </div>
);

// --- COMPOSANT TEXTAREA RICHE (Boutons + Liens LLM) ---
const RichTextarea = ({ label, value, onChange, placeholder, maxLength }) => {
  const textareaRef = useRef(null);

  const toggleBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    if (start >= 3 && end <= text.length - 4 && text.substring(start - 3, start) === '<b>' && text.substring(end, end + 4) === '</b>') {
      const newText = text.substring(0, start - 3) + selected + text.substring(end + 4);
      onChange(newText);
      setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start - 3, end - 3); }, 0);
      return;
    }
    if (selected.startsWith('<b>') && selected.endsWith('</b>')) {
      const cleanSelected = selected.substring(3, selected.length - 4);
      const newText = text.substring(0, start) + cleanSelected + text.substring(end);
      onChange(newText);
      setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start, start + cleanSelected.length); }, 0);
      return;
    }
    const newText = text.substring(0, start) + `<b>${selected}</b>` + text.substring(end);
    onChange(newText);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 3, end + 3); }, 0);
  };

  const insertBullet = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(start);
    const newText = `${before}• ${after}`;
    onChange(newText);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 2, start + 2); }, 0);
  };

  // Fonction magique : Copie le texte AVEC PROMPT et ouvre l'IA
  const copyAndOpenAI = (url) => {
    if (value) {
      const prompt = "Agis comme un expert en recrutement. Reformule ce texte pour un CV professionnel (Consultant). Ton 'corporate', direct, concis et percutant. Corrige les fautes. PAS de markdown (**), PAS de guillemets, PAS de phrases d'intro. Texte à améliorer : \n";
      navigator.clipboard.writeText(prompt + value);
      // On pourrait mettre un petit toast ici "Texte copié !"
    }
    window.open(url, '_blank');
  };

  const llmTools = [
    { name: 'ChatGPT', url: 'https://chat.openai.com/', icon: 'openai' },
    { name: 'Gemini', url: 'https://gemini.google.com/', icon: 'googlegemini' },
    { name: 'Claude', url: 'https://claude.ai/', icon: 'anthropic/000000' }, // Force le noir pour Claude
    { name: 'Mistral', url: 'https://chat.mistral.ai/', icon: 'mistral' },
  ];

  return (
    <div className="mb-6 relative">
      <div className="flex justify-between items-end mb-1">
        <label className="text-xs font-bold text-[#333333] uppercase block">{label}</label>
        
        {/* Barre d'outils */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-t-lg px-2 py-1 border border-slate-200 border-b-0 absolute right-0 top-0 transform -translate-y-full">
          <Button variant="toolbar" onClick={toggleBold} title="Gras (On/Off)"><Bold size={12}/></Button>
          <Button variant="toolbar" onClick={insertBullet} title="Insérer une puce"><List size={12}/></Button>
          
          <div className="w-px h-3 bg-slate-300 mx-2"></div>
          <span className="text-[9px] text-slate-400 font-bold mr-1">IA:</span>
          
          {llmTools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => copyAndOpenAI(tool.url)}
              className="p-1 hover:bg-white rounded transition-all hover:scale-110 grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
              title={`Copier texte et ouvrir ${tool.name}`}
            >
              <img src={getBrandIconUrl(tool.icon)} className="w-4 h-4" alt={tool.name} />
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <textarea 
          ref={textareaRef}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg rounded-tr-none text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#2E86C1]" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          maxLength={maxLength}
          placeholder={placeholder}
        />
      </div>
      <p className="text-[9px] text-slate-400 mt-1 italic text-right">Cliquez sur un logo IA pour copier votre texte (avec prompt) et l'améliorer.</p>
    </div>
  );
};

// --- DROPZONE ---
const DropZone = ({ onFile, label = "Déposez une image", icon = <Upload size={16}/>, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); };
  const handleChange = (e) => { if (e.target.files[0]) onFile(e.target.files[0]); };
  return (
    <div className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 ${isDragging ? 'border-[#2E86C1] bg-blue-50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-[#2E86C1] hover:bg-slate-50'} ${className}`} onClick={() => inputRef.current.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={handleChange} />
      <div className={`transition-colors ${isDragging ? 'text-[#2E86C1]' : 'text-slate-400'}`}>{icon}</div>
      <span className={`text-[10px] font-bold uppercase transition-colors ${isDragging ? 'text-[#2E86C1]' : 'text-slate-500'}`}>{isDragging ? "Lâchez l'image !" : label}</span>
    </div>
  );
};

// --- SELECTEUR LOGO ---
const LogoSelector = ({ onSelect, label = "Ajouter un logo" }) => {
  const [search, setSearch] = useState("");
  const handleSearch = () => { if (!search.trim()) return; onSelect({ type: 'url', src: getIconUrl(search), name: search }); setSearch(""); };
  const handleFile = (file) => { if (file) { const reader = new FileReader(); reader.onload = (ev) => onSelect({ type: 'file', src: ev.target.result, name: file.name }); reader.readAsDataURL(file); }};
  return (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
      {label && <label className="text-[10px] font-bold text-[#333333] uppercase block mb-2">{label}</label>}
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <input className="w-full pl-7 pr-2 py-1.5 bg-white border border-slate-300 rounded text-xs" placeholder="Recherche (ex: Java)" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <Search className="absolute left-2 top-2 text-slate-400" size={12} />
        </div>
        <Button variant="primary" className="px-2 py-1 text-xs h-auto" onClick={handleSearch}><Plus size={12}/></Button>
      </div>
      <div className="text-center text-[9px] text-slate-400 mb-2 font-bold uppercase">- OU -</div>
      <DropZone onFile={handleFile} label="Glisser ou Cliquer" icon={<Upload size={14}/>} />
    </div>
  );
};

// --- HEXAGONES ---
const MiniHexagon = ({ filled, onClick }) => (
  <svg viewBox="0 0 100 100" onClick={onClick} className={`w-3 h-3 ${onClick ? 'cursor-pointer hover:scale-125 transition-transform' : ''} ${filled ? 'text-[#2E86C1] fill-current' : 'text-slate-200 fill-current'}`}>
    <polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" />
  </svg>
);
const HexagonRating = ({ score, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (<MiniHexagon key={i} filled={i <= score} onClick={onChange ? () => onChange(i) : undefined} />))}
  </div>
);

// --- COMPOSANT BANDEAU TRIANGLE (Logo Modifiable) ---
const CornerTriangle = ({ customLogo }) => (
  <div className="absolute top-0 left-0 w-[140px] h-[140px] z-50 pointer-events-none overflow-hidden print:w-[120px] print:h-[120px]">
    <div className="absolute top-0 left-0 w-full h-full bg-[#2E86C1]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
    {customLogo ? (
      <div className="absolute top-[10px] left-[10px] w-[60px] h-[60px]">
         <img src={customLogo} className="w-full h-full object-contain brightness-0 invert" style={{ transform: 'rotate(-45deg)' }} />
      </div>
    ) : (
      <div className="absolute top-[25px] left-[25px] transform -rotate-45 origin-center">
        <span className="text-white font-black text-xl tracking-tighter italic block drop-shadow-md">SMILE</span>
      </div>
    )}
  </div>
);

export default function App() {
  const [step, setStep] = useState(1);
  const [zoom, setZoom] = useState(0.55);
  const jsonInputRef = useRef(null);
  
  const [cvData, setCvData] = useState({
    isAnonymous: false,
    smileLogo: null, 
    profile: {
      firstname: "Prénom",
      lastname: "NOM",
      years_experience: "5",
      current_role: "Poste",
      main_tech: "Techno principale",
      summary: "Forte expérience en gestion de projet Drupal et dans l'accompagnement de nos clients.",
      tech_logos: [
        { type: 'url', src: 'https://cdn.simpleicons.org/php/white', name: 'PHP' },
        { type: 'url', src: 'https://cdn.simpleicons.org/drupal/white', name: 'Drupal' },
        { type: 'url', src: 'https://cdn.simpleicons.org/symfony/white', name: 'Symfony' }
      ]
    },
    soft_skills: ["Autonomie", "Rigueur", "Communication"],
    experiences: [
      {
        id: 1,
        client_name: "Disney",
        client_logo: null,
        period: "Jan 2023 - Présent",
        role: "Développeur Frontend",
        objective: "Développer la partie frontend de l'outil Castresa...",
        achievements: ["Participation à la phase de conception", "Adaptation de l'interface"],
        tech_stack: ["Drupal", "Twig"],
        phases: "Conception, Développement"
      }
    ],
    education: [
      { year: "2008/2010", degree: "Master Miage", location: "Orléans" }
    ],
    skills_categories: {
      "Langages": [{ name: "JAVA", rating: 4 }, { name: "PHP", rating: 5 }, { name: "Typescript", rating: 3 }],
      "Outils": [{ name: "Jira", rating: 5 }, { name: "AWS", rating: 3 }],
      "Méthodologies": [{ name: "Agile", rating: 5 }, { name: "Scrum", rating: 5 }]
    }
  });

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null); 
  const [newSkillsInput, setNewSkillsInput] = useState({});

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cvData));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `CV_${cvData.profile.lastname}_Smile.json`;
    a.click();
  };

  const uploadJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try { setCvData(JSON.parse(event.target.result)); } catch (err) { alert("Fichier invalide"); }
    };
    reader.readAsText(file);
  };

  const handleProfileChange = (field, value) => setCvData(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  const addTechLogo = (logoObj) => setCvData(prev => ({ ...prev, profile: { ...prev.profile, tech_logos: [...prev.profile.tech_logos, logoObj] } }));
  const removeTechLogo = (index) => setCvData(prev => ({ ...prev, profile: { ...prev.profile, tech_logos: prev.profile.tech_logos.filter((_, i) => i !== index) } }));

  // Handler Logo Entreprise
  const handleSmileLogo = (file) => {
    if(file) {
       const reader = new FileReader();
       reader.onload = (ev) => setCvData(prev => ({...prev, smileLogo: ev.target.result}));
       reader.readAsDataURL(file);
    }
  };

  const updateExperience = (id, field, value) => setCvData(prev => ({ ...prev, experiences: prev.experiences.map(e => e.id === id ? { ...e, [field]: value } : e) }));
  const addExperience = () => setCvData(prev => ({ ...prev, experiences: [{ id: Date.now(), client_name: "", client_logo: null, period: "", role: "", objective: "", achievements: [], tech_stack: [], phases: "" }, ...prev.experiences] }));
  const removeExperience = (id) => setCvData(prev => ({ ...prev, experiences: prev.experiences.filter(e => e.id !== id) }));
  
  const addSkillCategory = () => { if (newCategoryName && !cvData.skills_categories[newCategoryName]) { setCvData(prev => ({ ...prev, skills_categories: { ...prev.skills_categories, [newCategoryName]: [] } })); setNewCategoryName(""); }};
  const startEditingCategory = (name) => { setEditingCategory({ oldName: name, newName: name }); };
  const saveCategoryRename = () => { if (editingCategory?.newName && editingCategory.newName !== editingCategory.oldName) { setCvData(prev => { const newCats = { ...prev.skills_categories }; const data = newCats[editingCategory.oldName]; delete newCats[editingCategory.oldName]; newCats[editingCategory.newName] = data; return { ...prev, skills_categories: newCats }; }); } setEditingCategory(null); };
  const deleteCategory = (name) => { setCvData(prev => { const newCats = { ...prev.skills_categories }; delete newCats[name]; return { ...prev, skills_categories: newCats }; }); };
  const updateSkillInCategory = (cat, idx, field, value) => { setCvData(prev => { const skills = [...prev.skills_categories[cat]]; skills[idx] = { ...skills[idx], [field]: value }; return { ...prev, skills_categories: { ...prev.skills_categories, [cat]: skills } }; }); };
  const updateNewSkillInput = (cat, field, value) => { setNewSkillsInput(prev => ({ ...prev, [cat]: { ...prev[cat], [field]: value } })); };
  const addSkillToCategory = (cat) => { const input = newSkillsInput[cat] || { name: '', rating: 3 }; if (input.name) { setCvData(prev => ({ ...prev, skills_categories: { ...prev.skills_categories, [cat]: [...prev.skills_categories[cat], { name: input.name, rating: input.rating || 3 }] } })); setNewSkillsInput(prev => ({ ...prev, [cat]: { name: '', rating: 3 } })); }};
  const removeSkillFromCategory = (cat, idx) => { setCvData(prev => ({ ...prev, skills_categories: { ...prev.skills_categories, [cat]: prev.skills_categories[cat].filter((_, i) => i !== idx) } })); };

  const updateEducation = (index, field, value) => { const newEdu = [...cvData.education]; newEdu[index][field] = value; setCvData(prev => ({ ...prev, education: newEdu })); };
  const addEducation = () => setCvData(prev => ({ ...prev, education: [...prev.education, { year: "", degree: "", location: "" }] }));
  const removeEducation = (index) => setCvData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));

  const formatName = () => cvData.isAnonymous ? `${cvData.profile.firstname[0]}. ${cvData.profile.lastname[0]}.` : `${cvData.profile.firstname} ${cvData.profile.lastname}`;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row h-screen overflow-hidden font-sans">
      
      {/* --- WIZARD --- */}
      <div className="w-full md:w-[500px] bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-xl print:hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex justify-between items-center px-4">
           <div className="flex gap-2">
             <Button variant="ghost" className="px-2 py-1 text-xs" onClick={downloadJSON} title="Sauvegarder JSON"><Save size={14}/> Save</Button>
             <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => jsonInputRef.current.click()} title="Charger JSON"><FolderOpen size={14}/> Load</Button>
             <input type="file" ref={jsonInputRef} className="hidden" accept=".json" onChange={uploadJSON} />
           </div>
           <Button variant={cvData.isAnonymous ? "danger" : "secondary"} className="px-2 py-1 text-xs" onClick={() => setCvData(p => ({...p, isAnonymous: !p.isAnonymous}))}>
             {cvData.isAnonymous ? <><Shield size={12}/> Anonyme ON</> : <><Eye size={12}/> Anonyme OFF</>}
           </Button>
        </div>

        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-bold text-xl text-[#2E86C1] flex items-center gap-2">SMILE Edit</h1>
            <span className="text-xs font-bold text-slate-400">Étape {step} / 4</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-[#2E86C1] transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="flex-1"><ArrowLeft size={16} /></Button>
            {step < 4 ? <Button onClick={() => setStep(s => Math.min(4, s + 1))} className="flex-[2]">Suivant <ArrowRight size={16} /></Button> : <Button onClick={() => window.print()} className="flex-[2] bg-slate-900 hover:bg-black">Exporter PDF <Download size={16} /></Button>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-3 mb-4 text-[#2E86C1]"><User size={24} /><h2 className="text-lg font-bold uppercase">Profil</h2></div>
              
              <div className="mb-6 p-4 border border-blue-100 bg-blue-50/50 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2E86C1] rounded flex items-center justify-center text-white font-bold transform -rotate-45 shrink-0 overflow-hidden">
                  {cvData.smileLogo ? (
                    <img src={cvData.smileLogo} className="w-full h-full object-cover brightness-0 invert" alt="Logo" />
                  ) : "S"}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-[#2E86C1] block uppercase mb-1">Logo Entreprise (Triangle)</span>
                  <DropZone onFile={handleSmileLogo} label={cvData.smileLogo ? "Changer le logo" : "Glisser votre logo ici"} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Prénom" value={cvData.profile.firstname} onChange={(v) => handleProfileChange('firstname', v)} />
                <Input label="NOM" value={cvData.profile.lastname} onChange={(v) => handleProfileChange('lastname', v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Années XP" value={cvData.profile.years_experience} onChange={(v) => handleProfileChange('years_experience', v)} />
                <Input label="Techno Principale" value={cvData.profile.main_tech} onChange={(v) => handleProfileChange('main_tech', v)} />
              </div>
              <Input label="Poste Actuel" value={cvData.profile.current_role} onChange={(v) => handleProfileChange('current_role', v)} />
              
              <RichTextarea 
                label="Bio / Résumé" 
                value={cvData.profile.summary} 
                onChange={(val) => handleProfileChange('summary', val)} 
                maxLength={400}
                placeholder="Décrivez votre profil..."
              />

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-[#333333] uppercase block mb-3">Bandeau Technos</label>
                <LogoSelector onSelect={addTechLogo} label="Ajouter une techno" />
                <div className="flex flex-wrap gap-2 mt-4">
                  {cvData.profile.tech_logos.map((logo, i) => (
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
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-3 mb-4 text-[#2E86C1]"><Hexagon size={24} /><h2 className="text-lg font-bold uppercase">Soft Skills</h2></div>
               {[0, 1, 2].map(i => (<Input key={i} label={`Hexagone #${i+1}`} value={cvData.soft_skills[i]} onChange={(v) => {const s = [...cvData.soft_skills]; s[i] = v; setCvData(p => ({...p, soft_skills: s}));}} />))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-4 text-[#2E86C1]">
                <div className="flex items-center gap-3"><Briefcase size={24} /><h2 className="text-lg font-bold uppercase">Expériences</h2></div>
                <Button onClick={addExperience} variant="outline" className="px-3 py-1 text-xs"><Plus size={14} /> Ajouter</Button>
              </div>
              {cvData.experiences.map((exp) => (
                <div key={exp.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group mb-4">
                  <div className="absolute top-4 right-4 flex gap-1"><button onClick={() => removeExperience(exp.id)} className="p-1 bg-red-50 text-red-500 rounded"><Trash2 size={14}/></button></div>
                  <div className="mb-4">
                     <span className="text-xs font-bold text-[#333333] uppercase block mb-2">Logo Client</span>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                           {exp.client_logo ? <img src={exp.client_logo} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-300"/>}
                        </div>
                        <div className="flex-1">
                          <LogoSelector label="" onSelect={(logo) => updateExperience(exp.id, 'client_logo', logo.src)} />
                        </div>
                     </div>
                  </div>
                  <Input label="Client" value={exp.client_name} onChange={(v) => updateExperience(exp.id, 'client_name', v)} />
                  <Input label="Rôle" value={exp.role} onChange={(v) => updateExperience(exp.id, 'role', v)} />
                  <Input label="Période" value={exp.period} onChange={(v) => updateExperience(exp.id, 'period', v)} />
                  <RichTextarea label="Objectif" value={exp.objective} onChange={(v) => updateExperience(exp.id, 'objective', v)} />
                  <RichTextarea label="Réalisation" value={exp.phases} onChange={(v) => updateExperience(exp.id, 'phases', v)} />
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
             <div className="space-y-8 animate-in slide-in-from-right duration-300">
               <div className="flex items-center gap-3 mb-4 text-[#2E86C1]"><GraduationCap size={24} /><h2 className="text-lg font-bold uppercase">Formation</h2></div>
               {cvData.education.map((edu, i) => (
                 <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3 relative group">
                   <button onClick={() => removeEducation(i)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                   <Input label="Diplôme" value={edu.degree} onChange={(v) => updateEducation(i, 'degree', v)} />
                   <div className="grid grid-cols-2 gap-2"><Input label="Année" value={edu.year} onChange={(v) => updateEducation(i, 'year', v)} /><Input label="Lieu" value={edu.location} onChange={(v) => updateEducation(i, 'location', v)} /></div>
                 </div>
               ))}
               <Button onClick={addEducation} variant="secondary" className="w-full text-xs py-2 mt-2">Ajouter Formation</Button>
               <div className="mt-8 border-t border-slate-100 pt-6">
                 <div className="flex items-center gap-3 mb-4 text-[#2E86C1]"><Cpu size={24} /><h2 className="text-lg font-bold uppercase">Compétences Notées</h2></div>
                 <div className="flex gap-2 mb-6">
                   <input className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded text-xs" placeholder="Nouvelle Catégorie" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkillCategory()} />
                   <Button variant="outline" className="px-3 py-1 text-xs" onClick={addSkillCategory}><Plus size={12}/> Ajouter</Button>
                 </div>
                 {Object.entries(cvData.skills_categories).map(([cat, skills]) => (
                   <div key={cat} className="mb-6 p-4 bg-white border border-slate-200 rounded-xl">
                      <div className="flex justify-between items-center mb-3 border-b border-slate-50 pb-2">
                         <div className="flex items-center gap-2 flex-1">
                           {editingCategory?.oldName === cat ? (
                             <div className="flex items-center gap-1 flex-1 mr-2"><input className="w-full px-2 py-1 text-xs border border-blue-300 rounded" autoFocus value={editingCategory.newName} onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && saveCategoryRename()} /><button onClick={saveCategoryRename} className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200"><Check size={12}/></button></div>
                           ) : (
                             <><h3 className="text-sm font-bold text-slate-700 uppercase">{cat}</h3><button onClick={() => startEditingCategory(cat)} className="text-slate-300 hover:text-blue-500"><Edit2 size={12}/></button></>
                           )}
                         </div>
                         <button onClick={() => deleteCategory(cat)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                      </div>
                      <div className="space-y-2 mb-3">
                        {skills.map((skill, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded group">
                             <input className="text-xs font-bold text-slate-700 bg-transparent border-b border-transparent focus:border-[#2E86C1] focus:outline-none w-1/2" value={skill.name} onChange={(e) => updateSkillInCategory(cat, idx, 'name', e.target.value)} />
                             <div className="flex items-center gap-3"><HexagonRating score={skill.rating} onChange={(r) => updateSkillInCategory(cat, idx, 'rating', r)} /><button onClick={() => removeSkillFromCategory(cat, idx)} className="text-slate-300 hover:text-red-600"><X size={12}/></button></div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50/50 p-2 rounded-lg">
                        <input className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded" placeholder="Compétence (ex: Jira)" value={newSkillsInput[cat]?.name || ''} onChange={(e) => updateNewSkillInput(cat, 'name', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkillToCategory(cat)} />
                        <div className="flex items-center gap-1"><span className="text-[9px] text-slate-400 font-bold">NOTE:</span><HexagonRating score={newSkillsInput[cat]?.rating || 3} onChange={(r) => updateNewSkillInput(cat, 'rating', r)} /></div>
                        <Button variant="primary" className="px-2 py-1 text-xs h-auto" onClick={() => addSkillToCategory(cat)}><Plus size={12}/></Button>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-slate-800 overflow-hidden relative flex flex-col items-center">
        <div className="absolute bottom-6 z-50 flex items-center gap-4 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-2xl border border-white/20 print:hidden transition-all hover:scale-105">
           <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="p-2 hover:bg-slate-100 rounded-full"><ZoomOut size={18} /></button>
           <span className="text-xs font-bold text-slate-600 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
           <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-2 hover:bg-slate-100 rounded-full"><ZoomIn size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto w-full p-8 flex justify-center custom-scrollbar">
          <div className="print-container flex flex-col origin-top transition-transform duration-300 gap-10" style={{ transform: `scale(${zoom})`, marginBottom: `${zoom * 100}px` }}>
            {/* PAGE 1 */}
            <div className="cv-page relative overflow-hidden flex flex-col shadow-2xl bg-white">
              <CornerTriangle customLogo={cvData.smileLogo} />
              <div className="pt-24 px-16 pb-0">
                 <h1 className="text-6xl font-bold text-[#333333] uppercase leading-tight mb-2 font-montserrat">{formatName()}</h1>
                 <div className="inline-block bg-[#2E86C1] text-white font-bold text-xl px-4 py-1 rounded-sm uppercase mb-10 tracking-wider">{cvData.profile.years_experience} ans d'expérience</div>
                 <h2 className="text-3xl font-bold text-[#333333] uppercase mb-4 tracking-wide font-montserrat">{cvData.profile.current_role}</h2>
                 <div className="text-xl text-[#666666] font-medium uppercase tracking-widest mb-10 border-l-4 border-[#2E86C1] pl-4">{cvData.profile.main_tech}</div>
              </div>
              <div className="px-16 mb-4 relative z-10">
                 <p className="text-lg text-[#333333] leading-relaxed italic border-t border-slate-100 pt-8" dangerouslySetInnerHTML={{__html: formatTextForPreview(`"${cvData.profile.summary}"`)}}></p>
              </div>
              <div className="w-full bg-[#2E86C1] py-6 px-16 mt-8 mb-8 flex items-center justify-center gap-10 shadow-inner relative z-10">
                {cvData.profile.tech_logos.map((logo, i) => (<img key={i} src={logo.src} className="h-14 w-auto object-contain brightness-0 invert opacity-95 hover:scale-110 transition-transform" alt={logo.name} />))}
                {cvData.profile.tech_logos.length === 0 && <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Technos</span>}
              </div>
              <div className="flex justify-center gap-12 relative z-10 px-10 mb-24 mt-2">
                {cvData.soft_skills.map((skill, i) => (
                  <div key={i} className="relative w-40 h-44 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#2E86C1] fill-current drop-shadow-xl"><polygon points="50 0, 100 25, 100 75, 50 100, 0 75, 0 25" /></svg>
                    <span className="relative z-10 text-white font-bold text-sm uppercase text-center px-4 leading-tight font-montserrat">{skill || "Soft Skill"}</span>
                  </div>
                ))}
              </div>
              <Footer />
            </div>
            {/* PAGE 2 */}
            <div className="cv-page relative flex flex-col p-12 shadow-2xl bg-white">
               <CornerTriangle customLogo={cvData.smileLogo} />
               <HeaderSmall name={formatName()} role={cvData.profile.current_role} />
               <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-8 mt-16 px-4">
                 <h3 className="text-xl font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat">Mes dernières expériences</h3>
                 <span className="text-[10px] font-bold text-[#666666] uppercase">Références</span>
               </div>
               <div className="flex-1 space-y-10 px-4">
                 {cvData.experiences.map((exp) => (
                   <div key={exp.id} className="grid grid-cols-12 gap-6">
                      <div className="col-span-2 flex flex-col items-center pt-2">
                        <div className="w-16 h-16 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-white mb-2">
                           {exp.client_logo ? <img src={exp.client_logo} className="w-full h-full object-cover" /> : <LayoutTemplate size={24} className="text-slate-300"/>}
                        </div>
                        <span className="text-[10px] font-bold text-[#333333] uppercase text-center leading-tight">{exp.client_name}</span>
                      </div>
                      <div className="col-span-10 border-l border-slate-100 pl-6 pb-6">
                        <div className="flex justify-between items-baseline mb-3">
                           <h4 className="text-lg font-bold text-[#333333] uppercase">{exp.client_name} <span className="font-normal text-[#666666]">| {exp.role}</span></h4>
                           <span className="text-xs font-bold text-[#2E86C1] uppercase">{exp.period}</span>
                        </div>
                        <div className="mb-4">
                           <h5 className="text-[10px] font-bold text-[#2E86C1] uppercase mb-1">Objectif</h5>
                           <p className="text-sm text-[#333333] leading-relaxed" dangerouslySetInnerHTML={{__html: formatTextForPreview(exp.objective)}}></p>
                        </div>
                        <div className="flex gap-8 mt-4 pt-4 border-t border-slate-50">
                           <div className="flex-1"><h5 className="text-[10px] font-bold text-[#999999] uppercase mb-1">Réalisation</h5><p className="text-xs font-medium text-[#333333]" dangerouslySetInnerHTML={{__html: formatTextForPreview(exp.phases)}}></p></div>
                           <div className="flex-[2]"><h5 className="text-[10px] font-bold text-[#999999] uppercase mb-1">Environnement</h5><div className="flex flex-wrap gap-1">{exp.tech_stack.map((t, i) => <span key={i} className="text-xs font-bold text-[#2E86C1] bg-blue-50 px-2 py-0.5 rounded">{t}</span>)}</div></div>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
               <Footer />
            </div>
            {/* PAGE 3 */}
            <div className="cv-page relative flex flex-col p-12 shadow-2xl bg-white">
               <CornerTriangle customLogo={cvData.smileLogo} />
               <HeaderSmall name={formatName()} role={cvData.profile.current_role} />
               <div className="grid grid-cols-12 gap-10 mt-20 h-full px-4">
                  <div className="col-span-5 border-r border-slate-100 pr-8">
                     <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-8 flex items-center gap-2"><GraduationCap /> Ma Formation</h3>
                     <div className="space-y-8">{cvData.education.map((edu, i) => (<div key={i}><span className="text-xs font-bold text-[#666666] block mb-1">{edu.year}</span><h4 className="text-sm font-bold text-[#333333] uppercase leading-tight mb-1">{edu.degree}</h4><span className="text-xs text-[#2E86C1] font-medium">{edu.location}</span></div>))}</div>
                  </div>
                  <div className="col-span-7 pl-4">
                     <h3 className="text-lg font-bold text-[#2E86C1] uppercase tracking-wide font-montserrat mb-8 flex items-center gap-2"><Cpu /> Mes Compétences</h3>
                     <div className="space-y-8">{Object.entries(cvData.skills_categories).map(([cat, skills]) => (<div key={cat}><h4 className="text-xs font-bold text-[#999999] uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">{cat}</h4><div className="grid grid-cols-2 gap-x-4 gap-y-3">{skills.map((skill, i) => (<div key={i} className="flex items-center justify-between"><span className="text-xs font-bold text-[#333333]">{skill.name}</span><HexagonRating score={skill.rating} /></div>))}</div></div>))}</div>
                  </div>
               </div>
               <Footer />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-sans { font-family: 'Open Sans', sans-serif; }
        .cv-page { width: 210mm; height: 297mm; background: white; flex-shrink: 0; box-sizing: border-box; page-break-after: always; position: relative; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .cv-page { width: 210mm; height: 297mm; margin: 0; page-break-after: always; box-shadow: none; }
          .print-hidden { display: none !important; }
          .print-container { box-shadow: none; transform: none !important; margin-bottom: 0 !important; gap: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}

const HeaderSmall = ({ name, role }) => (
  <div className="flex justify-between items-start border-b-2 border-[#2E86C1] pb-4 pt-10 px-4">
    <div><div className="w-10 h-10"></div></div>
    <div className="text-right">
      <h3 className="text-sm font-bold text-[#333333] uppercase">{name}</h3>
      <p className="text-[10px] font-bold text-[#999999] uppercase">{role}</p>
    </div>
  </div>
);

const Footer = () => (
  <div className="absolute bottom-8 left-12 right-12 border-t border-slate-100 pt-4 flex justify-between items-center">
    <div className="text-[8px] font-bold text-[#999999] uppercase tracking-widest">
      Smile - IT is Open <span className="text-[#2E86C1] ml-1">CRÉATEUR D'EXPÉRIENCE DIGITALE OUVERTE</span>
    </div>
    <div className="text-[8px] font-bold text-[#333333]">#MadeWithSmile</div>
  </div>
);
