import { useState, useEffect, useRef, useCallback } from "react";
import { CATEGORY_LIBRARY, CATEGORY_NAMES } from "./categoryLibrary.js";

const PHASES = {
  SETUP: "setup",
  PREP: "prep",
  GRID: "grid",
  SELECTING: "selecting",
  DUEL: "duel",
  WINNER_CHOICE: "winner_choice",
  GAME_OVER: "game_over",
};

const CAT_POOL = [
  "Animals","Bible Characters","Worship Songs","Movies","Countries","Food & Drinks","Sports",
  "Music Artists","Bible Verses","Cars","TV Shows","Video Games","Science","History","Geography",
  "Cartoons","Superheroes","Disney","Board Games","Candy","Flags","Instruments","Dinosaurs",
  "Space","Ocean Life","Fruits & Veggies","Fairy Tales","Inventions","Languages","Colors",
  "Famous Landmarks","Dog Breeds","Flowers","Weather","Insects","Shoes","Pizza Toppings",
  "Books of the Bible","Holidays","Emojis","Dances","Ice Cream","Clothing Brands",
  "School Subjects","Olympic Sports","Birds","Snacks","Mythical Creatures","Card Games",
  "Breakfast Foods","Desserts","Parables","Apostles","Psalms","Church History",
  "Romanian Words","Farm Animals","Tools","Minecraft",
];

const COLORS = [
  "#E63946","#457B9D","#2A9D8F","#E9C46A","#F4A261","#264653","#6A0572","#AB83A1",
  "#D62828","#023E8A","#0077B6","#48CAE4","#90BE6D","#F94144","#F3722C","#577590",
  "#43AA8B","#F8961E","#BC6C25","#606C38","#283618","#DDA15E","#6D6875","#B5838D",
  "#E5989B","#6930C3","#5390D9","#4CC9F0","#7209B7","#3A0CA3","#560BAD","#480CA8",
  "#3F37C9","#4361EE","#4895EF","#723C70","#5C4D7D","#8E7DBE","#A2D2FF","#CDB4DB",
  "#FFC8DD","#BDE0FE","#FFAFCC","#A8DADC","#1D3557","#6B705C","#CB997E","#DDBEA9",
  "#FFE8D6","#B7B7A4","#A5A58D","#3D5A80","#293241","#98C1D9","#EE6C4D","#E76F51",
  "#2B2D42","#8D99AE","#EDF2F4","#EF233C","#D90429","#588157","#3A5A40","#344E41",
];

function uid() {
  return Math.random().toString(36).substr(2, 9);
}

function contrast(hex) {
  if (!hex) return "#ffffff";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#1a1a2e" : "#ffffff";
}

function lighten(hex, amt) {
  if (!hex) return "#888888";
  const a = amt || 0.2;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.min(255, Math.round(r + (255 - r) * a));
  const ng = Math.min(255, Math.round(g + (255 - g) * a));
  const nb = Math.min(255, Math.round(b + (255 - b) * a));
  return "#" + nr.toString(16).padStart(2, "0") + ng.toString(16).padStart(2, "0") + nb.toString(16).padStart(2, "0");
}

const PG = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 40%, #0d0d2b 100%)",
  color: "#e0e0e0",
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const PNL = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "20px 28px",
  marginBottom: "20px",
  width: "100%",
  maxWidth: "600px",
};

const LBL = {
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "3px",
  color: "#999",
  marginBottom: "12px",
};

const INP = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.3)",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const GB = {
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #FFD700, #FF6B35)",
  color: "#1a1a2e",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 0 20px rgba(255,215,0,0.3)",
};

const SB = {
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.05)",
  color: "#ccc",
  fontWeight: 700,
  cursor: "pointer",
};

