import { useState, useEffect } from "react";
import { loadAll, saveAll } from "./storage";

// ─── STORAGE HELPERS ───────────────────────────────────────────────────────
const INITIAL_DATA = {
  metas: null,
  ideias: null,
  reunioes: null,
  checklist: null,
};

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
  membrosLote0: "", membrosTotal: "", receita: "",
  membrosLote0Real: 0, membrosTotalReal: 0, receitaReal: 0,
};

const INITIAL_IDEIAS = [
  { id: 1, titulo: "3 sinais de que você já está manifestando (mas não percebe)", formato: "Reels", tag: "Autoridade", obs: "Alto potencial de engajamento — ressoa com quem duvida do processo" },
  { id: 2, titulo: "O erro que impede sua manifestação de acontecer", formato: "Reels", tag: "Educativo", obs: "Problema + solução. Alto potencial de salvamento." },
  { id: 3, titulo: "Guia: como criar seu ritual de manifestação em 5 passos", formato: "Carrossel", tag: "Viral", obs: "Conteúdo salvo e compartilhado. Fundo de funil leve." },
  { id: 4, titulo: "Por que a maioria das pessoas desiste antes de manifestar", formato: "Carrossel", tag: "Objeção", obs: "Quebra de objeção. Prepara o terreno pro lançamento." },
  { id: 5, titulo: "Resultados de alunas: o que mudou depois de 30 dias", formato: "Carrossel", tag: "Prova Social", obs: "Fundamental antes do lançamento da Comunidade." },
  { id: 6, titulo: "Bastidores: como é trabalhar sua espiritualidade no dia a dia", formato: "Stories", tag: "Conexão", obs: "Humanização + conexão com a audiência." },
];

const INITIAL_REUNIOES = [
  {
    id: 1, data: "2026-03-10", titulo: "Alinhamento inicial & estratégia de março",
    notas: "→ Foco do mês: lançamento da comunidade no final de março\n→ Esteira: WhatsApp gratuito → APP → Comunidade MANI → Serviços\n→ Instagram: 80% desejo/autoridade, 20% conversão APP\n→ TikTok reativado com reaproveitamento de conteúdo do IG\n→ Spotify: host-read ad no meio de cada episódio\n→ WhatsApp: áudio diário leve, sem entregar o método\n→ Revisão do investimento vinculada à meta acordada"
  }
];

const INITIAL_CHECKLIST = [
  { id: 1, texto: "Definir nome oficial da Comunidade", done: false },
  { id: 2, texto: "Definir estratégia de antecipação", done: true },
  { id: 3, texto: "Criar página de vendas (Hotmart/Kiwify)", done: false },
  { id: 4, texto: "Definir preço e estrutura dos lotes", done: true },
  { id: 5, texto: "Gravar conteúdos de antecipação (sem. 3)", done: false },
  { id: 6, texto: "Preparar sequência de stories do lançamento", done: false },
  { id: 7, texto: "Configurar plataforma da comunidade", done: false },
  { id: 8, texto: "Abrir lista VIP para lote 0", done: false },
  { id: 9, texto: "Lançamento — abrir inscrições", done: false },
];

