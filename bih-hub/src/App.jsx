import { useState, useEffect, useRef, useCallback } from "react";
import { loadAll, saveAll } from "./storage";

// ─── TOAST ──────────────────────────────────────────────────────────────────
let toastTimeout;
function showToast(msg = "✦ Salvo") {
  const el = document.getElementById("bih-toast");
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = "1";
  el.style.transform = "translateY(0)";
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
  }, 2200);
}

// ─── INITIAL DATA ──────────────────────────────────────────────────────────
const INITIAL_METAS = {
  meta1Label: "Meta Lote 0", meta1Sub: "membras no primeiro lote", meta1Val: "", meta1Real: 0,
  meta2Label: "Meta Total", meta2Sub: "membras ao fim do lançamento", meta2Val: "", meta2Real: 0,
  meta3Label: "Meta de Receita", meta3Sub: "faturamento no mês", meta3Val: "", meta3Real: 0,
};

const INITIAL_VISAO = {
  focoTitulo: "Lançamento da Comunidade MANI",
  focoDesc: "Todos os conteúdos deste mês apontam para um único destino: a Comunidade. Cada post constrói desejo, autoridade e antecipação.",
  focoEsteira: "WhatsApp → APP (R$247) → Comunidade → Premium",
  lancamentoData: "2026-04-06",
  lancamentoLote: "Lote 0 · R$ 997",
  semanas: [
    { num:"01", datas:"10–16 mar", titulo:"Posicionamento & Autoridade", desc:"Conteúdos que mostram quem você é e o que transforma. Reels de quebra-mito, carrossel do método M.A.N.I., stories de bastidores.", cor:"#6B5BB5" },
    { num:"02", datas:"17–23 mar", titulo:"Educação & Prova Social", desc:"Depoimentos reais, resultados de alunas, conteúdo educativo que gera valor e aquece para o lançamento.", cor:"#2563AB" },
    { num:"03", datas:"24–30 mar", titulo:"Antecipação da Comunidade", desc:"Revelação progressiva. Benefícios exclusivos. Lista VIP aberta. CTA: 'comenta COMUNIDADE'.", cor:"#C9A96E" },
    { num:"04", datas:"6 abr+", titulo:"🚀 Abertura das Inscrições", desc:"Lote 0 → Lote 1 → Valor fixo. Stories de bastidores, boas-vindas, onboarding visível.", cor:"#C4887A" },
  ],
};

const INITIAL_IDEIAS = [
  { id: 1, titulo: "3 sinais de que você já está manifestando (mas não percebe)", formato: "Reels", tag: "Autoridade", obs: "Alto potencial de engajamento — ressoa com quem duvida do processo", comentario: "", aprovado: false },
  { id: 2, titulo: "O erro que impede sua manifestação de acontecer", formato: "Reels", tag: "Educativo", obs: "Problema + solução. Alto potencial de salvamento.", comentario: "", aprovado: false },
  { id: 3, titulo: "Guia: como criar seu ritual de manifestação em 5 passos", formato: "Carrossel", tag: "Viral", obs: "Conteúdo salvo e compartilhado. Fundo de funil leve.", comentario: "", aprovado: false },
  { id: 4, titulo: "Por que a maioria das pessoas desiste antes de manifestar", formato: "Carrossel", tag: "Objeção", obs: "Quebra de objeção. Prepara o terreno pro lançamento.", comentario: "", aprovado: false },
  { id: 5, titulo: "Resultados de alunas: o que mudou depois de 30 dias", formato: "Carrossel", tag: "Prova Social", obs: "Fundamental antes do lançamento da Comunidade.", comentario: "", aprovado: false },
  { id: 6, titulo: "Bastidores: como é trabalhar sua espiritualidade no dia a dia", formato: "Stories", tag: "Conexão", obs: "Humanização + conexão com a audiência.", comentario: "", aprovado: false },
];

const INITIAL_REUNIOES = [
  {
    id: 1, data: "2026-03-11", titulo: "Alinhamento inicial & estratégia de março",
    notas: "→ Data de lançamento ajustada: semana do dia 6–10 de abril (definir data exata por energia)\n→ Comunidade MANI: produto separado do método, com APP próprio, 16 membras (7 ativas e presentes)\n→ APP Meu Manifesto: ~30–35 membros ativos\n→ Esteira: WhatsApp gratuito → APP Meu Manifesto → Comunidade MANI → Serviços (mesa despertar / alinhamentos)\n→ Instagram: blocos semanais temáticos. 2 Reels técnicos + 1 Reels falado + 4 templates curtos (7s)\n→ TikTok: reativar com super-nicho específico (ex: manifestação em relacionamentos ou neurociência da manifestação)\n→ Spotify: host-read ad no início e no meio de cada episódio\n→ WhatsApp: áudio diário leve, sem entregar o método, 1 menção APP/semana\n→ Produto sazonal R$47 (portais energéticos): antecipar 3–4 dias com conteúdo voltado à data portal\n→ Grupo Instagram (2.300 pessoas morto): estratégia de reativação com conteúdo de manutenção\n→ Próximos passos: Júnior sugere temas → Bih adiciona ideias no Hub → Júnior devolve roteiro em até 48h"
  }
];

const INITIAL_CHECKLIST = [
  { id: 1, texto: "Definir nome oficial da Comunidade", done: false },
  { id: 2, texto: "Definir estratégia de antecipação", done: true },
  { id: 3, texto: "Criar página de vendas (Hotmart/Kiwify)", done: false },
  { id: 4, texto: "Definir preço e estrutura dos lotes", done: true },
  { id: 5, texto: "Definir data exata do lançamento (6–10 abr)", done: false },
  { id: 6, texto: "Gravar conteúdos de antecipação (sem. 3)", done: false },
  { id: 7, texto: "Preparar sequência de stories do lançamento", done: false },
  { id: 8, texto: "Configurar plataforma da comunidade", done: false },
  { id: 9, texto: "Abrir lista VIP para lote 0", done: false },
  { id: 10, texto: "Lançamento — abrir inscrições", done: false },
];