function Logo({ sub }) {
  return (
    <div>
      <div
        style={{
          fontSize: "clamp(32px, 6vw, 56px)",
          fontWeight: 900,
          letterSpacing: "-2px",
          background: "linear-gradient(90deg, #FFD700, #FF6B35, #FFD700)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          marginBottom: "4px",
          textTransform: "uppercase",
          filter: "drop-shadow(0 0 20px rgba(255,215,0,0.3))",
        }}
      >
        THE FLOOR
      </div>
      <div
        style={{
          fontSize: "14px",
          letterSpacing: "6px",
          textTransform: "uppercase",
          color: "#888",
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        {sub || "Youth Group Edition"}
      </div>
    </div>
  );
}

/* ========== PLAYER DISPLAY (second window) ========== */
function usePlayerDisplay() {
  const winRef = useRef(null);

  const openDisplay = useCallback(function () {
    if (winRef.current && !winRef.current.closed) {
      winRef.current.focus();
      return;
    }
    const w = window.open("", "FloorDisplay", "width=1200,height=800,menubar=no,toolbar=no");
    if (!w) {
      alert("Please allow popups for this site to open the player display window.");
      return;
    }
    w.document.write(
      '<!DOCTYPE html><html><head><title>THE FLOOR - Player Display</title>' +
      '<style>' +
      '*{margin:0;padding:0;box-sizing:border-box}' +
      'body{background:#0a0a1a;color:#e0e0e0;font-family:"Segoe UI",system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;overflow:hidden}' +
      '#display{width:100%;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center}' +
      '#category{font-size:24px;letter-spacing:6px;text-transform:uppercase;color:#888;margin-bottom:10px}' +
      '#clue-area{flex:1;display:flex;align-items:center;justify-content:center;width:100%;max-width:900px}' +
      '#clue-area img{max-width:100%;max-height:70vh;object-fit:contain;border-radius:20px}' +
      '#clue-text{font-size:clamp(36px,8vw,72px);font-weight:800;color:#48CAE4;line-height:1.2}' +
      '#title-area{font-size:clamp(48px,10vw,96px);font-weight:900;background:linear-gradient(90deg,#FFD700,#FF6B35,#FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-transform:uppercase}' +
      '#subtitle{font-size:20px;color:#888;letter-spacing:8px;text-transform:uppercase;margin-top:10px}' +
      '#countdown{font-size:clamp(120px,25vw,200px);font-weight:900;color:#FFD700;text-shadow:0 0 60px rgba(255,215,0,0.5)}' +
      '#countdown-label{font-size:24px;color:#888;letter-spacing:6px;text-transform:uppercase;margin-bottom:20px}' +
      '#vs-area{display:flex;align-items:center;gap:40px;margin-bottom:30px}' +
      '.vs-player{text-align:center}' +
      '.vs-avatar{width:120px;height:120px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:900;margin-bottom:10px}' +
      '.vs-name{font-size:28px;font-weight:800}' +
      '.vs-cat{font-size:14px;color:#aaa;margin-top:4px}' +
      '#vs-text{font-size:48px;font-weight:900;color:#FFD700}' +
      '#timer-bar{display:flex;align-items:center;gap:20px;margin-top:20px;width:100%;max-width:800px}' +
      '.timer-side{flex:1;text-align:center}' +
      '.timer-name{font-size:18px;font-weight:700;margin-bottom:4px}' +
      '.timer-value{font-size:clamp(48px,8vw,80px);font-weight:900;font-variant-numeric:tabular-nums}' +
      '.timer-active{text-shadow:0 0 30px rgba(255,215,0,0.5)}' +
      '.timer-bar-bg{width:100%;height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;margin-top:8px}' +
      '.timer-bar-fill{height:100%;border-radius:4px;transition:width 0.1s linear}' +
      '#clue-counter{font-size:14px;color:#555;margin-top:16px}' +
      '#winner-name{font-size:clamp(48px,10vw,80px);font-weight:900;background:linear-gradient(90deg,#FFD700,#FF6B35,#FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent}' +
      '#winner-label{font-size:24px;color:#888;letter-spacing:8px;text-transform:uppercase;margin-bottom:20px}' +
      '#winner-avatar{width:150px;height:150px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:60px;font-weight:900;margin-bottom:20px}' +
      '@keyframes countPulse{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}' +
      '</style></head><body>' +
      '<div id="display"><div id="title-area">THE FLOOR</div><div id="subtitle">Youth Group Edition</div></div>' +
      '</body></html>'
    );
    w.document.close();
    winRef.current = w;
  }, []);

  const updateDisplay = useCallback(function (content) {
    const w = winRef.current;
    if (!w || w.closed) return;
    const el = w.document.getElementById("display");
    if (el) el.innerHTML = content;
  }, []);

  return { openDisplay: openDisplay, updateDisplay: updateDisplay };
}

/* ========== AI CLUE GEN ========== */
async function genAIClues(cat, n) {
  const count = n || 15;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content:
              'Generate exactly ' + count + ' trivia clue items for "' + cat + '" for a church youth group game show. Each item should be identifiable from a visual/text clue.\n\nReturn ONLY a JSON array:\n- "clue": short hint (2-8 words)\n- "answer": correct answer (1-4 words)\n\nEasy to hard. Clean for ages 12-18. ONLY JSON array, no markdown.',
          },
        ],
      }),
    });
    const d = await r.json();
    var text = "";
    if (d.content) {
      for (var i = 0; i < d.content.length; i++) {
        text += d.content[i].text || "";
      }
    }
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (e) {
    console.error(e);
    return null;
  }
}