// ─── CALENDAR DATA ─────────────────────────────────────────────────────────
const CAL = [
  // Semana 1 (pré)
  [
    { d: null }, { d: null }, { d: null }, { d: null },
    { d: 7 }, { d: 8 }, { d: 9 },
  ],
  // Semana 2
  [
    { d: 10, pills: [{ l: "Reels", c: "reels" }], tema: "Quebra-mito: você não manifesta porque não sustenta" },
    { d: 11 },
    { d: 12, pills: [{ l: "Carrossel", c: "car" }], tema: "Os 3 pilares do M.A.N.I." },
    { d: 13, pills: [{ l: "Stories", c: "st" }], tema: "Bastidores: preparando a comunidade" },
    { d: 14, pills: [{ l: "Reels", c: "reels" }], tema: "Depoimento de aluna do APP" },
    { d: 15, pills: [{ l: "Podcast", c: "pod" }], tema: "Ep. semanal + host-read ad" },
    { d: 16 },
  ],
  // Semana 3
  [
    { d: 17, pills: [{ l: "Carrossel", c: "car" }], tema: "O que muda em 30 dias de prática" },
    { d: 18, pills: [{ l: "Stories", c: "st" }], tema: "Enquete: o que te impede de manifestar?" },
    { d: 19, pills: [{ l: "Reels", c: "reels" }], tema: "Prova social: transformação real" },
    { d: 20, pills: [{ l: "Podcast", c: "pod" }], tema: "Ep. semanal + host-read ad" },
    { d: 21, pills: [{ l: "Reels", c: "reels" }], tema: "Pré-abertura: o que é a Comunidade" },
    { d: 22 },
    { d: 23 },
  ],
  // Semana 4 — antecipação
  [
    { d: 24, pills: [{ l: "Carrossel", c: "car" }], tema: "Revelação: o que você recebe na Comunidade" },
    { d: 25, pills: [{ l: "Stories", c: "st" }], tema: "Benefícios exclusivos dia a dia" },
    { d: 26, pills: [{ l: "Reels", c: "reels" }], tema: "Abre a lista VIP — urgência e pertencimento" },
    { d: 27, pills: [{ l: "Stories", c: "st" }], tema: "CTA: 'comenta COMUNIDADE'" },
    { d: 28, pills: [{ l: "Podcast", c: "pod" }], tema: "Ep. semanal + host-read ad" },
    { d: 29, pills: [{ l: "Reels", c: "reels" }], tema: "Últimas vagas — o que te espera lá dentro" },
    { d: 30 },
  ],
  // Lançamento
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
};

const TAG_COLORS = {
  "Autoridade": "#6B5BB5", "Educativo": "#2563AB", "Viral": "#166534",
  "Objeção": "#C4703B", "Prova Social": "#8B5E00", "Conexão": "#8B3A5A",
};

