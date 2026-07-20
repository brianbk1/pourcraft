import { useState } from "react";

// ---------- Design tokens ----------
const T = {
  bg: "#122420",
  bgDeep: "#0C1A17",
  brass: "#C9973F",
  brassSoft: "#E3C27E",
  cream: "#F5EEDD",
  ink: "#22201B",
  inkSoft: "#6E6455",
  wine: "#7A2E2E",
  line: "rgba(201,151,63,0.35)",
};

const displayFont = "Didot, 'Bodoni MT', 'Playfair Display', 'Times New Roman', serif";
const bodyFont = "Georgia, 'Iowan Old Style', serif";
const utilFont = "'Courier New', Courier, monospace";

const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

const TECHNIQUES = [
  { value: "", label: "Bartender's choice" },
  { value: "fat washing (e.g. butter- or bacon-washed spirit)", label: "Fat washing (butter, bacon, oils)" },
  { value: "milk washing / clarified milk punch", label: "Milk washing (clarified milk punch)" },
  { value: "oleo saccharum (citrus oil syrup)", label: "Oleo saccharum" },
  { value: "smoking the glass or the drink", label: "Smoked" },
  { value: "sous vide or rapid infusion", label: "Infusion (sous vide / rapid)" },
  { value: "acid adjusting (citric/malic solutions)", label: "Acid adjusting" },
  { value: "force carbonation / bottled sparkling serve", label: "Carbonated" },
  { value: "salt or saline solution enhancement", label: "Saline enhanced" },
];

const COLORS = [
  { value: "", label: "Any", swatch: "linear-gradient(135deg, #C9973F, #7A2E2E, #4A7A5E)" },
  { value: "ruby red", label: "Ruby", swatch: "#9B1B30" },
  { value: "sunset orange / amber", label: "Amber", swatch: "#D9822B" },
  { value: "golden yellow", label: "Gold", swatch: "#E2B93B" },
  { value: "vibrant green", label: "Green", swatch: "#4E8A4E" },
  { value: "ocean blue", label: "Blue", swatch: "#2E6E9B" },
  { value: "violet / purple", label: "Violet", swatch: "#6B4B8A" },
  { value: "blush pink", label: "Blush", swatch: "#D98A9B" },
  { value: "crystal clear / colorless", label: "Clear", swatch: "#E8E4D8" },
  { value: "deep brown / espresso", label: "Espresso", swatch: "#4A3325" },
];

const SERVES = [
  { value: 1, label: "R&D Sample", desc: "1 pour, dial in the recipe" },
  { value: 12, label: "Service Batch", desc: "12 — pre-batch for a shift" },
  { value: 50, label: "Event / Bulk", desc: "50 — large format" },
];

const OCCASIONS = [
  { value: "", label: "Any / no specific context" },
  { value: "happy hour — value-driven, fast to pour, crowd-pleasing", label: "Happy Hour" },
  { value: "special event — elevated, memorable, presentation-forward", label: "Special Event" },
  { value: "holiday menu — festive, seasonal, gift-worthy", label: "Holiday Menu" },
  { value: "weekend brunch — bright, lower-ABV friendly, food-forward", label: "Weekend Brunch" },
  { value: "tasting menu pairing — refined, course-matched, smaller pour", label: "Tasting Menu Pairing" },
  { value: "late night service — bold, high-strength, quick to make under pressure", label: "Late Night" },
  { value: "private / corporate event — polished, batchable, broad appeal", label: "Private / Corporate Event" },
];

const REMIXES = ["Smokier", "Sweeter", "Stronger", "Lighter", "More bitter", "More herbal"];

const SUGGESTIONS = [
  "bourbon", "gin", "mezcal", "aperol", "elderflower", "grapefruit",
  "rosemary", "ginger", "honey", "blood orange", "cardamom", "sage",
];