/* ========== SETUP ========== */
function SetupScreen({ onStart }) {
  const [gs, setGs] = useState(4);
  const [pls, setPls] = useState([]);
  const [nn, setNn] = useState("");
  const [nc, setNc] = useState("");
  const [dt, setDt] = useState(45);
  const [uc, setUc] = useState(new Set());
  const ref = useRef(null);
  const tot = gs * gs;

  function getRandCat() {
    const a = CAT_POOL.filter(function (c) { return !uc.has(c); });
    return a.length ? a[Math.floor(Math.random() * a.length)] : "General Knowledge";
  }

  function add() {
    if (!nn.trim()) return;
    const c = nc.trim() || getRandCat();
    setPls(function (p) {
      return [
        ...p,
        {
          id: uid(), name: nn.trim(), category: c,
          color: COLORS[pls.length % COLORS.length],
          eliminated: false, hasDueled: false, winStreak: 0, timeBonus: 0,
        },
      ];
    });
    setUc(function (p) { return new Set([...p, c]); });
    setNn("");
    setNc("");
    if (ref.current) ref.current.focus();
  }

  function rm(idx) {
    const r = pls[idx];
    setPls(function (p) { return p.filter(function (_, j) { return j !== idx; }); });
    setUc(function (p) { const n = new Set(p); n.delete(r.category); return n; });
  }

  function fill() {
    const need = tot - pls.length;
    if (need <= 0) return;
    const av = CAT_POOL.filter(function (c) { return !uc.has(c); });
    const nms = ["Alex","Jordan","Sam","Taylor","Morgan","Riley","Casey","Avery","Quinn","Reese","Skyler","Dakota","Finley","Emery","Sage","River","Rowan","Sawyer","Phoenix","Blair","Drew","Kai","Lane","Jules","Charlie","Eden","Jamie","Peyton","Harley","Hayden","Rory","Blake","Cameron","Devon","Elliot","Francis","Glenn","Harper","Indigo","Jesse","Kerry","Logan","Micah","Nico","Oakley","Parker","Remy","Shiloh","Tatum","Uri","Val","Winter","Xen","Yael","Zion","Addison","Briar","Coby","Dallas","Ever","Flynn","Gray","Haven","Ira"];
    const un = new Set(pls.map(function (p) { return p.name; }));
    const bs = [];
    const nu = new Set(uc);
    for (var i = 0; i < need; i++) {
      const avNames = nms.filter(function (n) { return !un.has(n); });
      const nm = avNames[i] || "Player " + (pls.length + i + 1);
      const ct = av[i] || "Topic #" + (pls.length + i + 1);
      nu.add(ct);
      un.add(nm);
      bs.push({
        id: uid(), name: nm, category: ct,
        color: COLORS[(pls.length + i) % COLORS.length],
        eliminated: false, hasDueled: false, winStreak: 0, timeBonus: 0,
      });
    }
    setPls(function (p) { return [...p, ...bs]; });
    setUc(nu);
  }

  const ok = pls.length === tot;

  return (
    <div style={PG}>
      <Logo />
      <div style={PNL}>
        <div style={LBL}>Grid Size</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[3, 4, 5, 6, 7, 8].map(function (s) {
            return (
              <button
                key={s}
                onClick={function () { setGs(s); setPls([]); setUc(new Set()); }}
                style={{
                  flex: 1, minWidth: "55px", padding: "10px 8px", borderRadius: "10px",
                  border: s === gs ? "2px solid #FFD700" : "1px solid rgba(255,255,255,0.1)",
                  background: s === gs ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.03)",
                  color: s === gs ? "#FFD700" : "#aaa", fontSize: "15px", fontWeight: 700, cursor: "pointer",
                }}
              >
                {s}x{s}
                <div style={{ fontSize: "10px", fontWeight: 400, marginTop: "2px" }}>{s * s} players</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={PNL}>
        <div style={LBL}>Duel Timer</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[30, 45, 60, 90].map(function (t) {
            return (
              <button
                key={t}
                onClick={function () { setDt(t); }}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  border: t === dt ? "2px solid #FFD700" : "1px solid rgba(255,255,255,0.1)",
                  background: t === dt ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.03)",
                  color: t === dt ? "#FFD700" : "#aaa", fontSize: "16px", fontWeight: 700, cursor: "pointer",
                }}
              >
                {t}s
              </button>
            );
          })}
        </div>
      </div>

      <div style={PNL}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={LBL}>Players ({pls.length}/{tot})</div>
          {pls.length < tot && (
            <button
              onClick={fill}
              style={{
                padding: "6px 14px", borderRadius: "8px",
                border: "1px solid rgba(255,215,0,0.3)", background: "rgba(255,215,0,0.1)",
                color: "#FFD700", fontSize: "12px", cursor: "pointer", fontWeight: 600,
              }}
            >
              Auto-Fill
            </button>
          )}
        </div>
        {pls.length < tot && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
            <input
              ref={ref} value={nn}
              onChange={function (e) { setNn(e.target.value); }}
              onKeyDown={function (e) { if (e.key === "Enter") add(); }}
              placeholder="Player name"
              style={{ ...INP, flex: "2 1 120px" }}
            />
            <div style={{ flex: "2 1 180px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <select
                value={nc}
                onChange={function (e) { setNc(e.target.value); }}
                style={{ ...INP, cursor: "pointer", appearance: "auto" }}
              >
                <option value="">-- Pick a category or type custom --</option>
                {CATEGORY_NAMES.filter(function (c) { return !uc.has(c); }).map(function (c) {
                  return <option key={c} value={c}>{c} (15+ clues ready)</option>;
                })}
              </select>
              <input
                value={CATEGORY_NAMES.includes(nc) ? "" : nc}
                onChange={function (e) { setNc(e.target.value); }}
                onKeyDown={function (e) { if (e.key === "Enter") add(); }}
                placeholder="...or type a custom category"
                style={{ ...INP, fontSize: "12px", padding: "6px 10px" }}
              />
            </div>
            <button onClick={add} style={{ ...GB, padding: "10px 20px", fontSize: "14px" }}>ADD</button>
          </div>
        )}
        <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
          {pls.map(function (p, i) {
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: p.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: "13px", minWidth: "60px" }}>{p.name}</span>
                <span style={{ fontSize: "12px", color: "#888", flex: 1 }}>{p.category}</span>
                <button onClick={function () { rm(i); }} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "16px", padding: "2px 6px" }}>x</button>
              </div>
            );
          })}
        </div>
      </div>
      <button
        onClick={function () { if (ok) onStart(pls, gs, dt); }}
        disabled={!ok}
        style={{
          ...GB, padding: "16px 60px", fontSize: "20px", letterSpacing: "3px",
          textTransform: "uppercase", opacity: ok ? 1 : 0.3, cursor: ok ? "pointer" : "default",
        }}
      >
        NEXT: PREP CATEGORIES
      </button>
    </div>
  );
}