const INITIAL_CAL = [
  [
    { d: null }, { d: null }, { d: null }, { d: null },
    { d: 7 }, { d: 8 }, { d: 9 },
  ],
  [
    { d: 10, pills: [{ l: "Reels", c: "reels" }], tema: "Quebra-mito: você não manifesta porque não sustenta" },
    { d: 11 },
    { d: 12, pills: [{ l: "Carrossel", c: "car" }], tema: "Os 3 pilares do M.A.N.I." },
    { d: 13, pills: [{ l: "Stories", c: "st" }], tema: "Bastidores: preparando a comunidade" },
    { d: 14, pills: [{ l: "Reels", c: "reels" }], tema: "Depoimento de aluna do APP" },
    { d: 15, pills: [{ l: "Podcast", c: "pod" }], tema: "Ep. semanal + host-read ad" },
    { d: 16 },
  ],
  [
    { d: 17, pills: [{ l: "Carrossel", c: "car" }], tema: "O que muda em 30 dias de prática" },
    { d: 18, pills: [{ l: "Stories", c: "st" }], tema: "Enquete: o que te impede de manifestar?" },
    { d: 19, pills: [{ l: "Reels", c: "reels" }], tema: "Prova social: transformação real" },
    { d: 20, pills: [{ l: "Podcast", c: "pod" }], tema: "Ep. semanal + host-read ad" },
    { d: 21, pills: [{ l: "Reels", c: "reels" }], tema: "Pré-abertura: o que é a Comunidade" },
    { d: 22 },
    { d: 23 },
  ],
  [
    { d: 24, pills: [{ l: "Carrossel", c: "car" }], tema: "Revelação: o que você recebe na Comunidade" },
    { d: 25, pills: [{ l: "Stories", c: "st" }], tema: "Benefícios exclusivos dia a dia" },
    { d: 26, pills: [{ l: "Reels", c: "reels" }], tema: "Abre a lista VIP — urgência e pertencimento" },
    { d: 27, pills: [{ l: "Stories", c: "st" }], tema: "CTA: 'comenta COMUNIDADE'" },
    { d: 28, pills: [{ l: "Podcast", c: "pod" }], tema: "Ep. semanal + host-read ad" },
    { d: 29, pills: [{ l: "Reels", c: "reels" }], tema: "Últimas vagas — o que te espera lá dentro" },
    { d: 30 },
  ],
  [
    { d: 31, launch: true, tema: "✦ Abertura Lote 0 — R$ 997" },
    { d: "1/abr", launch: true, tema: "✦ Stories de boas-vindas + onboarding" },
    { d: "2/abr", launch: true, tema: "✦ Encerramento Lote 0 — abre Lote 1" },
    { d: "3/abr" }, { d: "4/abr" }, { d: "5/abr" }, { d: "6/abr" },
  ],
];

const PILL_STYLES = {
  reels:  { bg: "#EDE8FF", color: "#6B5BB5" },
  car:    { bg: "#E8F4FF", color: "#2563AB" },
  st:     { bg: "#FFF0E8", color: "#C4703B" },
  pod:    { bg: "#E8FFF0", color: "#166534" },
  launch: { bg: "linear-gradient(135deg,#FFE8CC,#FFD4A0)", color: "#8B5E00" },
  tiktok: { bg: "#F0F0F0", color: "#333" },
  live:   { bg: "#FFE8F0", color: "#8B1A4A" },
};

const TAG_COLORS = {
  "Autoridade": "#6B5BB5", "Educativo": "#2563AB", "Viral": "#166534",
  "Objeção": "#C4703B", "Prova Social": "#8B5E00", "Conexão": "#8B3A5A", "Lançamento": "#C4887A",
};