const JSON_SHAPE = (season, technique, color) => `{
  "name": "string",
  "tagline": "one poetic sentence describing the drink",
  "glassware": "string",
  "flavorProfile": ["3-5 short flavor words"],
  "ingredients": [{"amount": "e.g. 2 oz", "item": "string", "needToBuy": true or false}],
  "method": ["step 1", "step 2", "..."],
  "garnish": "string",
  "balance": {"sweet": 0-10, "sour": 0-10, "bitter": 0-10, "strength": 0-10},
  "seasonalNote": "one sentence on why this drink belongs to ${season}",
  "techniqueNote": ${technique ? '"one sentence on what the featured technique does for the drink"' : "null"},
  "colorNote": ${color ? '"one sentence on which ingredients create the color in the glass"' : "null"},
  "foodPairings": [{"dish": "string", "why": "one short sentence"}, {"dish": "string", "why": "one short sentence"}, {"dish": "string", "why": "one short sentence"}]
}`;

export default function PourCraft() {
  const [ingredients, setIngredients] = useState([]);
  const [draft, setDraft] = useState("");
  const [season, setSeason] = useState("Summer");
  const [zeroProof, setZeroProof] = useState(false);
  const [technique, setTechnique] = useState("");
  const [color, setColor] = useState("");
  const [serves, setServes] = useState(1);
  const [occasion, setOccasion] = useState("");
  const [kitchenContext, setKitchenContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [remixing, setRemixing] = useState("");
  const [error, setError] = useState("");
  const [drink, setDrink] = useState(null);
  const [menu, setMenu] = useState([]);
  const [viewingSaved, setViewingSaved] = useState(false);

  const addIngredient = (raw) => {
    const v = raw.trim().toLowerCase();
    if (!v) return;
    if (ingredients.includes(v)) { setDraft(""); return; }
    if (ingredients.length >= 8) return;
    setIngredients([...ingredients, v]);
    setDraft("");
  };

  const removeIngredient = (v) => setIngredients(ingredients.filter((i) => i !== v));

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient(draft);
    } else if (e.key === "Backspace" && !draft && ingredients.length) {
      removeIngredient(ingredients[ingredients.length - 1]);
    }
  };

  const buildRules = () => `Rules:
- The drink must feel unmistakably seasonal for ${season} (technique, garnish, and flavor should evoke the season).
- Use the given ingredients as the backbone; you may add a small number of complementary ingredients a good home bar could source.
- Scale ALL ingredient amounts for exactly ${serves} serving${serves > 1 ? "s" : ""}.${serves >= 12 ? " This is a service batch build: include pre-dilution water in the ingredient list, write the method as a batch prep (no per-glass shaking), and note shelf life / how long the batch holds quality once made." : ""}
- Write this for a professional bartender or bar manager, not a home mixologist. Use correct bar terminology (e.g. "express the oils," "dry shake," "single strain vs. double strain") and assume familiarity with standard technique — don't over-explain basics, but do give exact specs a bar could put on a POS or spec sheet.
${kitchenContext ? `- The venue's kitchen is currently serving: "${kitchenContext}". Tailor the food pairings specifically to this menu context rather than generic dish suggestions — reference dishes or flavor directions that would realistically appear on a menu like this.` : ""}
- Invent an evocative original name — never the name of an existing cocktail.
- Be genuinely creative: unexpected technique, infusion, or flavor pairing.
- For each ingredient, set "needToBuy": false if it matches or is derived from the user's listed ingredients (${ingredients.join(", ")}), true if it is an addition they likely need to source.
- "balance" scores are honest 0-10 ratings of the finished drink: sweet, sour, bitter, and strength (booziness${zeroProof ? ", which must be 0" : ""}).
${occasion ? `- The drink is for this occasion — let it shape the mood, presentation, and name: "${occasion}".` : ""}
${technique ? `- The drink MUST be built around this craft technique: ${technique}. Explain the technique's prep clearly in the method (including timing, e.g. how long to freeze/strain for a fat wash or how long to rest a milk wash), written so a home bartender can pull it off.` : ""}
${color ? `- The finished drink MUST present as ${color} in the glass, achieved through natural ingredients (juices, syrups, teas, bitters, liqueurs) — never artificial food dye. Choose additions that genuinely produce this color.` : ""}
${zeroProof ? "- Absolutely no alcohol in any ingredient." : ""}`;

  const callBartender = async (prompt) => {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  };

  const generate = async () => {
    if (!ingredients.length) {
      setError("Add at least one ingredient behind the bar first.");
      return;
    }
    setLoading(true);
    setError("");
    setDrink(null);
    setViewingSaved(false);

    const prompt = `You are a world-class craft bartender known for inventing highly original, never-before-seen cocktails. Invent ONE completely unique ${season.toLowerCase()} ${zeroProof ? "zero-proof (non-alcoholic) drink" : "cocktail"} built around these available ingredients: ${ingredients.join(", ")}.