/* ========== PREP ========== */
function PrepScreen({ players, onDone }) {
  const [ci, setCi] = useState(function () {
    // Auto-load clues from the library for matching categories
    var initial = {};
    var cats = [...new Set(players.map(function (p) { return p.category; }))];
    cats.forEach(function (cat) {
      if (CATEGORY_LIBRARY[cat]) {
        initial[cat] = CATEGORY_LIBRARY[cat].map(function (c) {
          if (c.type === "image") {
            return { id: uid(), src: c.src, answer: c.answer, type: "image" };
          }
          return { id: uid(), clue: c.clue, answer: c.answer, type: "text" };
        });
      }
    });
    return initial;
  });
  const [act, setAct] = useState(null);
  const [gen, setGen] = useState({});
  const refs = useRef({});
  const cats = [...new Set(players.map(function (p) { return p.category; }))];

  function upload(cat, files) {
    Array.from(files).forEach(function (f) {
      const r = new FileReader();
      r.onload = function (e) {
        setCi(function (prev) {
          const arr = prev[cat] || [];
          return {
            ...prev,
            [cat]: [...arr, {
              id: uid(), src: e.target.result,
              answer: f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
              type: "image",
            }],
          };
        });
      };
      r.readAsDataURL(f);
    });
  }

  function rmC(cat, id) {
    setCi(function (p) {
      return { ...p, [cat]: (p[cat] || []).filter(function (c) { return c.id !== id; }) };
    });
  }

  function upA(cat, id, a) {
    setCi(function (p) {
      return { ...p, [cat]: (p[cat] || []).map(function (c) { return c.id === id ? { ...c, answer: a } : c; }) };
    });
  }

  async function doGen(cat) {
    setGen(function (p) { return { ...p, [cat]: true }; });
    const cl = await genAIClues(cat, 15);
    if (cl) {
      setCi(function (p) {
        return {
          ...p,
          [cat]: [...(p[cat] || []), ...cl.map(function (c) {
            return { id: uid(), clue: c.clue, answer: c.answer, type: "text" };
          })],
        };
      });
    }
    setGen(function (p) { return { ...p, [cat]: false }; });
  }

  function cnt(c) { return (ci[c] || []).length; }
  var tot = 0;
  Object.values(ci).forEach(function (a) { tot += a.length; });

  return (
    <div style={PG}>
      <Logo sub="Category Preparation" />
      <div style={{ ...PNL, maxWidth: "700px", background: "rgba(255,215,0,0.04)", borderColor: "rgba(255,215,0,0.15)" }}>
        <div style={{ fontSize: "14px", color: "#ccc", lineHeight: 1.6 }}>
          Upload <strong style={{ color: "#FFD700" }}>images</strong> (name files with the answer) or{" "}
          <strong style={{ color: "#FFD700" }}>generate AI text clues</strong>. The player display will show clues WITHOUT answers. Empty categories = host reads aloud.
        </div>
      </div>
      <div style={{ ...PNL, maxWidth: "700px" }}>
        <div style={{ ...LBL, marginBottom: "16px" }}>{cats.length} Categories &middot; {tot} total clues</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {cats.map(function (cat) {
            const on = act === cat;
            const n = cnt(cat);
            const items = ci[cat] || [];
            return (
              <div key={cat}>
                <button
                  onClick={function () { setAct(on ? null : cat); }}
                  style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", borderRadius: on ? "12px 12px 0 0" : "12px",
                    border: on ? "1px solid rgba(255,215,0,0.3)" : "1px solid rgba(255,255,255,0.08)",
                    borderBottom: on ? "none" : undefined,
                    background: on ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
                    color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span>{cat}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: n >= 8 ? "#2ECC71" : n > 0 ? "#FFA500" : "#666" }}>
                    {n} clues{n >= 8 ? " (Ready)" : ""}
                  </span>
                </button>
                {on && (
                  <div style={{ border: "1px solid rgba(255,215,0,0.3)", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "16px", background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                      <input
                        ref={function (el) { refs.current[cat] = el; }}
                        type="file" accept="image/*" multiple
                        onChange={function (e) { upload(cat, e.target.files); }}
                        style={{ display: "none" }}
                      />
                      <button onClick={function () { if (refs.current[cat]) refs.current[cat].click(); }} style={{ ...GB, padding: "8px 18px", fontSize: "12px" }}>
                        Upload Images
                      </button>
                      <button
                        onClick={function () { doGen(cat); }}
                        disabled={gen[cat]}
                        style={{
                          ...SB, padding: "8px 18px", fontSize: "12px",
                          color: gen[cat] ? "#666" : "#48CAE4",
                          borderColor: gen[cat] ? "rgba(255,255,255,0.05)" : "rgba(72,202,228,0.3)",
                        }}
                      >
                        {gen[cat] ? "Generating..." : "Generate AI Clues"}
                      </button>
                    </div>
                    {items.length === 0 && <div style={{ fontSize: "13px", color: "#555", fontStyle: "italic", padding: "8px 0" }}>No clues yet.</div>}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "300px", overflowY: "auto" }}>
                      {items.map(function (item, idx) {
                        return (
                          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
                            <span style={{ fontSize: "11px", color: "#555", width: "20px", textAlign: "center" }}>{idx + 1}</span>
                            {item.type === "image" ? (
                              <img src={item.src} alt="" style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: "44px", height: "44px", borderRadius: "6px", flexShrink: 0, background: "rgba(72,202,228,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#48CAE4" }}>TXT</div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {item.type === "text" && <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Clue: {item.clue}</div>}
                              <input
                                value={item.answer}
                                onChange={function (e) { upA(cat, item.id, e.target.value); }}
                                placeholder="Answer"
                                style={{ ...INP, padding: "4px 8px", fontSize: "13px", fontWeight: 600, width: "100%" }}
                              />
                            </div>
                            <button onClick={function () { rmC(cat, item.id); }} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "14px", padding: "4px" }}>x</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={function () { onDone(ci); }} style={{ ...GB, padding: "16px 50px", fontSize: "18px", letterSpacing: "2px", textTransform: "uppercase" }}>
        START THE FLOOR
      </button>
    </div>
  );
}

/* ========== GRID ========== */
function FloorGrid({ grid, gridSize, players, selPlayer, adjCells, onCellClick, phase }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(" + gridSize + ", 1fr)", gap: "3px", width: "100%", maxWidth: gridSize * 90 + "px", aspectRatio: "1", margin: "0 auto" }}>
      {grid.map(function (oid, idx) {
        const o = players.find(function (p) { return p.id === oid; });
        if (!o) return <div key={idx} style={{ background: "#111", borderRadius: "6px" }} />;
        const isSel = selPlayer && selPlayer.id === o.id;
        const isAdj = adjCells.includes(idx);
        const tc = contrast(o.color);
        const terr = grid.filter(function (id) { return id === o.id; }).length;
        return (
          <div
            key={idx}
            onClick={function () { onCellClick(idx); }}
            style={{
              background: isSel ? "linear-gradient(135deg, " + o.color + ", " + lighten(o.color, 0.3) + ")" : o.color,
              borderRadius: "6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "4px",
              cursor: isAdj && phase === PHASES.SELECTING ? "pointer" : "default",
              border: isSel ? "3px solid #FFD700" : isAdj ? "3px solid rgba(255,215,0,0.8)" : "1px solid rgba(0,0,0,0.2)",
              boxShadow: isSel ? "0 0 20px rgba(255,215,0,0.5)" : isAdj ? "0 0 15px rgba(255,215,0,0.3)" : "none",
              opacity: o.eliminated ? 0.3 : 1, transition: "all 0.3s", position: "relative", overflow: "hidden",
              animation: isAdj && phase === PHASES.SELECTING ? "pulse 1.5s infinite" : "none",
            }}
          >
            {terr > 1 && <div style={{ position: "absolute", top: "2px", right: "4px", fontSize: "10px", fontWeight: 900, color: tc, opacity: 0.7 }}>{terr}</div>}
            <div style={{ fontSize: "clamp(7px, " + Math.max(0.6, 3.5 / gridSize) + "vw, 12px)", fontWeight: 800, color: tc, textAlign: "center", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{o.name}</div>
            <div style={{ fontSize: "clamp(6px, " + Math.max(0.5, 2.5 / gridSize) + "vw, 9px)", color: tc, opacity: 0.75, textAlign: "center", lineHeight: 1.1, marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{o.category}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ========== RANDOMIZER ========== */
function Randomizer({ players, onSelect }) {
  const [spinning, setSpinning] = useState(true);
  const [cur, setCur] = useState(0);
  const [spd, setSpd] = useState(50);
  const elig = players.filter(function (p) { return !p.eliminated && !p.hasDueled; });

  useEffect(function () {
    if (!spinning || !elig.length) return;
    const t = setTimeout(function () {
      setCur(function (c) { return (c + 1) % elig.length; });
      setSpd(function (s) { return s + 8; });
      if (spd > 500) {
        setSpinning(false);
        setTimeout(function () { onSelect(elig[cur % elig.length]); }, 1200);
      }
    }, spd);
    return function () { clearTimeout(t); };
  }, [spinning, cur, spd]);

  const h = elig[cur % elig.length];
  if (!h) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ fontSize: "14px", letterSpacing: "6px", textTransform: "uppercase", color: "#FFD700", marginBottom: "20px", animation: "pulse 1s infinite" }}>RANDOMIZER</div>
      <div style={{ width: "180px", height: "180px", borderRadius: "24px", background: "linear-gradient(135deg, " + h.color + ", " + lighten(h.color, 0.3) + ")", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 0 60px " + h.color + "80", transition: "all 0.15s" }}>
        <div style={{ fontSize: "24px", fontWeight: 900, color: contrast(h.color) }}>{h.name}</div>
        <div style={{ fontSize: "13px", color: contrast(h.color), opacity: 0.8, marginTop: "4px" }}>{h.category}</div>
      </div>
      {!spinning && <div style={{ marginTop: "24px", fontSize: "18px", fontWeight: 700, color: "#FFD700", animation: "fadeIn 0.5s" }}>{h.name} steps up!</div>}
    </div>
  );
}

/* ========== DUEL (HOST VIEW) ========== */
function DuelScreen({ challenger, defender, duelTime, catImgs, onFinish, updateDisplay, openDisplay }) {
  const [cT, setCT] = useState(duelTime + (challenger.timeBonus || 0));
  const [dT, setDT] = useState(duelTime + (defender.timeBonus || 0));
  const [clock, setClock] = useState(null);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [ci, setCI] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [counting, setCounting] = useState(true);
  const iRef = useRef(null);

  const clues = catImgs[defender.category] || [];
  const clue = clues[ci] || null;
  const hasC = clues.length > 0;
  const maxC = duelTime + (challenger.timeBonus || 0);
  const maxD = duelTime + (defender.timeBonus || 0);

  // Countdown
  useEffect(function () {
    if (!counting) return;
    if (countdown <= 0) {
      setCounting(false);
      setClock("challenger");
      return;
    }
    const t = setTimeout(function () { setCountdown(function (c) { return c - 1; }); }, 1000);
    return function () { clearTimeout(t); };
  }, [counting, countdown]);

  // Update display during countdown
  useEffect(function () {
    if (!counting) return;
    updateDisplay(
      '<div id="countdown-label">GET READY</div>' +
      '<div id="vs-area">' +
      '<div class="vs-player"><div class="vs-avatar" style="background:linear-gradient(135deg,' + challenger.color + ',' + lighten(challenger.color, 0.3) + ');color:' + contrast(challenger.color) + '">' + challenger.name.charAt(0) + '</div><div class="vs-name" style="color:#fff">' + challenger.name + '</div><div class="vs-cat">' + challenger.category + '</div></div>' +
      '<div id="vs-text">VS</div>' +
      '<div class="vs-player"><div class="vs-avatar" style="background:linear-gradient(135deg,' + defender.color + ',' + lighten(defender.color, 0.3) + ');color:' + contrast(defender.color) + '">' + defender.name.charAt(0) + '</div><div class="vs-name" style="color:#fff">' + defender.name + '</div><div class="vs-cat">' + defender.category + '</div></div>' +
      '</div>' +
      '<div id="category">Category: ' + defender.category + '</div>' +
      '<div id="countdown" style="animation:countPulse 1s infinite">' + countdown + '</div>'
    );
  }, [counting, countdown]);

  // Timer
  useEffect(function () {
    if (!clock || paused || done || counting) {
      clearInterval(iRef.current);
      return;
    }
    iRef.current = setInterval(function () {
      var setter = clock === "challenger" ? setCT : setDT;
      setter(function (t) {
        var n = Math.max(0, +(t - 0.1).toFixed(1));
        if (n <= 0) { setDone(true); clearInterval(iRef.current); }
        return n;
      });
    }, 100);
    return function () { clearInterval(iRef.current); };
  }, [clock, paused, done, counting]);

  // Update display during duel
  useEffect(function () {
    if (counting || done) return;
    var clueHTML;
    if (hasC && clue) {
      if (clue.type === "image") {
        clueHTML = '<img src="' + clue.src + '" alt="Clue" style="max-height:50vh"/>';
      } else {
        clueHTML = '<div id="clue-text">' + clue.clue + '</div>';
      }
    } else {
      clueHTML = '<div style="font-size:24px;color:#555">Host is reading the question aloud</div>';
    }
    var cColor = cT <= 10 ? "#FF4444" : cT <= 20 ? "#FFA500" : "#FFD700";
    var dColor = dT <= 10 ? "#FF4444" : dT <= 20 ? "#FFA500" : "#FFD700";
    var cLabel = clock === "challenger" ? " (answering)" : "";
    var dLabel = clock === "defender" ? " (answering)" : "";
    var cNameColor = clock === "challenger" ? "#FFD700" : "#888";
    var dNameColor = clock === "defender" ? "#FFD700" : "#888";
    var cActive = clock === "challenger" ? " timer-active" : "";
    var dActive = clock === "defender" ? " timer-active" : "";
    updateDisplay(
      '<div id="category">Category: ' + defender.category + '</div>' +
      '<div id="clue-area">' + clueHTML + '</div>' +
      (hasC ? '<div id="clue-counter">' + (ci + 1) + ' / ' + clues.length + '</div>' : '') +
      '<div id="timer-bar">' +
      '<div class="timer-side"><div class="timer-name" style="color:' + cNameColor + '">' + challenger.name + cLabel + '</div>' +
      '<div class="timer-value' + cActive + '" style="color:' + cColor + '">' + Math.floor(cT) + '.' + Math.round((cT - Math.floor(cT)) * 10) + '</div>' +
      '<div class="timer-bar-bg"><div class="timer-bar-fill" style="width:' + ((cT / maxC) * 100) + '%;background:' + cColor + '"></div></div></div>' +
      '<div style="font-size:24px;font-weight:900;color:#444">VS</div>' +
      '<div class="timer-side"><div class="timer-name" style="color:' + dNameColor + '">' + defender.name + dLabel + '</div>' +
      '<div class="timer-value' + dActive + '" style="color:' + dColor + '">' + Math.floor(dT) + '.' + Math.round((dT - Math.floor(dT)) * 10) + '</div>' +
      '<div class="timer-bar-bg"><div class="timer-bar-fill" style="width:' + ((dT / maxD) * 100) + '%;background:' + dColor + '"></div></div></div>' +
      '</div>'
    );
  }, [cT, dT, clock, ci, counting, done]);

  function adv() {
    if (hasC) {
      setCI(function (i) { return Math.min(i + 1, clues.length - 1); });
    }
  }

  function pass() {
    if (!clock || done || counting) return;
    var setter = clock === "challenger" ? setCT : setDT;
    setter(function (t) { var n = Math.max(0, +(t - 3).toFixed(1)); if (n <= 0) setDone(true); return n; });
    adv();
  }

  function correct() {
    if (!clock || done || counting) return;
    setClock(clock === "challenger" ? "defender" : "challenger");
    adv();
  }

  function declare(who) {
    setDone(true);
    clearInterval(iRef.current);
    onFinish(who === "challenger" ? challenger : defender);
  }

  var loser = cT <= 0 ? "challenger" : dT <= 0 ? "defender" : null;

  useEffect(function () {
    if (done && loser) {
      var w = loser === "challenger" ? defender : challenger;
      updateDisplay(
        '<div id="winner-label">WINNER</div>' +
        '<div id="winner-avatar" style="background:linear-gradient(135deg,' + w.color + ',' + lighten(w.color, 0.3) + ');color:' + contrast(w.color) + ';box-shadow:0 0 80px ' + w.color + '80">' + w.name.charAt(0) + '</div>' +
        '<div id="winner-name">' + w.name + '</div>'
      );
      var t = setTimeout(function () { onFinish(w); }, 3000);
      return function () { clearTimeout(t); };
    }
  }, [done, loser]);

  function fmt(t) { return Math.floor(t) + "." + Math.round((t - Math.floor(t)) * 10); }

  function TimerSide({ player, time, side }) {
    var on = clock === side;
    var lost = done && ((side === "challenger" && cT <= 0) || (side === "defender" && dT <= 0));
    var won = done && loser && !lost;
    var mx = side === "challenger" ? maxC : maxD;
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 6px", background: on ? "linear-gradient(180deg, " + player.color + "25 0%, transparent 100%)" : "transparent", borderRadius: "14px", transition: "all 0.3s", minWidth: "120px" }}>
        <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", color: "#777", marginBottom: "4px" }}>{side === "challenger" ? "Challenger" : "Defender"}</div>
        <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, " + player.color + ", " + lighten(player.color, 0.3) + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 900, color: contrast(player.color), boxShadow: on ? "0 0 25px " + player.color + "60" : "none", border: on ? "2px solid #FFD700" : "2px solid transparent" }}>{player.name.charAt(0).toUpperCase()}</div>
        <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "6px" }}>{player.name}</div>
        <div style={{ fontSize: "clamp(28px, 7vw, 44px)", fontWeight: 900, fontVariantNumeric: "tabular-nums", color: time <= 10 ? "#FF4444" : time <= 20 ? "#FFA500" : "#FFD700", marginTop: "8px", textShadow: on ? "0 0 16px " + (time <= 10 ? "#FF4444" : "#FFD700") + "50" : "none" }}>{fmt(time)}</div>
        <div style={{ width: "85%", height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", marginTop: "6px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: (time / mx) * 100 + "%", background: time <= 10 ? "#FF4444" : time <= 20 ? "#FFA500" : player.color, borderRadius: "3px", transition: "width 0.1s linear" }} />
        </div>
        {lost && <div style={{ marginTop: "10px", fontSize: "16px", fontWeight: 900, color: "#FF4444", animation: "fadeIn 0.5s" }}>TIME IS UP</div>}
        {won && <div style={{ marginTop: "10px", fontSize: "16px", fontWeight: 900, color: "#FFD700", animation: "fadeIn 0.5s" }}>WINNER</div>}
        {!done && <button onClick={function () { declare(side); }} style={{ ...SB, marginTop: "10px", padding: "5px 12px", fontSize: "10px" }}>Declare Winner</button>}
      </div>
    );
  }

  return (
    <div style={{ ...PG, padding: "12px", justifyContent: "flex-start" }}>
      {counting && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ fontSize: "14px", letterSpacing: "6px", textTransform: "uppercase", color: "#888", marginBottom: "10px" }}>GET READY</div>
          <div style={{ display: "flex", alignItems: "center", gap: "30px", marginBottom: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, " + challenger.color + ", " + lighten(challenger.color, 0.3) + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", fontWeight: 900, color: contrast(challenger.color), boxShadow: "0 0 30px " + challenger.color + "60" }}>{challenger.name.charAt(0)}</div>
              <div style={{ fontSize: "16px", fontWeight: 800, marginTop: "8px" }}>{challenger.name}</div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "#FFD700" }}>VS</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, " + defender.color + ", " + lighten(defender.color, 0.3) + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", fontWeight: 900, color: contrast(defender.color), boxShadow: "0 0 30px " + defender.color + "60" }}>{defender.name.charAt(0)}</div>
              <div style={{ fontSize: "16px", fontWeight: 800, marginTop: "8px" }}>{defender.name}</div>
            </div>
          </div>
          <div style={{ fontSize: "16px", color: "#FFD700", marginBottom: "20px" }}>Category: {defender.category}</div>
          <div style={{ fontSize: "clamp(80px, 20vw, 150px)", fontWeight: 900, color: "#FFD700", textShadow: "0 0 60px rgba(255,215,0,0.5)", animation: "countPulse 1s infinite" }}>{countdown}</div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "4px", color: "#777" }}>Category (HOST VIEW)</div>
        <button onClick={openDisplay} style={{ ...GB, padding: "4px 14px", fontSize: "10px", letterSpacing: "1px" }}>Open Player Display</button>
      </div>
      <div style={{ fontSize: "clamp(18px, 4vw, 28px)", fontWeight: 900, color: "#FFD700", marginBottom: "10px", textAlign: "center" }}>{defender.category}</div>

      {/* Clue with answer visible to host */}
      <div style={{ width: "100%", maxWidth: "600px", minHeight: "180px", background: "rgba(0,0,0,0.4)", border: "2px solid rgba(255,215,0,0.2)", borderRadius: "18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", marginBottom: "14px", position: "relative" }}>
        {hasC && clue ? (
          <div style={{ textAlign: "center" }}>
            {clue.type === "image" ? (
              <img src={clue.src} alt="Clue" style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "12px" }} />
            ) : (
              <div style={{ fontSize: "clamp(20px, 4vw, 36px)", fontWeight: 800, color: "#48CAE4", lineHeight: 1.3 }}>{clue.clue}</div>
            )}
            <div style={{ marginTop: "10px", fontSize: "18px", fontWeight: 700, color: "#2ECC71", background: "rgba(46,204,113,0.12)", padding: "6px 20px", borderRadius: "10px" }}>
              Answer: {clue.answer}
            </div>
            <div style={{ position: "absolute", top: "10px", right: "14px", fontSize: "11px", color: "#555" }}>{ci + 1}/{clues.length}</div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "14px", color: "#555" }}>No clues loaded. Host reads aloud.</div>
          </div>
        )}
      </div>

      {/* Timers */}
      <div style={{ display: "flex", width: "100%", maxWidth: "600px", gap: "8px", marginBottom: "14px" }}>
        <TimerSide player={challenger} time={cT} side="challenger" />
        <div style={{ display: "flex", alignItems: "center", fontSize: "22px", fontWeight: 900, color: "#444" }}>VS</div>
        <TimerSide player={defender} time={dT} side="defender" />
      </div>

      {/* Controls */}
      {!done && !counting && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={correct} style={{ borderRadius: "12px", border: "none", padding: "14px 30px", fontSize: "16px", fontWeight: 800, cursor: "pointer", background: "linear-gradient(135deg, #2ECC71, #27AE60)", color: "#fff", boxShadow: "0 0 20px rgba(46,204,113,0.3)" }}>CORRECT</button>
          <button onClick={pass} style={{ borderRadius: "12px", border: "none", padding: "14px 24px", fontSize: "16px", fontWeight: 800, cursor: "pointer", background: "linear-gradient(135deg, #E74C3C, #C0392B)", color: "#fff", boxShadow: "0 0 20px rgba(231,76,60,0.3)" }}>PASS (-3s)</button>
          <button onClick={function () { setPaused(function (p) { return !p; }); }} style={{ ...SB, padding: "14px 18px", fontSize: "16px", color: paused ? "#FFD700" : "#aaa", background: paused ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)" }}>{paused ? "RESUME" : "PAUSE"}</button>
          {hasC && <button onClick={adv} style={{ ...SB, padding: "14px 16px", fontSize: "14px", color: "#48CAE4", borderColor: "rgba(72,202,228,0.3)" }}>SKIP CLUE</button>}
        </div>
      )}

      <style>
        {
          "@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}" +
          "@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}" +
          "@keyframes countPulse{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}"
        }
      </style>
    </div>
  );
}