const FORMATOS = ["Reels", "Carrossel", "Stories", "Live", "TikTok", "Podcast"];
const TAGS = ["Autoridade", "Educativo", "Viral", "Objeção", "Prova Social", "Conexão", "Lançamento"];
const PILL_OPTIONS = ["Reels", "Carrossel", "Stories", "Podcast", "TikTok", "Live"];
const PILL_KEY = { "Reels":"reels", "Carrossel":"car", "Stories":"st", "Podcast":"pod", "TikTok":"tiktok", "Live":"live" };

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("visao");
  const [metas, setMetas] = useState(INITIAL_METAS);
  const [visao, setVisao] = useState(INITIAL_VISAO);
  const [ideias, setIdeias] = useState(INITIAL_IDEIAS);
  const [reunioes, setReunioes] = useState(INITIAL_REUNIOES);
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [cal, setCal] = useState(INITIAL_CAL);
  const [loading, setLoading] = useState(true);
  const [calHover, setCalHover] = useState(null);
  const lastSaveRef = useRef(null);

  const buildSavePayload = useCallback((patch) => ({
    metas, visao, ideias, reunioes, checklist, cal, ...patch
  }), [metas, visao, ideias, reunioes, checklist, cal]);

  const persist = useCallback((patch) => {
    const payload = buildSavePayload(patch);
    saveAll(payload);
    lastSaveRef.current = Date.now();
  }, [buildSavePayload]);

  useEffect(() => {
    (async () => {
      const fallback = { metas: INITIAL_METAS, visao: INITIAL_VISAO, ideias: INITIAL_IDEIAS, reunioes: INITIAL_REUNIOES, checklist: INITIAL_CHECKLIST, cal: INITIAL_CAL };
      const data = await loadAll(fallback);
      setMetas(data.metas || INITIAL_METAS);
      setVisao(data.visao || INITIAL_VISAO);
      setIdeias(data.ideias || INITIAL_IDEIAS);
      setReunioes(data.reunioes || INITIAL_REUNIOES);
      setChecklist(data.checklist || INITIAL_CHECKLIST);
      setCal(data.cal || INITIAL_CAL);
      setLoading(false);
    })();
  }, []);

  // Sync real-time every 15s
  useEffect(() => {
    const interval = setInterval(async () => {
      if (lastSaveRef.current && Date.now() - lastSaveRef.current < 5000) return;
      const fallback = { metas: INITIAL_METAS, visao: INITIAL_VISAO, ideias: INITIAL_IDEIAS, reunioes: INITIAL_REUNIOES, checklist: INITIAL_CHECKLIST, cal: INITIAL_CAL };
      const data = await loadAll(fallback);
      if (data) {
        setMetas(data.metas || INITIAL_METAS);
        setVisao(data.visao || INITIAL_VISAO);
        setIdeias(data.ideias || INITIAL_IDEIAS);
        setReunioes(data.reunioes || INITIAL_REUNIOES);
        setChecklist(data.checklist || INITIAL_CHECKLIST);
        setCal(data.cal || INITIAL_CAL);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const updateMetas = (next) => { setMetas(next); persist({ metas: next }); showToast("✦ Salvo"); };
  const updateVisao = (next) => { setVisao(next); persist({ visao: next }); showToast("✦ Salvo"); };
  const updateIdeias = (next) => { setIdeias(next); persist({ ideias: next }); showToast("✦ Salvo"); };
  const updateReunioes = (next) => { setReunioes(next); persist({ reunioes: next }); showToast("✦ Salvo"); };
  const updateChecklist = (next) => { setChecklist(next); persist({ checklist: next }); showToast("✦ Salvo"); };
  const updateCal = (next) => { setCal(next); persist({ cal: next }); showToast("✦ Salvo"); };

  const doneCount = checklist.filter(c => c.done).length;
  const progPct = Math.round((doneCount / checklist.length) * 100);

  const diasLancamento = () => {
    if (!visao.lancamentoData) return 0;
    return Math.max(0, Math.ceil((new Date(visao.lancamentoData + "T12:00:00") - new Date()) / 86400000));
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#F7F3EE", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:"#C9A96E", letterSpacing:2 }}>✦ Carregando...</div>
    </div>
  );

  const tabs = [
    { id: "visao", label: "Visão Geral" },
    { id: "calendario", label: "Calendário" },
    { id: "lancamento", label: "Lançamento" },
    { id: "ideias", label: "Banco de Ideias" },
    { id: "reunioes", label: "Reuniões" },
    { id: "metas", label: "Metas" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#F7F3EE", fontFamily:"'DM Sans',sans-serif", color:"#3D2E1E" }}>
      <div id="bih-toast" style={{
        position:"fixed", bottom:24, right:24, zIndex:9999,
        background:"#2A1F14", color:"#E8D5B0", fontSize:13, fontWeight:500,
        padding:"10px 20px", borderRadius:10, letterSpacing:0.5,
        opacity:0, transform:"translateY(8px)", transition:"all .3s ease",
        pointerEvents:"none", boxShadow:"0 4px 20px rgba(0,0,0,0.2)"
      }}>✦ Salvo</div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #EDE6DA; }
        ::-webkit-scrollbar-thumb { background: #C9A96E; border-radius: 3px; }
        input, textarea, select { font-family: 'DM Sans', sans-serif; }
        .check-row:hover { background: #F9F5F0 !important; }
        .tab-btn:hover { color: #6B4F35 !important; }
        .cal-cell:hover { border-color: #C9A96E !important; }
        .btn-gold:hover { background: #6B4F35 !important; color: white !important; }
        .btn-ghost:hover { background: #EDE6DA !important; }
        .idea-card:hover { box-shadow: 0 4px 20px rgba(42,31,20,0.08) !important; transform: translateY(-1px); }
        .meeting-item:hover { border-color: #C9A96E !important; }
        .nav-scroll { overflow-x: auto; scrollbar-width: none; }
        .nav-scroll::-webkit-scrollbar { display: none; }
        .editable-hint { opacity: 0; transition: opacity 0.2s; font-size: 10px; color: #C9A96E; margin-left: 5px; }
        .editable-wrap:hover .editable-hint { opacity: 1; }
        .editable-wrap { cursor: pointer; }
      `}</style>

      {/* HEADER */}
      <div style={{ background:"#2A1F14", padding:"22px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #3D2E1E" }}>
        <div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:"#E8D5B0", letterSpacing:0.5 }}>
            Bih Espindola × Júnior
          </div>
          <div style={{ fontSize:11, color:"#9C8472", letterSpacing:2, textTransform:"uppercase", marginTop:3 }}>
            Hub Estratégico de Conteúdo
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"#9C8472", letterSpacing:1.5, textTransform:"uppercase" }}>Lançamento</div>
            <div style={{ fontSize:14, color:"#E8D5B0", fontWeight:500, marginTop:2 }}>
              {visao.lancamentoData ? new Date(visao.lancamentoData + "T12:00:00").toLocaleDateString("pt-BR", { day:"numeric", month:"short", year:"numeric" }) : "A definir"}
            </div>
          </div>
          <div style={{ background:"#C9A96E", color:"#2A1F14", fontSize:11, fontWeight:600, padding:"7px 16px", borderRadius:20, letterSpacing:1, textTransform:"uppercase" }}>
            ✦ Março 2026
          </div>
        </div>
      </div>

      {/* NAV */}
      <div className="nav-scroll" style={{ background:"#EDE6DA", borderBottom:"1px solid #DDD0C0", display:"flex", padding:"0 40px" }}>
        {tabs.map(t => (
          <button key={t.id} className="tab-btn"
            onClick={() => setTab(t.id)}
            style={{
              padding:"15px 22px", fontSize:13, fontWeight: tab===t.id ? 600 : 400,
              color: tab===t.id ? "#6B4F35" : "#9C8472",
              background:"transparent", border:"none", cursor:"pointer",
              borderBottom: tab===t.id ? "2px solid #C9A96E" : "2px solid transparent",
              whiteSpace:"nowrap", transition:"all .2s", letterSpacing:0.3,
              fontFamily:"'DM Sans',sans-serif",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 40px" }}>
        {tab === "visao" && <Visao visao={visao} updateVisao={updateVisao} checklist={checklist} progPct={progPct} doneCount={doneCount} diasLancamento={diasLancamento()} />}
        {tab === "calendario" && <Calendario cal={cal} updateCal={updateCal} calHover={calHover} setCalHover={setCalHover} />}
        {tab === "lancamento" && <Lancamento checklist={checklist} updateChecklist={updateChecklist} progPct={progPct} doneCount={doneCount} />}
        {tab === "ideias" && <Ideias ideias={ideias} updateIdeias={updateIdeias} />}
        {tab === "reunioes" && <Reunioes reunioes={reunioes} updateReunioes={updateReunioes} />}
        {tab === "metas" && <Metas metas={metas} updateMetas={updateMetas} />}
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function STitle({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:"#2A1F14", whiteSpace:"nowrap", letterSpacing:0.2 }}>{children}</span>
      <div style={{ flex:1, height:1, background:"#E8D5B0" }} />
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background:"white", borderRadius:16, padding:26, border:"1px solid #E8DDD0", boxShadow:"0 2px 12px rgba(42,31,20,0.04)", ...style }}>
      {children}
    </div>
  );
}

function InlineEdit({ value, onChange, style={}, multiline=false, placeholder="Clique para editar" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef();

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  const commit = () => { setEditing(false); if (draft !== value) onChange(draft); };

  if (!editing) {
    return (
      <span className="editable-wrap" style={{ display:"inline-flex", alignItems:"center" }} onClick={() => setEditing(true)}>
        <span style={style}>{value || <span style={{ color:"#C9A96E", fontStyle:"italic", fontSize:12 }}>{placeholder}</span>}</span>
        <span className="editable-hint">✎</span>
      </span>
    );
  }

  const inputStyle = {
    background:"rgba(201,169,110,0.08)", border:"1px solid #C9A96E", borderRadius:6,
    padding:"3px 8px", outline:"none", ...style
  };

  if (multiline) return (
    <textarea ref={ref} value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      rows={3}
      style={{ ...inputStyle, resize:"vertical", width:"100%", display:"block", fontFamily:"'DM Sans',sans-serif" }} />
  );

  return (
    <input ref={ref} value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if(e.key==="Enter") commit(); if(e.key==="Escape"){ setEditing(false); setDraft(value); } }}
      style={{ ...inputStyle, fontFamily:"'DM Sans',sans-serif", display:"inline-block" }} />
  );
}

// ─── VISÃO GERAL ─────────────────────────────────────────────────────────────
function Visao({ visao, updateVisao, checklist, progPct, doneCount, diasLancamento }) {
  const upd = (key, val) => updateVisao({ ...visao, [key]: val });
  const updSemana = (i, key, val) => {
    const next = visao.semanas.map((s, idx) => idx===i ? { ...s, [key]: val } : s);
    updateVisao({ ...visao, semanas: next });
  };

  const canais = [
    { emoji:"📸", nome:"Instagram", papel:"Autoridade + Antecipação", cadencia:"1 post/dia · Stories diários · Reels 3–4x/sem" },
    { emoji:"🎵", nome:"TikTok", papel:"Alcance novo · Topo frio", cadencia:"3–4x/sem · Reaproveitamento do IG" },
    { emoji:"🎙️", nome:"Podcast", papel:"Nutrição + CTA direto", cadencia:"1 ep/sem · host-read ad no meio" },
    { emoji:"💬", nome:"WhatsApp", papel:"Hábito diário + Funil APP", cadencia:"1 áudio/dia · 1 menção APP/sem" },
  ];

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:20, marginBottom:28 }}>
        <Card>
          <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:6, fontWeight:600 }}>Foco do mês</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:"#2A1F14", marginBottom:10 }}>
            <InlineEdit value={visao.focoTitulo} onChange={v => upd("focoTitulo", v)} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:"#2A1F14" }} placeholder="Título do foco" />
          </div>
          <div style={{ fontSize:13, color:"#9C8472", lineHeight:1.7, marginBottom:12 }}>
            <InlineEdit value={visao.focoDesc} onChange={v => upd("focoDesc", v)} multiline style={{ fontSize:13, color:"#9C8472", lineHeight:1.7 }} placeholder="Descrição..." />
          </div>
          <div style={{ padding:"10px 14px", background:"#F7F3EE", borderRadius:10, fontSize:12, color:"#6B4F35" }}>
            <strong>Esteira:</strong>{" "}
            <InlineEdit value={visao.focoEsteira} onChange={v => upd("focoEsteira", v)} style={{ fontSize:12, color:"#6B4F35" }} placeholder="Defina a esteira..." />
          </div>
        </Card>

        <Card style={{ textAlign:"center" }}>
          <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10, fontWeight:600 }}>Checklist</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:52, fontWeight:300, color:"#C9A96E", lineHeight:1 }}>{doneCount}</div>
          <div style={{ fontSize:11, color:"#9C8472", marginTop:4, marginBottom:14 }}>de {checklist.length} tarefas</div>
          <div style={{ height:6, background:"#EDE6DA", borderRadius:10, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progPct}%`, background:"linear-gradient(90deg,#C9A96E,#C4887A)", borderRadius:10, transition:"width .6s" }} />
          </div>
          <div style={{ fontSize:11, color:"#C9A96E", marginTop:8, fontWeight:500 }}>{progPct}% concluído</div>
        </Card>

        <Card style={{ textAlign:"center" }}>
          <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10, fontWeight:600 }}>Dias até o lançamento</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:52, fontWeight:300, color:"#C4887A", lineHeight:1 }}>{diasLancamento}</div>
          <div style={{ marginTop:10, display:"flex", justifyContent:"center" }}>
            <input type="date" value={visao.lancamentoData || ""}
              onChange={e => upd("lancamentoData", e.target.value)}
              style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:8, padding:"5px 10px", fontSize:11, color:"#6B4F35", outline:"none", fontFamily:"'DM Sans',sans-serif", cursor:"pointer" }} />
          </div>
          <div style={{ marginTop:10, fontSize:12, color:"#C9A96E", fontWeight:500 }}>
            <InlineEdit value={visao.lancamentoLote} onChange={v => upd("lancamentoLote", v)} style={{ fontSize:12, color:"#C9A96E", fontWeight:500 }} placeholder="Ex: Lote 0 · R$ 997" />
          </div>
        </Card>
      </div>

      <STitle>Semanas do Mês</STitle>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
        {visao.semanas.map((s, i) => (
          <Card key={i}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:s.cor, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:600, flexShrink:0 }}>{s.num}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.2, marginBottom:6, fontWeight:600 }}>
                  <InlineEdit value={s.datas} onChange={v => updSemana(i,"datas",v)} style={{ fontSize:10, color:"#9C8472", letterSpacing:1.2 }} placeholder="Datas" />
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700, color:"#2A1F14", marginBottom:8 }}>
                  <InlineEdit value={s.titulo} onChange={v => updSemana(i,"titulo",v)} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700, color:"#2A1F14" }} placeholder="Título da semana" />
                </div>
                <div style={{ fontSize:12.5, color:"#9C8472", lineHeight:1.6 }}>
                  <InlineEdit value={s.desc} onChange={v => updSemana(i,"desc",v)} multiline style={{ fontSize:12.5, color:"#9C8472", lineHeight:1.6 }} placeholder="Descrição..." />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <STitle>Distribuição por Canal</STitle>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {canais.map(c => (
          <Card key={c.nome} style={{ padding:18 }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{c.emoji}</div>
            <div style={{ fontWeight:600, fontSize:14, color:"#2A1F14", marginBottom:4 }}>{c.nome}</div>
            <div style={{ fontSize:11, color:"#C9A96E", fontStyle:"italic", marginBottom:8 }}>{c.papel}</div>
            <div style={{ fontSize:11, color:"#9C8472", lineHeight:1.6 }}>{c.cadencia}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── CALENDÁRIO COM DRAG & DROP ───────────────────────────────────────────────
function Calendario({ cal, updateCal, calHover, setCalHover }) {
  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const semLabels = ["Pré-início", "Sem 1 · Autoridade", "Sem 2 · Prova Social", "Sem 3 · Antecipação", "✦ Lançamento"];
  const [dragPill, setDragPill] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [editCell, setEditCell] = useState(null);
  const [editTema, setEditTema] = useState("");
  const [addPillCell, setAddPillCell] = useState(null);

  const handleDragStart = (wi, ci, pillIdx, pill) => setDragPill({ fromWi:wi, fromCi:ci, pillIdx, pill });

  const handleDrop = (toWi, toCi) => {
    if (!dragPill) return;
    if (dragPill.fromWi===toWi && dragPill.fromCi===toCi) { setDragPill(null); setDragOver(null); return; }
    const next = cal.map(week => week.map(cell => ({ ...cell, pills: cell.pills ? [...cell.pills] : undefined })));
    const src = next[dragPill.fromWi][dragPill.fromCi];
    if (src.pills) {
      src.pills = src.pills.filter((_, i) => i !== dragPill.pillIdx);
      if (src.pills.length === 0) src.pills = undefined;
    }
    const dst = next[toWi][toCi];
    if (!dst.pills) dst.pills = [];
    dst.pills = [...dst.pills, dragPill.pill];
    updateCal(next);
    setDragPill(null); setDragOver(null);
  };

  const removePill = (wi, ci, pillIdx) => {
    const next = cal.map(w => w.map(c => ({ ...c, pills: c.pills ? [...c.pills] : undefined })));
    next[wi][ci].pills = next[wi][ci].pills.filter((_, i) => i !== pillIdx);
    if (next[wi][ci].pills.length === 0) next[wi][ci].pills = undefined;
    updateCal(next);
  };

  const addPill = (wi, ci, label) => {
    const next = cal.map(w => w.map(c => ({ ...c, pills: c.pills ? [...c.pills] : undefined })));
    if (!next[wi][ci].pills) next[wi][ci].pills = [];
    next[wi][ci].pills.push({ l: label, c: PILL_KEY[label] || "reels" });
    updateCal(next); setAddPillCell(null);
  };

  const saveTema = (wi, ci) => {
    const next = cal.map(w => w.map(c => ({ ...c })));
    next[wi][ci].tema = editTema;
    updateCal(next); setEditCell(null);
  };

  return (
    <div>
      <STitle>Calendário Editorial — Março 2026</STitle>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
        {[["Reels","reels"],["Carrossel","car"],["Stories","st"],["Podcast","pod"],["✦ Lançamento","launch"]].map(([l,c]) => (
          <span key={c} style={{ fontSize:10, padding:"4px 10px", borderRadius:20, fontWeight:500, background:PILL_STYLES[c]?.bg || "#EDE8FF", color:PILL_STYLES[c]?.color || "#6B5BB5" }}>{l}</span>
        ))}
      </div>
      <p style={{ fontSize:11, color:"#9C8472", marginBottom:20, fontStyle:"italic" }}>✦ Arraste os conteúdos entre datas · ＋ para adicionar · Clique no tema para editar</p>

      <div style={{ display:"grid", gridTemplateColumns:"80px repeat(7,1fr)", gap:6, marginBottom:6 }}>
        <div />
        {dias.map(d => <div key={d} style={{ textAlign:"center", fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, padding:"6px 0", fontWeight:600 }}>{d}</div>)}
      </div>

      {cal.map((week, wi) => (
        <div key={wi} style={{ display:"grid", gridTemplateColumns:"80px repeat(7,1fr)", gap:6, marginBottom:6, alignItems:"start" }}>
          <div style={{ fontSize:10, color:"#9C8472", padding:"10px 6px 0", lineHeight:1.4, letterSpacing:0.5, fontWeight:500 }}>{semLabels[wi]}</div>
          {week.map((cell, ci) => {
            if (!cell.d) return <div key={ci} />;
            const isLaunch = cell.launch;
            const isHover = calHover === `${wi}-${ci}`;
            const isDragOver = dragOver === `${wi}-${ci}`;
            const isEditingTema = editCell?.wi===wi && editCell?.ci===ci;
            const isAddingPill = addPillCell?.wi===wi && addPillCell?.ci===ci;

            return (
              <div key={ci} className="cal-cell"
                onMouseEnter={() => setCalHover(`${wi}-${ci}`)}
                onMouseLeave={() => setCalHover(null)}
                onDragOver={e => { e.preventDefault(); setDragOver(`${wi}-${ci}`); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(wi, ci)}
                style={{
                  background: isLaunch ? "linear-gradient(135deg,#FFF5E6,#FFE8CC)" : "white",
                  border: isDragOver ? "2px dashed #C9A96E" : isLaunch ? "1px solid #C9A96E" : cell.pills ? "1px solid #DDD0C0" : "1px dashed #E8DDD0",
                  borderRadius:10, padding:"8px 8px 10px", minHeight:80,
                  transition:"all .15s", position:"relative",
                  boxShadow: isHover ? "0 4px 16px rgba(201,169,110,0.15)" : "none",
                }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ fontSize:11, color:"#9C8472", fontWeight:500 }}>{cell.d}</div>
                  {isHover && (
                    <button onClick={() => setAddPillCell({ wi, ci })}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"#C9A96E", fontSize:14, lineHeight:1, padding:0 }}>＋</button>
                  )}
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                  {cell.pills?.map((p, pi) => (
                    <div key={pi} draggable onDragStart={() => handleDragStart(wi, ci, pi, p)}
                      style={{ display:"flex", alignItems:"center", gap:3, cursor:"grab" }}>
                      <span style={{ fontSize:9, padding:"2px 7px", borderRadius:20, fontWeight:600, flex:1, background:PILL_STYLES[p.c]?.bg, color:PILL_STYLES[p.c]?.color, userSelect:"none" }}>{p.l}</span>
                      {isHover && (
                        <button onClick={() => removePill(wi, ci, pi)}
                          style={{ background:"none", border:"none", cursor:"pointer", color:"#DDD0C0", fontSize:11, padding:0, lineHeight:1 }}
                          onMouseEnter={e => e.target.style.color="#C4887A"}
                          onMouseLeave={e => e.target.style.color="#DDD0C0"}>×</button>
                      )}
                    </div>
                  ))}
                  {isLaunch && <span style={{ fontSize:9, padding:"2px 7px", borderRadius:20, fontWeight:600, display:"inline-block", background:"linear-gradient(135deg,#FFE8CC,#FFD4A0)", color:"#8B5E00" }}>✦ Launch</span>}
                </div>

                {/* Popup add pill */}
                {isAddingPill && (
                  <div style={{ position:"absolute", top:"100%", left:0, zIndex:30, background:"white", border:"1px solid #E8DDD0", borderRadius:10, padding:8, boxShadow:"0 4px 20px rgba(0,0,0,0.12)", minWidth:130 }}>
                    {PILL_OPTIONS.map(opt => (
                      <div key={opt} onClick={() => addPill(wi, ci, opt)}
                        style={{ fontSize:11, padding:"5px 10px", cursor:"pointer", borderRadius:6, color:"#3D2E1E" }}
                        onMouseEnter={e => e.currentTarget.style.background="#F7F3EE"}
                        onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                        {opt}
                      </div>
                    ))}
                    <div onClick={() => setAddPillCell(null)}
                      style={{ fontSize:10, padding:"5px 10px", cursor:"pointer", borderRadius:6, color:"#9C8472", borderTop:"1px solid #F0E8DC", marginTop:4 }}>
                      Cancelar
                    </div>
                  </div>
                )}

                {/* Tooltip / editar tema */}
                {isHover && cell.tema && !isEditingTema && !isAddingPill && (
                  <div onClick={() => { setEditCell({ wi, ci }); setEditTema(cell.tema); }}
                    style={{ position:"absolute", bottom:"calc(100% + 6px)", left:0, zIndex:10, background:"#2A1F14", color:"white", fontSize:11, padding:"8px 12px", borderRadius:8, lineHeight:1.5, width:190, boxShadow:"0 4px 16px rgba(0,0,0,0.2)", cursor:"pointer" }}>
                    {cell.tema}
                    <div style={{ fontSize:9, color:"#C9A96E", marginTop:4 }}>✎ clique para editar</div>
                    <div style={{ position:"absolute", top:"100%", left:16, width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:"5px solid #2A1F14" }} />
                  </div>
                )}

                {isEditingTema && (
                  <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:0, zIndex:20, background:"white", border:"1px solid #C9A96E", borderRadius:10, padding:10, width:210, boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>
                    <textarea value={editTema} onChange={e => setEditTema(e.target.value)} rows={3}
                      style={{ width:"100%", border:"1px solid #DDD0C0", borderRadius:6, padding:"6px 8px", fontSize:11, outline:"none", resize:"none", fontFamily:"'DM Sans',sans-serif" }} />
                    <div style={{ display:"flex", gap:6, marginTop:6 }}>
                      <button onClick={() => saveTema(wi, ci)} className="btn-gold"
                        style={{ flex:1, background:"#C9A96E", color:"#2A1F14", border:"none", borderRadius:6, padding:"5px", fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>Salvar</button>
                      <button onClick={() => setEditCell(null)}
                        style={{ flex:1, background:"#EDE6DA", color:"#6B4F35", border:"none", borderRadius:6, padding:"5px", fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── LANÇAMENTO ──────────────────────────────────────────────────────────────
function Lancamento({ checklist, updateChecklist, progPct, doneCount }) {
  const lotes = [
    { nome:"Lote 0", preco:"R$ 997", quando:"Lista VIP · Pré-abertura", desc:"Exclusivo para quem entrar na lista antes da abertura.", cor:"#6B5BB5" },
    { nome:"Lote 1", preco:"R$ 1.297", quando:"Abertura geral", desc:"Abertura oficial para toda a audiência.", cor:"#C4887A" },
    { nome:"Valor fixo", preco:"R$ 1.497", quando:"A partir de Abril", desc:"Preço permanente após o lançamento.", cor:"#2A1F14" },
  ];
  const toggle = (id) => updateChecklist(checklist.map(c => c.id === id ? {...c, done:!c.done} : c));
  return (
    <div>
      <STitle>Comunidade de Manifestação MANI</STitle>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
        {lotes.map(l => (
          <Card key={l.nome} style={{ borderTop:`3px solid ${l.cor}`, textAlign:"center" }}>
            <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8, fontWeight:600 }}>{l.quando}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:"#2A1F14", marginBottom:4 }}>{l.nome}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, color:l.cor, fontWeight:300, marginBottom:10 }}>{l.preco}</div>
            <p style={{ fontSize:12, color:"#9C8472", lineHeight:1.5 }}>{l.desc}</p>
          </Card>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }}>
        <Card>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:"#2A1F14" }}>Checklist do Lançamento</div>
            <div style={{ fontSize:12, color:"#C9A96E", fontWeight:600 }}>{doneCount}/{checklist.length} concluídos</div>
          </div>
          <div style={{ height:4, background:"#EDE6DA", borderRadius:10, marginBottom:20, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progPct}%`, background:"linear-gradient(90deg,#C9A96E,#C4887A)", borderRadius:10, transition:"width .5s" }} />
          </div>
          {checklist.map(item => (
            <div key={item.id} className="check-row"
              onClick={() => toggle(item.id)}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 8px", borderBottom:"1px solid #F0E8DC", cursor:"pointer", borderRadius:8, transition:"background .15s" }}>
              <div style={{ width:20, height:20, borderRadius:5, border: item.done ? "none" : "1.5px solid #DDD0C0", background: item.done ? "#C9A96E" : "white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .2s" }}>
                {item.done && <span style={{ color:"white", fontSize:11 }}>✓</span>}
              </div>
              <span style={{ fontSize:13, color: item.done ? "#9C8472" : "#3D2E1E", textDecoration: item.done ? "line-through" : "none", transition:"all .2s" }}>{item.texto}</span>
            </div>
          ))}
        </Card>
        <div>
          <Card style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8, fontWeight:600 }}>Papel de cada canal</div>
            {[["📸","Instagram","Desejo + CTA diário nos Stories"],["🎵","TikTok","Alcance frio → IG"],["🎙️","Podcast","Host-read ad no meio do ep."],["💬","WhatsApp","Link VIP para o grupo"]].map(([e,n,p]) => (
              <div key={n} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ fontSize:18, lineHeight:1 }}>{e}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"#2A1F14" }}>{n}</div>
                  <div style={{ fontSize:11, color:"#9C8472", lineHeight:1.4 }}>{p}</div>
                </div>
              </div>
            ))}
          </Card>
          <Card style={{ background:"linear-gradient(135deg,#FFF9F0,#FFF3E0)", border:"1px solid #E8D5B0" }}>
            <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8, fontWeight:600 }}>Meta realista</div>
            <p style={{ fontSize:12.5, color:"#6B4F35", lineHeight:1.7 }}>Com 293K seguidores e +1K no grupo, converter <strong>50–100 membras</strong> no Lote 0 representa entre <strong>R$49.850 e R$99.700</strong> só neste lançamento.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── IDEIAS — KANBAN ──────────────────────────────────────────────────────────
const KANBAN_COLUNAS = [
  { id:"ideias",   label:"💡 Ideias",       cor:"#6B5BB5", bg:"#F3F0FF" },
  { id:"producao", label:"🎬 Em Produção",  cor:"#C4703B", bg:"#FFF4EE" },
  { id:"gravado",  label:"🎥 Gravado",      cor:"#2563AB", bg:"#EEF4FF" },
  { id:"editando", label:"✂️ Editando",     cor:"#8B5E00", bg:"#FFFBEE" },
  { id:"postado",  label:"✅ Postado",      cor:"#166534", bg:"#EEFFF4" },
];

function IdeiaCard({ ideia, ideias, updateIdeias, onDragStart }) {
  const [expanded, setExpanded] = useState(false);
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState({ titulo: ideia.titulo, obs: ideia.obs||"", comentario: ideia.comentario||"" });
  const [confirmDel, setConfirmDel] = useState(false);

  const salvar = () => {
    updateIdeias(ideias.map(i => i.id===ideia.id ? { ...i, ...draft } : i));
    setEditando(false);
  };

  const moverPara = (colId) => {
    updateIdeias(ideias.map(i => i.id===ideia.id ? { ...i, coluna: colId } : i));
  };

  const remover = () => updateIdeias(ideias.filter(i => i.id !== ideia.id));

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        background:"white", borderRadius:12, border:"1px solid #E8DDD0",
        marginBottom:8, cursor:"grab", boxShadow:"0 1px 6px rgba(42,31,20,0.05)",
        transition:"box-shadow .2s",
      }}>

      {/* Topo do card */}
      <div style={{ padding:"12px 14px 10px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
          {editando ? (
            <input value={draft.titulo} onChange={e => setDraft({...draft, titulo:e.target.value})}
              style={{ flex:1, background:"#F7F3EE", border:"1px solid #C9A96E", borderRadius:8, padding:"5px 10px", fontSize:13, fontWeight:600, outline:"none", fontFamily:"'DM Sans',sans-serif" }} />
          ) : (
            <div onClick={() => setExpanded(!expanded)}
              style={{ flex:1, fontSize:13, fontWeight:600, color:"#2A1F14", lineHeight:1.5, cursor:"pointer" }}>
              {ideia.titulo}
            </div>
          )}
          <div style={{ display:"flex", gap:2, flexShrink:0 }}>
            <button onClick={() => { setEditando(!editando); setExpanded(true); setDraft({ titulo:ideia.titulo, obs:ideia.obs||"", comentario:ideia.comentario||"" }); }}
              style={{ background:"none", border:"none", cursor:"pointer", color:"#C9A96E", fontSize:13, padding:"2px 4px", lineHeight:1 }}>✎</button>
            <button onClick={() => setConfirmDel(true)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"#DDD0C0", fontSize:16, padding:"2px 4px", lineHeight:1 }}
              onMouseEnter={e => e.target.style.color="#C4887A"}
              onMouseLeave={e => e.target.style.color="#DDD0C0"}>×</button>
          </div>
        </div>
      </div>

      {/* Corpo expandido */}
      {(expanded || editando) && (
        <div style={{ padding:"0 14px 12px", borderTop:"1px solid #F7F3EE" }}>
          <div style={{ paddingTop:10 }}>
            {editando ? (
              <>
                <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:4, fontWeight:600 }}>Conteúdo / Roteiro</div>
                <textarea value={draft.obs} onChange={e => setDraft({...draft, obs:e.target.value})}
                  rows={6} placeholder="Cole o roteiro, ideia, hook..."
                  style={{ width:"100%", background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:8, padding:"8px 12px", fontSize:12.5, outline:"none", resize:"vertical", fontFamily:"'DM Sans',sans-serif", lineHeight:1.9 }} />
                <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:4, marginTop:10, fontWeight:600 }}>Comentário / Feedback</div>
                <textarea value={draft.comentario} onChange={e => setDraft({...draft, comentario:e.target.value})}
                  rows={3} placeholder="Observações, revisões..."
                  style={{ width:"100%", background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:8, padding:"8px 12px", fontSize:12.5, outline:"none", resize:"vertical", fontFamily:"'DM Sans',sans-serif", lineHeight:1.9 }} />
                <div style={{ display:"flex", gap:6, marginTop:10 }}>
                  <button onClick={salvar} style={{ flex:1, background:"#C9A96E", color:"#2A1F14", border:"none", borderRadius:8, padding:"7px", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>Salvar</button>
                  <button onClick={() => setEditando(false)} style={{ flex:1, background:"#EDE6DA", color:"#6B4F35", border:"none", borderRadius:8, padding:"7px", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancelar</button>
                </div>
              </>
            ) : (
              <>
                {ideia.obs && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5, fontWeight:600 }}>Conteúdo</div>
                    <div style={{ fontSize:12.5, color:"#3D2E1E", lineHeight:1.9, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{ideia.obs}</div>
                  </div>
                )}
                {ideia.comentario && (
                  <div style={{ background:"#F7F3EE", borderRadius:8, padding:"8px 12px", marginBottom:10, borderLeft:"3px solid #C9A96E" }}>
                    <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:4, fontWeight:600 }}>Comentário</div>
                    <div style={{ fontSize:12.5, color:"#6B4F35", lineHeight:1.9, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{ideia.comentario}</div>
                  </div>
                )}
                <div style={{ marginTop:6 }}>
                  <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5, fontWeight:600 }}>Mover para</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {KANBAN_COLUNAS.filter(c => c.id !== (ideia.coluna||"ideias")).map(c => (
                      <button key={c.id} onClick={() => moverPara(c.id)}
                        style={{ fontSize:10, padding:"3px 10px", borderRadius:20, border:`1px solid ${c.cor}44`, background:c.bg, color:c.cor, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {confirmDel && (
        <div style={{ padding:"8px 14px 12px", display:"flex", gap:8, alignItems:"center", borderTop:"1px solid #F7F3EE" }}>
          <span style={{ fontSize:12, color:"#9C8472", flex:1 }}>Remover este card?</span>
          <button onClick={remover} style={{ fontSize:11, padding:"4px 12px", borderRadius:8, background:"#C4887A", color:"white", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Sim</button>
          <button onClick={() => setConfirmDel(false)} style={{ fontSize:11, padding:"4px 12px", borderRadius:8, background:"#EDE6DA", color:"#6B4F35", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Não</button>
        </div>
      )}
    </div>
  );
}

function Ideias({ ideias, updateIdeias }) {
  const [form, setForm] = useState({ titulo:"", obs:"" });
  const [showForm, setShowForm] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const ideiasComColuna = ideias.map(i => i.coluna ? i : { ...i, coluna:"ideias" });

  const addIdeia = () => {
    if (!form.titulo.trim()) return;
    updateIdeias([...ideiasComColuna, { id:Date.now(), ...form, coluna:"ideias", comentario:"", aprovado:false, formato:"Reels", tag:"Autoridade" }]);
    setForm({ titulo:"", obs:"" });
    setShowForm(false);
  };

  const handleDrop = (colId) => {
    if (!dragging) return;
    updateIdeias(ideiasComColuna.map(i => i.id===dragging ? { ...i, coluna:colId } : i));
    setDragging(null); setDragOver(null);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <STitle>Banco de Ideias</STitle>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background:"#C9A96E", color:"#2A1F14", border:"none", borderRadius:10, padding:"8px 18px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
          + Nova ideia
        </button>
      </div>

      {showForm && (
        <Card style={{ marginBottom:20, background:"#FFFDF9", border:"1px solid #E8D5B0" }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:"#2A1F14", marginBottom:14 }}>Nova ideia</div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5, fontWeight:600 }}>Título</div>
            <input value={form.titulo} onChange={e => setForm({...form, titulo:e.target.value})}
              placeholder="Ex: Como usar a lua nova para manifestar..."
              style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none", fontFamily:"'DM Sans',sans-serif" }} />
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5, fontWeight:600 }}>Conteúdo / Roteiro</div>
            <textarea value={form.obs} onChange={e => setForm({...form, obs:e.target.value})}
              rows={5} placeholder="Hook, roteiro, referências, intenção..."
              style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none", resize:"vertical", fontFamily:"'DM Sans',sans-serif", lineHeight:1.9, fontSize:13 }} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={addIdeia}
              style={{ background:"#C9A96E", color:"#2A1F14", border:"none", borderRadius:10, padding:"10px 22px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              + Adicionar
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ background:"#EDE6DA", color:"#6B4F35", border:"none", borderRadius:10, padding:"10px 18px", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Cancelar
            </button>
          </div>
        </Card>
      )}

      {/* KANBAN */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
        {KANBAN_COLUNAS.map(col => {
          const cards = ideiasComColuna.filter(i => (i.coluna||"ideias") === col.id);
          const isOver = dragOver === col.id;
          return (
            <div key={col.id}
              onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col.id)}
              style={{
                background: isOver ? col.bg : "#F7F3EE",
                borderRadius:14, padding:"10px 8px", minHeight:420,
                border: isOver ? `2px dashed ${col.cor}` : "2px solid transparent",
                transition:"all .15s",
              }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:11, fontWeight:700, color:col.cor }}>{col.label}</div>
                <div style={{ background:col.bg, color:col.cor, border:`1px solid ${col.cor}44`, borderRadius:20, fontSize:10, fontWeight:700, padding:"1px 7px" }}>{cards.length}</div>
              </div>
              {cards.map(ideia => (
                <IdeiaCard key={ideia.id} ideia={ideia} ideias={ideiasComColuna} updateIdeias={updateIdeias}
                  onDragStart={() => setDragging(ideia.id)} />
              ))}
              {cards.length === 0 && (
                <div style={{ textAlign:"center", padding:"30px 8px", color:"#C9A96E", fontSize:11, fontStyle:"italic", opacity:0.5 }}>
                  Arraste cards aqui
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── REUNIÕES ────────────────────────────────────────────────────────────────
function Reunioes({ reunioes, updateReunioes }) {
  const [form, setForm] = useState({ data:"", titulo:"", notas:"" });
  const [expandida, setExpandida] = useState(1);

  const addReuniao = () => {
    if (!form.titulo.trim()) return;
    updateReunioes([{ id:Date.now(), ...form }, ...reunioes]);
    setForm({ data:"", titulo:"", notas:"" });
  };

  const fmtDate = (d) => {
    if (!d) return "";
    const [y,m,day] = d.split("-");
    const meses = ["","jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    return `${day} ${meses[parseInt(m)]} ${y}`;
  };

  return (
    <div>
      <STitle>Registro de Reuniões</STitle>
      {reunioes.map(r => (
        <div key={r.id} className="meeting-item"
          style={{ background:"white", border:"1px solid #E8DDD0", borderRadius:14, marginBottom:12, overflow:"hidden", transition:"border .2s" }}>
          <div onClick={() => setExpandida(expandida===r.id ? null : r.id)}
            style={{ padding:"18px 20px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:1.5, color:"#C9A96E", fontWeight:600, marginBottom:4 }}>{fmtDate(r.data)}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:"#2A1F14" }}>{r.titulo}</div>
            </div>
            <div style={{ color:"#DDD0C0", fontSize:18, transition:"transform .2s", transform: expandida===r.id?"rotate(180deg)":"none" }}>▾</div>
          </div>
          {expandida===r.id && (
            <div style={{ padding:"0 20px 18px", borderTop:"1px solid #F0E8DC" }}>
              <div style={{ paddingTop:14, fontSize:13, color:"#3D2E1E", lineHeight:2, whiteSpace:"pre-line" }}>{r.notas}</div>
            </div>
          )}
        </div>
      ))}
      <Card style={{ marginTop:24 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:"#2A1F14", marginBottom:16 }}>Registrar nova reunião</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5, fontWeight:600 }}>Data</div>
            <input type="date" value={form.data} onChange={e => setForm({...form, data:e.target.value})}
              style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none" }} />
          </div>
          <div>
            <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5, fontWeight:600 }}>Título</div>
            <input value={form.titulo} onChange={e => setForm({...form, titulo:e.target.value})} placeholder="Ex: Reunião mensal de abril"
              style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none" }} />
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5, fontWeight:600 }}>Decisões e próximos passos</div>
          <textarea value={form.notas} onChange={e => setForm({...form, notas:e.target.value})} rows={4} placeholder="Liste as decisões tomadas e próximas ações..."
            style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none", resize:"none" }} />
        </div>
        <button className="btn-gold" onClick={addReuniao}
          style={{ background:"#C9A96E", color:"#2A1F14", border:"none", borderRadius:10, padding:"10px 22px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
          + Salvar reunião
        </button>
      </Card>
    </div>
  );
}

// ─── METAS ────────────────────────────────────────────────────────────────────
function Metas({ metas, updateMetas }) {
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState({ ...metas });

  const salvar = () => { updateMetas(draft); setEditando(false); };
  const pct = (real, meta) => (!meta || isNaN(meta) || Number(meta)===0) ? 0 : Math.min(100, Math.round((Number(real)/Number(meta))*100));

  const metaCards = [
    { valKey:"meta1Val", realKey:"meta1Real", labelKey:"meta1Label", subKey:"meta1Sub", cor:"#6B5BB5" },
    { valKey:"meta2Val", realKey:"meta2Real", labelKey:"meta2Label", subKey:"meta2Sub", cor:"#C9A96E" },
    { valKey:"meta3Val", realKey:"meta3Real", labelKey:"meta3Label", subKey:"meta3Sub", cor:"#C4887A" },
  ];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <STitle>Metas & Acompanhamento</STitle>
        <button className="btn-gold" onClick={() => { setDraft({...metas}); setEditando(!editando); }}
          style={{ background: editando?"#EDE6DA":"#C9A96E", color: editando?"#6B4F35":"#2A1F14", border:"none", borderRadius:10, padding:"8px 18px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
          {editando ? "Cancelar" : "✎ Editar metas"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {metaCards.map((mc, i) => {
          const metaVal = metas[mc.valKey];
          const realVal = metas[mc.realKey] || 0;
          const p = pct(realVal, metaVal);
          const isReceita = mc.labelKey==="meta3Label";
          return (
            <Card key={i} style={{ textAlign:"center", borderTop:`3px solid ${mc.cor}` }}>
              {editando ? (
                <input value={draft[mc.labelKey]} onChange={e => setDraft({...draft, [mc.labelKey]:e.target.value})}
                  style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:8, padding:"4px 10px", width:"100%", outline:"none", fontSize:11, textAlign:"center", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }} />
              ) : (
                <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10, fontWeight:600 }}>{metas[mc.labelKey]}</div>
              )}
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:46, fontWeight:300, color:mc.cor, lineHeight:1 }}>
                {metaVal ? (isReceita ? "R$"+Number(metaVal).toLocaleString("pt-BR") : Number(metaVal).toLocaleString("pt-BR")) : "—"}
              </div>
              {editando ? (
                <input value={draft[mc.subKey]} onChange={e => setDraft({...draft, [mc.subKey]:e.target.value})}
                  style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:8, padding:"4px 10px", width:"100%", outline:"none", fontSize:11, textAlign:"center", marginBottom:8, marginTop:6 }} />
              ) : (
                <div style={{ fontSize:11, color:"#9C8472", marginTop:6, marginBottom:14 }}>{metas[mc.subKey]}</div>
              )}
              <div style={{ height:5, background:"#EDE6DA", borderRadius:10, overflow:"hidden", marginBottom:6 }}>
                <div style={{ height:"100%", width:`${p}%`, background:mc.cor, borderRadius:10, transition:"width .6s" }} />
              </div>
              <div style={{ fontSize:11, color:mc.cor, fontWeight:600 }}>{p}% atingido</div>
              {editando && (
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:10, color:"#9C8472", marginBottom:4, textAlign:"left", fontWeight:600 }}>Meta</div>
                  <input type="number" value={draft[mc.valKey]||""} onChange={e => setDraft({...draft,[mc.valKey]:e.target.value})}
                    placeholder={isReceita?"Ex: 50000":"Ex: 50"}
                    style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:8, padding:"7px 12px", width:"100%", outline:"none", fontSize:12, marginBottom:8 }} />
                  <div style={{ fontSize:10, color:"#9C8472", marginBottom:4, textAlign:"left", fontWeight:600 }}>Realizado atual</div>
                  <input type="number" value={draft[mc.realKey]||""} onChange={e => setDraft({...draft,[mc.realKey]:e.target.value})}
                    placeholder="Realizado atual..."
                    style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:8, padding:"7px 12px", width:"100%", outline:"none", fontSize:12 }} />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {editando && (
        <div style={{ textAlign:"right", marginBottom:24 }}>
          <button className="btn-gold" onClick={salvar}
            style={{ background:"#C9A96E", color:"#2A1F14", border:"none", borderRadius:10, padding:"10px 28px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
            Salvar metas
          </button>
        </div>
      )}

      <Card>
        <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10, fontWeight:600 }}>Projeção de faturamento</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:"#2A1F14", marginBottom:10 }}>Potencial do lançamento</div>
        <p style={{ fontSize:13.5, color:"#3D2E1E", lineHeight:1.8 }}>
          Com base na estrutura de lotes e no preço definido, o potencial de faturamento no primeiro lançamento é expressivo. Use as metas acima para acompanhar o progresso em tempo real.
        </p>
        <div style={{ marginTop:16, padding:"12px 16px", background:"#F7F3EE", borderRadius:10, fontSize:12.5, color:"#6B4F35", lineHeight:1.7, borderLeft:"3px solid #C9A96E" }}>
          <strong>Referência:</strong> 50–100 membras no Lote 0 = <strong>R$49.850 a R$99.700</strong> de faturamento só no primeiro lançamento.
        </div>
      </Card>
    </div>
  );
}