${buildRules()}

Respond ONLY with a valid JSON object, no markdown fences, no preamble, exactly this shape:
${JSON_SHAPE(season, technique, color)}`;

    try {
      const parsed = await callBartender(prompt);
      setDrink(parsed);
    } catch (err) {
      setError("The bartender dropped the shaker. Try generating again.");
    } finally {
      setLoading(false);
    }
  };

  const remix = async (direction) => {
    if (!drink) return;
    setRemixing(direction);
    setError("");

    const prompt = `You are a world-class craft bartender. Here is a cocktail you just invented, as JSON:
${JSON.stringify(drink)}

Remix this exact drink to be noticeably ${direction.toLowerCase()}, keeping its soul, name lineage (you may evolve the name, e.g. add "No. 2" or a variant word), season (${season}), and serving count (${serves}).

${buildRules()}

Respond ONLY with a valid JSON object, no markdown fences, no preamble, exactly this shape:
${JSON_SHAPE(season, technique, color)}`;

    try {
      const parsed = await callBartender(prompt);
      setDrink(parsed);
      setViewingSaved(false);
    } catch (err) {
      setError("Remix spilled. Try again.");
    } finally {
      setRemixing("");
    }
  };

  const saveToMenu = () => {
    if (!drink) return;
    if (menu.some((m) => m.name === drink.name)) return;
    setMenu([...menu, drink]);
  };

  const isSaved = drink && menu.some((m) => m.name === drink.name);
  const youNeed = drink?.ingredients?.filter((i) => i.needToBuy) || [];
  const busy = loading || !!remixing;

  const labelStyle = { fontFamily: utilFont, fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: T.brass, display: "block", marginBottom: 8 };
  const cardHeading = { fontFamily: utilFont, fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 12px", color: T.wine };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgDeep} 100%)`, fontFamily: bodyFont, color: T.cream, padding: "0 16px 64px" }}>
      {/* ---------- Header ---------- */}
      <header style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", padding: "48px 0 8px" }}>
        <div style={{ fontFamily: utilFont, fontSize: 11, letterSpacing: "0.35em", color: T.brass, textTransform: "uppercase" }}>
R&D Tool · Original Recipe Development
        </div>
        <h1 style={{ fontFamily: displayFont, fontSize: "clamp(40px, 8vw, 64px)", fontWeight: 400, margin: "10px 0 6px", letterSpacing: "0.02em", color: T.brassSoft }}>
          PourCraft
        </h1>
        <p style={{ fontStyle: "italic", color: "rgba(245,238,221,0.75)", fontSize: 16, margin: 0 }}>