const FORMATOS = ["Reels", "Carrossel", "Stories", "Live", "TikTok", "Podcast"];
const TAGS = ["Autoridade", "Educativo", "Viral", "Objeção", "Prova Social", "Conexão", "Lançamento"];

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("visao");
  const [metas, setMetas] = useState(INITIAL_METAS);
  const [ideias, setIdeias] = useState(INITIAL_IDEIAS);
  const [reunioes, setReunioes] = useState(INITIAL_REUNIOES);
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [loading, setLoading] = useState(true);
  const [calHover, setCalHover] = useState(null);

  // Load from shared storage
  useEffect(() => {
    (async () => {
      const fallback = {
        metas: INITIAL_METAS,
        ideias: INITIAL_IDEIAS,
        reunioes: INITIAL_REUNIOES,
        checklist: INITIAL_CHECKLIST,
      };
      const data = await loadAll(fallback);
      setMetas(data.metas || INITIAL_METAS);
      setIdeias(data.ideias || INITIAL_IDEIAS);
      setReunioes(data.reunioes || INITIAL_REUNIOES);
      setChecklist(data.checklist || INITIAL_CHECKLIST);
      setLoading(false);
    })();
  }, []);

  const persist = (patch) => {
    saveAll({ metas, ideias, reunioes, checklist, ...patch });
  };

  const updateMetas = (next) => { setMetas(next); persist({ metas: next }); showToast("✦ Salvo"); };
  const updateIdeias = (next) => { setIdeias(next); persist({ ideias: next }); showToast("✦ Salvo"); };
  const updateReunioes = (next) => { setReunioes(next); persist({ reunioes: next }); showToast("✦ Salvo"); };
  const updateChecklist = (next) => { setChecklist(next); persist({ checklist: next }); showToast("✦ Salvo"); };

  // Auto-refresh every 30s to pick up changes from the other person
  useEffect(() => {
    const interval = setInterval(async () => {
      const fallback = { metas: INITIAL_METAS, ideias: INITIAL_IDEIAS, reunioes: INITIAL_REUNIOES, checklist: INITIAL_CHECKLIST };
      const data = await loadAll(fallback);
      setMetas(data.metas || INITIAL_METAS);
      setIdeias(data.ideias || INITIAL_IDEIAS);
      setReunioes(data.reunioes || INITIAL_REUNIOES);
      setChecklist(data.checklist || INITIAL_CHECKLIST);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const doneCount = checklist.filter(c => c.done).length;
  const progPct = Math.round((doneCount / checklist.length) * 100);

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
      {/* TOAST */}
      <div id="bih-toast" style={{
        position:"fixed", bottom:24, right:24, zIndex:9999,
        background:"#2A1F14", color:"#E8D5B0", fontSize:13, fontWeight:500,
        padding:"10px 20px", borderRadius:10, letterSpacing:0.5,
        opacity:0, transform:"translateY(8px)", transition:"all .3s ease",
        pointerEvents:"none", boxShadow:"0 4px 20px rgba(0,0,0,0.2)"
      }}>✦ Salvo</div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #EDE6DA; }
        ::-webkit-scrollbar-thumb { background: #C9A96E; border-radius: 3px; }
        input, textarea, select { font-family: 'DM Sans', sans-serif; }
        .check-row:hover { background: #F9F5F0 !important; }
        .idea-row:hover { background: #FAF7F3 !important; }
        .tab-btn:hover { color: #6B4F35 !important; }
        .cal-cell:hover { border-color: #C9A96E !important; box-shadow: 0 2px 8px rgba(201,169,110,0.2) !important; }
        .btn-gold:hover { background: #6B4F35 !important; color: white !important; }
        .btn-ghost:hover { background: #EDE6DA !important; }
        .idea-card:hover { box-shadow: 0 4px 20px rgba(42,31,20,0.08) !important; transform: translateY(-1px); }
        .meeting-item:hover { border-color: #C9A96E !important; }
        .nav-scroll { overflow-x: auto; scrollbar-width: none; }
        .nav-scroll::-webkit-scrollbar { display: none; }
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
            <div style={{ fontSize:14, color:"#E8D5B0", fontWeight:500, marginTop:2 }}>31 Mar 2026</div>
          </div>
          <div style={{ background:"#C9A96E", color:"#2A1F14", fontSize:11, fontWeight:500, padding:"7px 16px", borderRadius:20, letterSpacing:1, textTransform:"uppercase" }}>
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
              padding:"15px 22px", fontSize:13, fontWeight: tab===t.id ? 500 : 400,
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

      {/* CONTENT */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 40px" }}>
        {tab === "visao" && <Visao metas={metas} checklist={checklist} progPct={progPct} doneCount={doneCount} />}
        {tab === "calendario" && <Calendario calHover={calHover} setCalHover={setCalHover} />}
        {tab === "lancamento" && <Lancamento checklist={checklist} updateChecklist={updateChecklist} progPct={progPct} doneCount={doneCount} />}
        {tab === "ideias" && <Ideias ideias={ideias} updateIdeias={updateIdeias} />}
        {tab === "reunioes" && <Reunioes reunioes={reunioes} updateReunioes={updateReunioes} />}
        {tab === "metas" && <Metas metas={metas} updateMetas={updateMetas} />}
      </div>
    </div>
  );
}

// ─── SECTION TITLE ──────────────────────────────────────────────────────────
function STitle({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:400, color:"#2A1F14", whiteSpace:"nowrap" }}>{children}</span>
      <div style={{ flex:1, height:1, background:"#E8D5B0" }} />
    </div>
  );
}

// ─── CARD ────────────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{ background:"white", borderRadius:16, padding:26, border:"1px solid #E8DDD0", boxShadow:"0 2px 12px rgba(42,31,20,0.04)", ...style }}>
      {children}
    </div>
  );
}

// ─── VISÃO GERAL ─────────────────────────────────────────────────────────────
function Visao({ metas, checklist, progPct, doneCount }) {
  const semanas = [
    { d:"10–16 mar", num:"01", titulo:"Posicionamento & Autoridade", desc:"Conteúdos que mostram quem você é e o que transforma. Reels de quebra-mito, carrossel do método M.A.N.I., stories de bastidores.", cor:"#6B5BB5" },
    { d:"17–23 mar", num:"02", titulo:"Educação & Prova Social", desc:"Depoimentos reais, resultados de alunas, conteúdo educativo que gera valor e aquece para o lançamento.", cor:"#2563AB" },
    { d:"24–30 mar", num:"03", titulo:"Antecipação da Comunidade", desc:"Revelação progressiva. Benefícios exclusivos. Lista VIP aberta. CTA: 'comenta COMUNIDADE'.", cor:"#C9A96E" },
    { d:"31 mar+", num:"04", titulo:"🚀 Abertura das Inscrições", desc:"Lote 0 → Lote 1 → Valor fixo. Stories de bastidores, boas-vindas, onboarding visível.", cor:"#C4887A" },
  ];

  const canais = [
    { emoji:"📸", nome:"Instagram", papel:"Autoridade + Antecipação", cadencia:"1 post/dia · Stories diários · Reels 3–4x/sem" },
    { emoji:"🎵", nome:"TikTok", papel:"Alcance novo · Topo frio", cadencia:"3–4x/sem · Reaproveitamento do IG" },
    { emoji:"🎙️", nome:"Podcast", papel:"Nutrição + CTA direto", cadencia:"1 ep/sem · host-read ad no meio" },
    { emoji:"💬", nome:"WhatsApp", papel:"Hábito diário + Funil APP", cadencia:"1 áudio/dia · 1 menção APP/sem" },
  ];

  return (
    <div>
      {/* Top 3 cards */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:20, marginBottom:28 }}>
        <Card>
          <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 }}>Foco do mês</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:"#2A1F14", marginBottom:10 }}>Lançamento da Comunidade MANI</div>
          <p style={{ fontSize:13, color:"#9C8472", lineHeight:1.7 }}>Todos os conteúdos deste mês apontam para um único destino: a Comunidade. Cada post constrói desejo, autoridade e antecipação.</p>
          <div style={{ marginTop:16, padding:"10px 14px", background:"#F7F3EE", borderRadius:10, fontSize:12, color:"#6B4F35" }}>
            <strong>Esteira:</strong> WhatsApp → APP (R$247) → Comunidade (R$997→1.497) → Premium
          </div>
        </Card>
        <Card style={{ textAlign:"center" }}>
          <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 }}>Checklist</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:52, fontWeight:300, color:"#C9A96E", lineHeight:1 }}>{doneCount}</div>
          <div style={{ fontSize:11, color:"#9C8472", marginTop:4, marginBottom:14 }}>de {checklist.length} tarefas</div>
          <div style={{ height:6, background:"#EDE6DA", borderRadius:10, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progPct}%`, background:"linear-gradient(90deg,#C9A96E,#C4887A)", borderRadius:10, transition:"width .6s" }} />
          </div>
          <div style={{ fontSize:11, color:"#C9A96E", marginTop:8, fontWeight:500 }}>{progPct}% concluído</div>
        </Card>
        <Card style={{ textAlign:"center" }}>
          <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 }}>Dias até o lançamento</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:52, fontWeight:300, color:"#C4887A", lineHeight:1 }}>
            {Math.max(0, Math.ceil((new Date("2026-03-31") - new Date()) / 86400000))}
          </div>
          <div style={{ fontSize:11, color:"#9C8472", marginTop:4 }}>31 de março</div>
          <div style={{ marginTop:14, fontSize:12, color:"#C9A96E", fontWeight:500 }}>✦ Lote 0 · R$ 997</div>
        </Card>
      </div>

      {/* Semanas */}
      <STitle>Semanas de Março</STitle>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
        {semanas.map(s => (
          <Card key={s.num}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:s.cor, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:600, flexShrink:0 }}>{s.num}</div>
              <div>
                <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.2, marginBottom:4 }}>{s.d}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"#2A1F14", marginBottom:6 }}>{s.titulo}</div>
                <p style={{ fontSize:12.5, color:"#9C8472", lineHeight:1.6 }}>{s.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Canais */}
      <STitle>Distribuição por Canal</STitle>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {canais.map(c => (
          <Card key={c.nome} style={{ padding:18 }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{c.emoji}</div>
            <div style={{ fontWeight:500, fontSize:14, color:"#2A1F14", marginBottom:4 }}>{c.nome}</div>
            <div style={{ fontSize:11, color:"#C9A96E", fontStyle:"italic", marginBottom:8 }}>{c.papel}</div>
            <div style={{ fontSize:11, color:"#9C8472", lineHeight:1.6 }}>{c.cadencia}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── CALENDÁRIO ──────────────────────────────────────────────────────────────
function Calendario({ calHover, setCalHover }) {
  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const semLabels = ["Pré-início", "Sem 1 · Autoridade", "Sem 2 · Prova Social", "Sem 3 · Antecipação", "✦ Lançamento"];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <STitle>Calendário Editorial — Março 2026</STitle>
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        {[["Reels","reels"],["Carrossel","car"],["Stories","st"],["Podcast","pod"],["✦ Lançamento","launch"]].map(([l,c]) => (
          <span key={c} style={{ fontSize:10, padding:"4px 10px", borderRadius:20, fontWeight:500, background:PILL_STYLES[c]?.bg || "#EDE8FF", color:PILL_STYLES[c]?.color || "#6B5BB5" }}>{l}</span>
        ))}
      </div>

      {/* Header */}
      <div style={{ display:"grid", gridTemplateColumns:"80px repeat(7,1fr)", gap:6, marginBottom:6 }}>
        <div />
        {dias.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, padding:"6px 0" }}>{d}</div>
        ))}
      </div>

      {CAL.map((week, wi) => (
        <div key={wi} style={{ display:"grid", gridTemplateColumns:"80px repeat(7,1fr)", gap:6, marginBottom:6, alignItems:"start" }}>
          <div style={{ fontSize:10, color:"#9C8472", padding:"10px 6px 0", lineHeight:1.4, letterSpacing:0.5 }}>{semLabels[wi]}</div>
          {week.map((cell, ci) => {
            if (!cell.d) return <div key={ci} />;
            const isLaunch = cell.launch;
            const isHover = calHover === `${wi}-${ci}`;
            return (
              <div key={ci} className="cal-cell"
                onMouseEnter={() => setCalHover(`${wi}-${ci}`)}
                onMouseLeave={() => setCalHover(null)}
                style={{
                  background: isLaunch ? "linear-gradient(135deg,#FFF5E6,#FFE8CC)" : cell.pills ? "white" : "white",
                  border: isLaunch ? "1px solid #C9A96E" : cell.pills ? "1px solid #DDD0C0" : "1px dashed #E8DDD0",
                  borderRadius:10, padding:"8px 8px 10px", minHeight:72,
                  cursor: cell.pills || isLaunch ? "pointer" : "default",
                  transition:"all .15s", position:"relative",
                  boxShadow: isHover && (cell.pills||isLaunch) ? "0 4px 16px rgba(201,169,110,0.2)" : "none",
                }}>
                <div style={{ fontSize:11, color:"#9C8472", marginBottom:5 }}>{cell.d}</div>
                {(cell.pills || isLaunch) && (
                  <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                    {cell.pills?.map((p,i) => (
                      <span key={i} style={{ fontSize:9, padding:"2px 7px", borderRadius:20, fontWeight:500, display:"inline-block", background:PILL_STYLES[p.c]?.bg, color:PILL_STYLES[p.c]?.color }}>{p.l}</span>
                    ))}
                    {isLaunch && <span style={{ fontSize:9, padding:"2px 7px", borderRadius:20, fontWeight:500, display:"inline-block", background:"linear-gradient(135deg,#FFE8CC,#FFD4A0)", color:"#8B5E00" }}>✦ Launch</span>}
                  </div>
                )}
                {isHover && cell.tema && (
                  <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:0, zIndex:10, background:"#2A1F14", color:"white", fontSize:11, padding:"8px 12px", borderRadius:8, lineHeight:1.5, width:180, boxShadow:"0 4px 16px rgba(0,0,0,0.2)", pointerEvents:"none" }}>
                    {cell.tema}
                    <div style={{ position:"absolute", top:"100%", left:16, width:0, height:0, borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:"5px solid #2A1F14" }} />
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
    { nome:"Lote 0", preco:"R$ 997", quando:"Semana 3 · Lista VIP", desc:"Exclusivo para quem entrar na lista antes da abertura.", cor:"#6B5BB5" },
    { nome:"Lote 1", preco:"R$ 1.297", quando:"Sem. 3–4 · Abertura geral", desc:"Abertura oficial para toda a audiência.", cor:"#C4887A" },
    { nome:"Valor fixo", preco:"R$ 1.497", quando:"A partir de Abril", desc:"Preço permanente após o lançamento.", cor:"#2A1F14" },
  ];

  const toggle = (id) => updateChecklist(checklist.map(c => c.id === id ? {...c, done:!c.done} : c));

  return (
    <div>
      <STitle>Comunidade de Manifestação MANI</STitle>

      {/* Lotes */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
        {lotes.map(l => (
          <Card key={l.nome} style={{ borderTop:`3px solid ${l.cor}`, textAlign:"center" }}>
            <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>{l.quando}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:"#2A1F14", marginBottom:4 }}>{l.nome}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, color:l.cor, fontWeight:300, marginBottom:10 }}>{l.preco}</div>
            <p style={{ fontSize:12, color:"#9C8472", lineHeight:1.5 }}>{l.desc}</p>
          </Card>
        ))}
      </div>

      {/* Checklist */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }}>
        <Card>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#2A1F14" }}>Checklist do Lançamento</div>
            <div style={{ fontSize:12, color:"#C9A96E", fontWeight:500 }}>{doneCount}/{checklist.length} concluídos</div>
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
            <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>Papel de cada canal</div>
            {[
              ["📸", "Instagram", "Desejo + CTA diário nos Stories"],
              ["🎵", "TikTok", "Alcance frio → IG"],
              ["🎙️", "Podcast", "Host-read ad no meio do ep."],
              ["💬", "WhatsApp", "Link VIP para os 1K do grupo"],
            ].map(([e, n, p]) => (
              <div key={n} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ fontSize:18, lineHeight:1 }}>{e}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:500, color:"#2A1F14" }}>{n}</div>
                  <div style={{ fontSize:11, color:"#9C8472", lineHeight:1.4 }}>{p}</div>
                </div>
              </div>
            ))}
          </Card>
          <Card style={{ background:"linear-gradient(135deg,#FFF9F0,#FFF3E0)", border:"1px solid #E8D5B0" }}>
            <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>Meta realista</div>
            <p style={{ fontSize:12.5, color:"#6B4F35", lineHeight:1.7 }}>Com 293K seguidores e +1K no grupo, converter <strong>50–100 membras</strong> no Lote 0 representa entre <strong>R$49.850 e R$99.700</strong> só neste lançamento.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── IDEIAS ───────────────────────────────────────────────────────────────────
function Ideias({ ideias, updateIdeias }) {
  const [form, setForm] = useState({ titulo:"", formato:"Reels", tag:"Autoridade", obs:"" });
  const [filtro, setFiltro] = useState("Todos");
  const [del, setDel] = useState(null);

  const addIdeia = () => {
    if (!form.titulo.trim()) return;
    const next = [...ideias, { id: Date.now(), ...form }];
    updateIdeias(next);
    setForm({ titulo:"", formato:"Reels", tag:"Autoridade", obs:"" });
  };

  const removeIdeia = (id) => { updateIdeias(ideias.filter(i => i.id !== id)); setDel(null); };

  const filtradas = filtro === "Todos" ? ideias : ideias.filter(i => i.formato === filtro || i.tag === filtro);

  return (
    <div>
      <STitle>Banco de Ideias</STitle>

      {/* Filtros */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        {["Todos", ...FORMATOS, ...TAGS].map(f => (
          <button key={f} className="btn-ghost"
            onClick={() => setFiltro(f)}
            style={{ fontSize:11, padding:"5px 12px", borderRadius:20, border:`1px solid ${filtro===f ? "#C9A96E" : "#DDD0C0"}`, background: filtro===f ? "#C9A96E" : "white", color: filtro===f ? "#2A1F14" : "#9C8472", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14, marginBottom:24 }}>
        {filtradas.map(ideia => (
          <div key={ideia.id} className="idea-card"
            style={{ background:"white", borderRadius:14, padding:18, border:"1px solid #E8DDD0", transition:"all .2s", cursor:"default" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:PILL_STYLES[ideia.formato==="Reels"?"reels":ideia.formato==="Carrossel"?"car":ideia.formato==="Stories"?"st":"pod"]?.bg || "#EDE6DA", color:PILL_STYLES[ideia.formato==="Reels"?"reels":ideia.formato==="Carrossel"?"car":ideia.formato==="Stories"?"st":"pod"]?.color || "#6B4F35", fontWeight:500 }}>{ideia.formato}</span>
                <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:"#F7F3EE", color:TAG_COLORS[ideia.tag] || "#6B4F35", fontWeight:500, border:`1px solid ${TAG_COLORS[ideia.tag]}22` }}>{ideia.tag}</span>
              </div>
              <button onClick={() => setDel(ideia.id)}
                style={{ background:"none", border:"none", cursor:"pointer", color:"#DDD0C0", fontSize:16, padding:"0 2px", lineHeight:1, transition:"color .15s" }}
                onMouseEnter={e => e.target.style.color="#C4887A"}
                onMouseLeave={e => e.target.style.color="#DDD0C0"}>×</button>
            </div>
            <div style={{ fontSize:14, fontWeight:500, color:"#2A1F14", marginBottom:6, lineHeight:1.5 }}>{ideia.titulo}</div>
            {ideia.obs && <div style={{ fontSize:12, color:"#9C8472", lineHeight:1.5 }}>{ideia.obs}</div>}
            {del === ideia.id && (
              <div style={{ marginTop:12, display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:12, color:"#9C8472" }}>Remover ideia?</span>
                <button className="btn-gold" onClick={() => removeIdeia(ideia.id)}
                  style={{ fontSize:11, padding:"4px 12px", borderRadius:8, background:"#C4887A", color:"white", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Sim</button>
                <button onClick={() => setDel(null)}
                  style={{ fontSize:11, padding:"4px 12px", borderRadius:8, background:"#EDE6DA", color:"#6B4F35", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Não</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulário */}
      <Card>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#2A1F14", marginBottom:16 }}>Adicionar nova ideia</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 160px 160px", gap:12, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Título</div>
            <input value={form.titulo} onChange={e => setForm({...form, titulo:e.target.value})}
              placeholder="Ex: Como usar a lua nova para manifestar..."
              style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none" }} />
          </div>
          <div>
            <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Formato</div>
            <select value={form.formato} onChange={e => setForm({...form, formato:e.target.value})}
              style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none" }}>
              {FORMATOS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Tag</div>
            <select value={form.tag} onChange={e => setForm({...form, tag:e.target.value})}
              style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none" }}>
              {TAGS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Observações</div>
          <textarea value={form.obs} onChange={e => setForm({...form, obs:e.target.value})}
            rows={2} placeholder="Contexto, referências, intenção de venda..."
            style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none", resize:"none" }} />
        </div>
        <button className="btn-gold" onClick={addIdeia}
          style={{ background:"#C9A96E", color:"#2A1F14", border:"none", borderRadius:10, padding:"10px 22px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
          + Adicionar ao banco
        </button>
      </Card>
    </div>
  );
}

// ─── REUNIÕES ────────────────────────────────────────────────────────────────
function Reunioes({ reunioes, updateReunioes }) {
  const [form, setForm] = useState({ data:"", titulo:"", notas:"" });
  const [expandida, setExpandida] = useState(1);

  const addReuniao = () => {
    if (!form.titulo.trim()) return;
    const next = [{ id:Date.now(), ...form }, ...reunioes];
    updateReunioes(next);
    setForm({ data:"", titulo:"", notas:"" });
  };

  const fmtDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
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
              <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:1.5, color:"#C9A96E", fontWeight:500, marginBottom:4 }}>{fmtDate(r.data)}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, color:"#2A1F14" }}>{r.titulo}</div>
            </div>
            <div style={{ color:"#DDD0C0", fontSize:18, transition:"transform .2s", transform: expandida===r.id ? "rotate(180deg)" : "none" }}>▾</div>
          </div>
          {expandida === r.id && (
            <div style={{ padding:"0 20px 18px", borderTop:"1px solid #F0E8DC" }}>
              <div style={{ paddingTop:14, fontSize:13, color:"#3D2E1E", lineHeight:2, whiteSpace:"pre-line" }}>
                {r.notas}
              </div>
            </div>
          )}
        </div>
      ))}

      <Card style={{ marginTop:24 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#2A1F14", marginBottom:16 }}>Registrar nova reunião</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Data</div>
            <input type="date" value={form.data} onChange={e => setForm({...form, data:e.target.value})}
              style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none" }} />
          </div>
          <div>
            <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Título</div>
            <input value={form.titulo} onChange={e => setForm({...form, titulo:e.target.value})}
              placeholder="Ex: Reunião mensal de abril"
              style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none" }} />
          </div>
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Decisões e próximos passos</div>
          <textarea value={form.notas} onChange={e => setForm({...form, notas:e.target.value})}
            rows={4} placeholder="Liste as decisões tomadas e próximas ações (uma por linha)..."
            style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none", resize:"none" }} />
        </div>
        <button className="btn-gold" onClick={addReuniao}
          style={{ background:"#C9A96E", color:"#2A1F14", border:"none", borderRadius:10, padding:"10px 22px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
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

  const salvar = () => {
    updateMetas(draft);
    setEditando(false);
  };

  const pct = (real, meta) => {
    if (!meta || isNaN(meta) || Number(meta) === 0) return 0;
    return Math.min(100, Math.round((Number(real) / Number(meta)) * 100));
  };

  const fmtReal = (v) => {
    if (!v || v === "0") return "—";
    return "R$" + Number(v).toLocaleString("pt-BR");
  };

  const metaCards = [
    { key:"membrosLote0", realKey:"membrosLote0Real", label:"Meta Lote 0", sub:"membras no primeiro lote", prefix:"", cor:"#6B5BB5" },
    { key:"membrosTotal", realKey:"membrosTotalReal", label:"Meta Total", sub:"membras ao fim do lançamento", prefix:"", cor:"#C9A96E" },
    { key:"receita", realKey:"receitaReal", label:"Meta de Receita", sub:"faturamento no mês", prefix:"R$", cor:"#C4887A" },
  ];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <STitle>Metas & Acompanhamento</STitle>
        <button className="btn-gold" onClick={() => { setDraft({...metas}); setEditando(!editando); }}
          style={{ background: editando ? "#EDE6DA" : "#C9A96E", color: editando ? "#6B4F35" : "#2A1F14", border:"none", borderRadius:10, padding:"8px 18px", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
          {editando ? "Cancelar" : "✎ Editar metas"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {metaCards.map(mc => {
          const metaVal = metas[mc.key];
          const realVal = metas[mc.realKey] || 0;
          const p = pct(realVal, metaVal);
          return (
            <Card key={mc.key} style={{ textAlign:"center", borderTop:`3px solid ${mc.cor}` }}>
              <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 }}>{mc.label}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:46, fontWeight:300, color:mc.cor, lineHeight:1 }}>
                {metaVal ? `${mc.prefix}${Number(metaVal).toLocaleString("pt-BR")}` : "—"}
              </div>
              <div style={{ fontSize:11, color:"#9C8472", marginTop:6, marginBottom:14 }}>{mc.sub}</div>
              <div style={{ height:5, background:"#EDE6DA", borderRadius:10, overflow:"hidden", marginBottom:6 }}>
                <div style={{ height:"100%", width:`${p}%`, background:mc.cor, borderRadius:10, transition:"width .6s" }} />
              </div>
              <div style={{ fontSize:11, color:mc.cor, fontWeight:500 }}>{p}% atingido</div>
              {editando && (
                <div style={{ marginTop:12 }}>
                  <input type="number"
                    value={draft[mc.realKey] || ""}
                    onChange={e => setDraft({...draft, [mc.realKey]: e.target.value})}
                    placeholder="Realizado atual..."
                    style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:8, padding:"7px 12px", width:"100%", outline:"none", fontSize:12 }} />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {editando && (
        <Card style={{ marginBottom:20, background:"#FFFDF9", border:"1px solid #E8D5B0" }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#2A1F14", marginBottom:16 }}>Definir metas</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:16 }}>
            {metaCards.map(mc => (
              <div key={mc.key}>
                <div style={{ fontSize:11, color:"#9C8472", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>{mc.label} {mc.prefix && `(${mc.prefix})`}</div>
                <input type="number"
                  value={draft[mc.key] || ""}
                  onChange={e => setDraft({...draft, [mc.key]: e.target.value})}
                  placeholder={mc.prefix ? "Ex: 50000" : "Ex: 50"}
                  style={{ background:"#F7F3EE", border:"1px solid #DDD0C0", borderRadius:10, padding:"10px 14px", width:"100%", outline:"none" }} />
              </div>
            ))}
          </div>
          <button className="btn-gold" onClick={salvar}
            style={{ background:"#C9A96E", color:"#2A1F14", border:"none", borderRadius:10, padding:"10px 22px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
            Salvar metas
          </button>
        </Card>
      )}

      <Card>
        <div style={{ fontSize:10, color:"#9C8472", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 }}>Revisão de investimento</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#2A1F14", marginBottom:10 }}>Condições da parceria</div>
        <p style={{ fontSize:13.5, color:"#3D2E1E", lineHeight:1.8 }}>
          O investimento atual de <strong>R$ 500/mês</strong> será revisado quando uma das metas acima for atingida.
          Essa revisão reflete o crescimento da parceria e o resultado entregue — justo para os dois lados.
        </p>
        <div style={{ marginTop:16, padding:"12px 16px", background:"#F7F3EE", borderRadius:10, fontSize:12.5, color:"#6B4F35", lineHeight:1.7, borderLeft:"3px solid #C9A96E" }}>
          <strong>Referência:</strong> 50–100 membras no Lote 0 = <strong>R$49.850 a R$99.700</strong> de faturamento só no primeiro lançamento.
        </div>
      </Card>
    </div>
  );
}