/* ========== MAIN ========== */
export default function TheFloorGame() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [players, setPlayers] = useState([]);
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(4);
  const [duelTime, setDuelTime] = useState(45);
  const [selPlayer, setSelPlayer] = useState(null);
  const [adjCells, setAdjCells] = useState([]);
  const [challenger, setChallenger] = useState(null);
  const [defender, setDefender] = useState(null);
  const [showRand, setShowRand] = useState(false);
  const [msg, setMsg] = useState("");
  const [catImgs, setCatImgs] = useState({});
  const [setup, setSetup] = useState({});
  const { openDisplay, updateDisplay } = usePlayerDisplay();

  function setupDone(p, gs, dt) {
    setSetup({ players: p, gridSize: gs, duelTime: dt });
    setPhase(PHASES.PREP);
  }

  function prepDone(imgs) {
    setCatImgs(imgs);
    var p = setup.players;
    var gs = setup.gridSize;
    var dt = setup.duelTime;
    var sh = [...p].sort(function () { return Math.random() - 0.5; });
    setPlayers(sh);
    setGrid(sh.map(function (x) { return x.id; }));
    setGridSize(gs);
    setDuelTime(dt);
    setPhase(PHASES.GRID);
    setMsg("Welcome to THE FLOOR! Starting the Randomizer...");
    setTimeout(function () { setShowRand(true); }, 1500);
  }

  var getAdj = useCallback(function (pid) {
    var indices = [];
    grid.forEach(function (cid, i) {
      if (cid === pid) {
        var r = Math.floor(i / gridSize);
        var c = i % gridSize;
        if (r > 0) indices.push((r - 1) * gridSize + c);
        if (r < gridSize - 1) indices.push((r + 1) * gridSize + c);
        if (c > 0) indices.push(r * gridSize + (c - 1));
        if (c < gridSize - 1) indices.push(r * gridSize + (c + 1));
      }
    });
    var unique = [...new Set(indices)];
    return unique.filter(function (i) {
      var o = grid[i];
      var pl = players.find(function (p) { return p.id === o; });
      return o !== pid && pl && !pl.eliminated;
    });
  }, [grid, gridSize, players]);

  function randSel(p) {
    setShowRand(false);
    setSelPlayer(p);
    setChallenger(p);
    setAdjCells(getAdj(p.id));
    setPhase(PHASES.SELECTING);
    setMsg(p.name + ", choose an adjacent opponent!");
    updateDisplay('<div id="title-area" style="font-size:clamp(36px,8vw,64px)">' + p.name + '</div><div id="subtitle">Choose your opponent!</div>');
  }

  function cellClick(idx) {
    if (phase !== PHASES.SELECTING || !adjCells.includes(idx)) return;
    var dp = players.find(function (p) { return p.id === grid[idx]; });
    if (!dp || dp.eliminated) return;
    setDefender(dp);
    setAdjCells([]);
    setPhase(PHASES.DUEL);
    setMsg(challenger.name + " vs " + dp.name + ' in "' + dp.category + '"!');
  }

  function duelDone(winner) {
    var loser = winner.id === challenger.id ? defender : challenger;
    var ng = grid.map(function (id) { return id === loser.id ? winner.id : id; });
    setGrid(ng);
    setPlayers(function (prev) {
      return prev.map(function (p) {
        if (p.id === loser.id) return { ...p, eliminated: true };
        if (p.id === winner.id) {
          var ns = p.winStreak + 1;
          return {
            ...p, hasDueled: true, winStreak: ns,
            timeBonus: ns >= 3 ? 5 : p.timeBonus,
            category: winner.id === defender.id ? challenger.category : p.category,
          };
        }
        return p;
      });
    });
    var rem = players.filter(function (p) { return !p.eliminated && p.id !== loser.id; });
    if (rem.length <= 1) {
      setPhase(PHASES.GAME_OVER);
      setMsg(winner.name + " has conquered THE ENTIRE FLOOR!");
      updateDisplay('<div id="winner-label">CHAMPION</div><div id="winner-avatar" style="background:linear-gradient(135deg,' + winner.color + ',' + lighten(winner.color, 0.3) + ');color:' + contrast(winner.color) + ';box-shadow:0 0 80px ' + winner.color + '80">' + winner.name.charAt(0) + '</div><div id="winner-name">' + winner.name + '</div><div id="subtitle">Has conquered THE ENTIRE FLOOR!</div>');
      return;
    }
    setPhase(PHASES.WINNER_CHOICE);
    setSelPlayer(winner);
    setMsg(winner.name + " wins! Challenge another or return?");
    updateDisplay('<div id="winner-label">WINNER</div><div id="winner-name">' + winner.name + '</div><div id="subtitle">Conquered ' + loser.name + "'s territory!</div>");
  }

  function contChallenge() {
    var adj = getAdj(selPlayer.id);
    if (!adj.length) { retFloor(); return; }
    setChallenger(selPlayer);
    setAdjCells(adj);
    setPhase(PHASES.SELECTING);
    setMsg(selPlayer.name + ", choose your next opponent!");
  }

  function retFloor() {
    setSelPlayer(null); setChallenger(null); setDefender(null); setAdjCells([]);
    setPhase(PHASES.GRID);
    setMsg("Randomizer selecting...");
    updateDisplay('<div id="title-area">THE FLOOR</div><div id="subtitle">Randomizer is selecting...</div>');
    setTimeout(function () {
      var el = players.filter(function (p) { return !p.eliminated && !p.hasDueled; });
      if (!el.length) {
        setPlayers(function (p) { return p.map(function (x) { return { ...x, hasDueled: false }; }); });
        setMsg("New round!");
        setTimeout(function () { setShowRand(true); }, 1000);
      } else {
        setShowRand(true);
      }
    }, 1500);
  }

  var lb = players.filter(function (p) { return !p.eliminated; }).map(function (p) {
    return { ...p, territory: grid.filter(function (id) { return id === p.id; }).length };
  }).sort(function (a, b) { return b.territory - a.territory; });
  var active = players.filter(function (p) { return !p.eliminated; });

  if (phase === PHASES.SETUP) return <SetupScreen onStart={setupDone} />;
  if (phase === PHASES.PREP) return <PrepScreen players={setup.players} onDone={prepDone} />;
  if (phase === PHASES.DUEL) return <DuelScreen challenger={challenger} defender={defender} duelTime={duelTime} catImgs={catImgs} onFinish={duelDone} updateDisplay={updateDisplay} openDisplay={openDisplay} />;

  return (
    <div style={{ ...PG, padding: "12px", alignItems: "stretch" }}>
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontSize: "clamp(24px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-1px", background: "linear-gradient(90deg, #FFD700, #FF6B35, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textTransform: "uppercase" }}>THE FLOOR</div>
        <div style={{ fontSize: "12px", color: "#888", letterSpacing: "4px", textTransform: "uppercase" }}>{active.length} players remaining</div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <button onClick={openDisplay} style={{ ...GB, padding: "10px 24px", fontSize: "13px", letterSpacing: "1px" }}>Open Player Display Window</button>
        <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>Project this window for players (no answers shown)</div>
      </div>

      {msg && <div style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: "12px", padding: "10px 16px", textAlign: "center", fontSize: "14px", fontWeight: 600, color: "#FFD700", marginBottom: "12px", maxWidth: "600px", alignSelf: "center" }}>{msg}</div>}

      {phase === PHASES.WINNER_CHOICE && selPlayer && (
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "16px", flexWrap: "wrap" }}>
          <button onClick={contChallenge} style={{ ...GB, padding: "12px 24px", fontSize: "14px" }}>Challenge Another</button>
          <button onClick={retFloor} style={{ ...SB, padding: "12px 24px", fontSize: "14px" }}>Return to the Floor</button>
        </div>
      )}

      {phase === PHASES.GAME_OVER && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ fontSize: "16px", letterSpacing: "8px", color: "#FFD700", textTransform: "uppercase", marginBottom: "20px" }}>GAME OVER</div>
          <div style={{ fontSize: "clamp(32px, 8vw, 56px)", fontWeight: 900, background: "linear-gradient(90deg, #FFD700, #FF6B35, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textAlign: "center", marginBottom: "10px" }}>{active[0] && active[0].name}</div>
          <div style={{ fontSize: "18px", color: "#ccc", marginBottom: "30px" }}>has conquered THE ENTIRE FLOOR!</div>
          <button
            onClick={function () { setPhase(PHASES.SETUP); setPlayers([]); setGrid([]); setMsg(""); setCatImgs({}); }}
            style={{ ...GB, padding: "14px 40px", fontSize: "18px", letterSpacing: "2px", textTransform: "uppercase" }}
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: "16px", maxWidth: "1000px", margin: "0 auto", alignItems: "flex-start", flexWrap: "wrap", width: "100%" }}>
        <div style={{ flex: "2 1 300px", minWidth: "250px" }}>
          <FloorGrid grid={grid} gridSize={gridSize} players={players} selPlayer={selPlayer} adjCells={adjCells} onCellClick={cellClick} phase={phase} />
        </div>
        <div style={{ flex: "1 1 200px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "14px", maxHeight: "400px", overflowY: "auto" }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "3px", color: "#888", marginBottom: "10px" }}>Leaderboard</div>
          {lb.map(function (p, i) {
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", borderRadius: "8px", marginBottom: "3px", background: i === 0 ? "rgba(255,215,0,0.08)" : "transparent" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, width: "20px", textAlign: "center", color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#666" }}>{i + 1}</span>
                <div style={{ width: "14px", height: "14px", borderRadius: "4px", background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#FFD700" }}>{p.territory}</span>
              </div>
            );
          })}
        </div>
      </div>

      {showRand && <Randomizer players={players} onSelect={randSel} />}

      <style>
        {
          "@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}" +
          "@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}" +
          "@keyframes countPulse{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}" +
          "*{box-sizing:border-box;margin:0;padding:0}" +
          "::-webkit-scrollbar{width:4px}" +
          "::-webkit-scrollbar-track{background:transparent}" +
          "::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}"
        }
      </style>
    </div>
  );
}