List your inventory. Get a spec sheet no one else is pouring.
        </p>
        <div style={{ height: 1, background: T.line, margin: "28px auto 0", maxWidth: 420 }} />
      </header>

      {/* ---------- Tonight's Menu strip ---------- */}
      {menu.length > 0 && (
        <div style={{ maxWidth: 640, margin: "20px auto 0" }}>
          <div style={labelStyle}>Tonight's menu · {menu.length} saved</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {menu.map((m) => (
              <button
                key={m.name}
                onClick={() => { setDrink(m); setViewingSaved(true); setError(""); }}
                style={{
                  background: drink?.name === m.name ? T.brass : "rgba(245,238,221,0.06)",
                  color: drink?.name === m.name ? T.bgDeep : T.brassSoft,
                  border: `1px solid ${T.line}`, borderRadius: 999, padding: "5px 14px",
                  fontFamily: bodyFont, fontSize: 13, cursor: "pointer",
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Controls ---------- */}
      <section style={{ maxWidth: 640, margin: "24px auto 0" }}>
        <label style={labelStyle}>Behind the bar — your ingredients</label>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "rgba(245,238,221,0.06)", border: `1px solid ${T.line}`, borderRadius: 6, padding: "10px 12px", cursor: "text" }}
          onClick={() => document.getElementById("ing-input")?.focus()}
        >
          {ingredients.map((i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(201,151,63,0.18)", border: `1px solid ${T.line}`, color: T.brassSoft, borderRadius: 999, padding: "4px 10px", fontSize: 14 }}>
              {i}
              <button
                onClick={(e) => { e.stopPropagation(); removeIngredient(i); }}
                aria-label={`Remove ${i}`}
                style={{ background: "none", border: "none", color: T.brassSoft, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            id="ing-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            onBlur={() => draft && addIngredient(draft)}
            placeholder={ingredients.length ? "" : "Type an ingredient, press Enter…"}
            style={{ flex: 1, minWidth: 140, background: "transparent", border: "none", outline: "none", color: T.cream, fontFamily: bodyFont, fontSize: 15, padding: "4px 2px" }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {SUGGESTIONS.filter((s) => !ingredients.includes(s)).slice(0, 8).map((s) => (
            <button
              key={s}
              onClick={() => addIngredient(s)}
              style={{ background: "none", border: `1px dashed rgba(201,151,63,0.4)`, color: "rgba(245,238,221,0.6)", borderRadius: 999, padding: "3px 10px", fontSize: 12, cursor: "pointer", fontFamily: bodyFont }}
            >
              + {s}
            </button>
          ))}
        </div>

        {/* Occasion */}
        <div style={{ marginTop: 24 }}>
          <label htmlFor="occasion-input" style={labelStyle}>
            The occasion <span style={{ opacity: 0.6, textTransform: "none", letterSpacing: "normal" }}>(optional)</span>
          </label>
          <input
            id="occasion-input"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="Happy hour special, holiday menu, tasting pairing, private event…"
            style={{ width: "100%", boxSizing: "border-box", background: "rgba(245,238,221,0.06)", border: `1px solid ${T.line}`, borderRadius: 6, color: T.cream, fontFamily: bodyFont, fontSize: 15, padding: "10px 12px", outline: "none" }}
          />
        </div>

        {/* Kitchen / menu context */}
        <div style={{ marginTop: 24 }}>
          <label htmlFor="kitchen-input" style={labelStyle}>
            What the kitchen is serving <span style={{ opacity: 0.6, textTransform: "none", letterSpacing: "normal" }}>(optional)</span>
          </label>
          <textarea
            id="kitchen-input"
            value={kitchenContext}
            onChange={(e) => setKitchenContext(e.target.value)}
            placeholder="Menu style, cuisine, or current specials — e.g. 'Neapolitan wood-fired pizza, seasonal antipasti' or 'this week's special is a smoked duck breast'"
            rows={2}
            style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: "rgba(245,238,221,0.06)", border: `1px solid ${T.line}`, borderRadius: 6, color: T.cream, fontFamily: bodyFont, fontSize: 15, padding: "10px 12px", outline: "none" }}
          />
        </div>

        {/* Season + zero proof */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
          <div>
            <div style={labelStyle}>Season</div>
            <div style={{ display: "flex", gap: 0, border: `1px solid ${T.line}`, borderRadius: 6, overflow: "hidden" }}>
              {SEASONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  style={{
                    padding: "8px 14px", fontSize: 13, fontFamily: bodyFont, cursor: "pointer", border: "none",
                    borderRight: s !== "Winter" ? `1px solid ${T.line}` : "none",
                    background: season === s ? T.brass : "transparent",
                    color: season === s ? T.bgDeep : "rgba(245,238,221,0.7)",
                    fontWeight: season === s ? 700 : 400,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "rgba(245,238,221,0.75)", marginTop: 18 }}>
            <input type="checkbox" checked={zeroProof} onChange={(e) => setZeroProof(e.target.checked)} style={{ accentColor: T.brass, width: 16, height: 16 }} />
            Zero-proof
          </label>
        </div>

        {/* Serves */}
        <div style={{ marginTop: 24 }}>
          <div style={labelStyle}>Build for</div>
          <div style={{ display: "flex", gap: 0, border: `1px solid ${T.line}`, borderRadius: 6, overflow: "hidden" }}>
            {SERVES.map((s, idx) => (
              <button
                key={s.value}
                onClick={() => setServes(s.value)}
                style={{
                  flex: 1, padding: "10px 8px", fontSize: 13, fontFamily: bodyFont, cursor: "pointer", border: "none",
                  borderRight: idx < SERVES.length - 1 ? `1px solid ${T.line}` : "none",
                  background: serves === s.value ? T.brass : "transparent",
                  color: serves === s.value ? T.bgDeep : "rgba(245,238,221,0.7)",
                  fontWeight: serves === s.value ? 700 : 400,
                }}
              >
                {s.label}
                <span style={{ display: "block", fontSize: 11, opacity: 0.75, fontWeight: 400 }}>{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Craft technique */}
        <div style={{ marginTop: 24 }}>
          <label htmlFor="technique-select" style={labelStyle}>Craft technique</label>
          <select
            id="technique-select"
            value={technique}
            onChange={(e) => setTechnique(e.target.value)}
            style={{
              width: "100%", background: "rgba(245,238,221,0.06)", border: `1px solid ${T.line}`, borderRadius: 6,
              color: technique ? T.brassSoft : "rgba(245,238,221,0.7)", fontFamily: bodyFont, fontSize: 15,
              padding: "10px 12px", cursor: "pointer", appearance: "auto",
            }}
          >
            {TECHNIQUES.map((t) => (
              <option key={t.label} value={t.value} style={{ background: T.bgDeep, color: T.cream }}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color outcome */}
        <div style={{ marginTop: 24 }}>
          <label style={labelStyle}>
            Color in the glass <span style={{ opacity: 0.6, textTransform: "none", letterSpacing: "normal" }}>(optional)</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {COLORS.map((c) => {
              const selected = color === c.value;
              return (
                <button
                  key={c.label}
                  onClick={() => setColor(c.value)}
                  aria-label={`Color: ${c.label}`}
                  aria-pressed={selected}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "center" }}
                >
                  <span
                    style={{
                      display: "block", width: 34, height: 34, borderRadius: "50%", background: c.swatch,
                      border: selected ? `2px solid ${T.brassSoft}` : `1px solid ${T.line}`,
                      boxShadow: selected ? `0 0 0 3px rgba(201,151,63,0.3)` : "none", margin: "0 auto",
                    }}
                  />
                  <span style={{ display: "block", fontSize: 11, marginTop: 5, color: selected ? T.brassSoft : "rgba(245,238,221,0.55)", fontFamily: bodyFont }}>
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={busy}
          style={{
            width: "100%", marginTop: 28, padding: "14px 0",
            background: busy ? "rgba(201,151,63,0.5)" : T.brass,
            color: T.bgDeep, border: "none", borderRadius: 6,
            fontFamily: displayFont, fontSize: 19, letterSpacing: "0.06em",
            cursor: busy ? "wait" : "pointer",
          }}
        >
          {loading ? "Stirring…" : "Pour me something new"}
        </button>

        {error && <p style={{ color: "#E0A0A0", fontSize: 14, textAlign: "center", marginTop: 12 }}>{error}</p>}
      </section>

      {/* ---------- Spec card ---------- */}
      {drink && (
        <section
          style={{
            maxWidth: 640, margin: "40px auto 0", background: T.cream, color: T.ink, borderRadius: 4,
            padding: "36px 32px 30px", boxShadow: "0 24px 60px rgba(0,0,0,0.45)", position: "relative",
            opacity: remixing ? 0.55 : 1, transition: "opacity 0.3s",
          }}
        >
          <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 10, height: 10, borderRadius: "50%", background: T.bgDeep, opacity: 0.85 }} />

          <div style={{ textAlign: "center", borderBottom: `2px solid ${T.ink}`, paddingBottom: 18 }}>
            <div style={{ fontFamily: utilFont, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: T.wine }}>
              House spec · {season} {zeroProof ? "· zero proof" : ""} · serves {serves}
            </div>
            <h2 style={{ fontFamily: displayFont, fontSize: "clamp(30px, 6vw, 42px)", fontWeight: 400, margin: "8px 0 6px" }}>
              {drink.name}
            </h2>
            <p style={{ fontStyle: "italic", color: T.inkSoft, margin: 0, fontSize: 15 }}>{drink.tagline}</p>
            {drink.flavorProfile?.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 6 }}>
                {drink.flavorProfile.map((f) => (
                  <span key={f} style={{ fontFamily: utilFont, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", border: `1px solid ${T.inkSoft}`, borderRadius: 999, padding: "2px 10px", color: T.inkSoft }}>
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pour Gauge */}
          {drink.balance && (
            <div style={{ padding: "20px 0 6px", borderBottom: `1px solid rgba(34,32,27,0.2)` }}>
              <h3 style={cardHeading}>The Pour Gauge™</h3>
              {[
                ["Sweet", drink.balance.sweet],
                ["Sour", drink.balance.sour],
                ["Bitter", drink.balance.bitter],
                ["Strength", drink.balance.strength],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: utilFont, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", width: 72, color: T.inkSoft }}>{lbl}</span>
                  <div style={{ flex: 1, height: 8, background: "rgba(34,32,27,0.12)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(10, Math.max(0, val ?? 0)) * 10}%`, height: "100%", background: lbl === "Strength" ? T.wine : T.brass, borderRadius: 999, transition: "width 0.6s ease" }} />
                  </div>
                  <span style={{ fontFamily: utilFont, fontSize: 11, width: 30, textAlign: "right", color: T.inkSoft }}>{val}/10</span>
                </div>
              ))}
            </div>
          )}

          {/* Build */}
          <div style={{ padding: "20px 0 14px", borderBottom: `1px solid rgba(34,32,27,0.2)` }}>
            <h3 style={cardHeading}>Build{serves >= 12 ? " — service batch" : ""}</h3>
            {drink.ingredients?.map((ing, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "5px 0", fontSize: 15, borderBottom: idx < drink.ingredients.length - 1 ? "1px dotted rgba(34,32,27,0.25)" : "none" }}>
                <span>
                  {ing.item}
                  {ing.needToBuy && (
                    <span style={{ fontFamily: utilFont, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.wine, border: `1px solid ${T.wine}`, borderRadius: 999, padding: "1px 7px", marginLeft: 8, verticalAlign: "middle" }}>
                      to buy
                    </span>
                  )}
                </span>
                <span style={{ fontFamily: utilFont, fontSize: 13, whiteSpace: "nowrap", color: T.inkSoft }}>{ing.amount}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 24, marginTop: 14, fontSize: 13, color: T.inkSoft, flexWrap: "wrap" }}>
              <span><strong style={{ color: T.ink }}>Glass:</strong> {drink.glassware}</span>
              <span><strong style={{ color: T.ink }}>Garnish:</strong> {drink.garnish}</span>
            </div>
            {youNeed.length > 0 && (
              <p style={{ fontSize: 13, color: T.inkSoft, marginTop: 12, marginBottom: 0 }}>
                <strong style={{ color: T.wine }}>Shopping list:</strong> {youNeed.map((i) => i.item).join(", ")}
              </p>
            )}
          </div>

          {/* Method */}
          <div style={{ padding: "18px 0 14px", borderBottom: `1px solid rgba(34,32,27,0.2)` }}>
            <h3 style={cardHeading}>Method</h3>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: 1.65 }}>
              {drink.method?.map((step, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{step}</li>
              ))}
            </ol>
            {drink.techniqueNote && (
              <p style={{ fontSize: 14, marginTop: 12, marginBottom: 0, color: T.wine }}>
                <strong style={{ fontFamily: utilFont, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>The technique · </strong>
                {drink.techniqueNote}
              </p>
            )}
            {drink.colorNote && (
              <p style={{ fontSize: 14, marginTop: 10, marginBottom: 0, color: T.wine }}>
                <strong style={{ fontFamily: utilFont, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>The color · </strong>
                {drink.colorNote}
              </p>
            )}
            {drink.seasonalNote && (
              <p style={{ fontStyle: "italic", color: T.inkSoft, fontSize: 14, marginTop: 10, marginBottom: 0 }}>
                {drink.seasonalNote}
              </p>
            )}
          </div>

          {/* Food pairings */}
          <div style={{ padding: "18px 0 4px", borderBottom: `1px solid rgba(34,32,27,0.2)` }}>
            <h3 style={cardHeading}>From the kitchen — pairings</h3>
            {drink.foodPairings?.map((p, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: displayFont, fontSize: 18 }}>{p.dish}</div>
                <div style={{ fontSize: 14, color: T.inkSoft }}>{p.why}</div>
              </div>
            ))}
          </div>

          {/* Remix bar */}
          <div style={{ padding: "18px 0 6px" }}>
            <h3 style={cardHeading}>Remix this pour</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {REMIXES.map((r) => (
                <button
                  key={r}
                  onClick={() => remix(r)}
                  disabled={busy}
                  style={{
                    background: remixing === r ? T.wine : "none",
                    color: remixing === r ? T.cream : T.ink,
                    border: `1px solid ${T.ink}`, borderRadius: 999, padding: "6px 14px",
                    fontFamily: bodyFont, fontSize: 13, cursor: busy ? "wait" : "pointer",
                  }}
                >
                  {remixing === r ? "Remixing…" : r}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <button
              onClick={saveToMenu}
              disabled={isSaved}
              style={{
                background: isSaved ? "rgba(34,32,27,0.1)" : T.ink,
                color: isSaved ? T.inkSoft : T.cream,
                border: "none", borderRadius: 999, padding: "9px 22px",
                fontFamily: bodyFont, fontSize: 14, cursor: isSaved ? "default" : "pointer",
              }}
            >
              {isSaved ? "On tonight's menu ✓" : "Add to tonight's menu"}
            </button>
            <button
              onClick={generate}
              disabled={busy}
              style={{ background: "none", border: `1px solid ${T.ink}`, borderRadius: 999, padding: "8px 22px", fontFamily: bodyFont, fontSize: 14, cursor: busy ? "wait" : "pointer", color: T.ink }}
            >
              {loading ? "Stirring…" : "Another round — new original"}
            </button>
          </div>
          {menu.length > 0 && (
            <p style={{ textAlign: "center", fontSize: 12, color: T.inkSoft, marginTop: 12, marginBottom: 0 }}>
              Menu is saved for this session only — screenshot or copy your keepers.
            </p>
          )}
        </section>
      )}

      {!drink && !loading && (
        <p style={{ textAlign: "center", color: "rgba(245,238,221,0.4)", fontSize: 14, marginTop: 48, fontStyle: "italic" }}>
          Your spec card will appear here.
        </p>
      )}
    </div>
  );
}
