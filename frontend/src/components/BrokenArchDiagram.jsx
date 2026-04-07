import { useState, useEffect } from "react";

const blueprintBlue = "rgba(168,200,240,";

const styles = `
  @keyframes dash-bad  { to { stroke-dashoffset: -18; } }
  @keyframes dash-good { to { stroke-dashoffset: -15; } }
  .bp-fb { stroke-dasharray: 3 9;  animation: dash-bad  0.9s linear infinite; }
  .bp-fg { stroke-dasharray: 3 12; animation: dash-good 1.8s linear infinite; }
`;

function CornerMarks({ x, y, w, h, opacity = 0.8 }) {
  const s = `rgba(168,200,240,${opacity})`;
  const t = 10;
  return (
    <>
      <path d={`M${x} ${y + t} L${x} ${y} L${x + t} ${y}`} fill="none" stroke={s} strokeWidth="1" />
      <path d={`M${x + w - t} ${y} L${x + w} ${y} L${x + w} ${y + t}`} fill="none" stroke={s} strokeWidth="1" />
      <path d={`M${x} ${y + h - t} L${x} ${y + h} L${x + t} ${y + h}`} fill="none" stroke={s} strokeWidth="1" />
      <path d={`M${x + w - t} ${y + h} L${x + w} ${y + h} L${x + w} ${y + h - t}`} fill="none" stroke={s} strokeWidth="1" />
    </>
  );
}

function Box({ x, y, w, h, label, sub, strokeOpacity = 0.45, fillOpacity = 0.06, labelOpacity = 0.85, subOpacity = 0.4, cornerOpacity = 0.8, dashed = false }) {
  return (
    <>
      <rect
        x={x} y={y} width={w} height={h}
        fill={`rgba(168,200,240,${fillOpacity})`}
        stroke={`rgba(168,200,240,${strokeOpacity})`}
        strokeWidth={dashed ? 1 : 1}
        strokeDasharray={dashed ? "6 4" : undefined}
      />
      <CornerMarks x={x} y={y} w={w} h={h} opacity={cornerOpacity} />
      <text
        x={x + w / 2} y={y + h / 2 - 6}
        textAnchor="middle"
        fill={`rgba(168,200,240,${labelOpacity})`}
        fontFamily="'Courier New', monospace"
        fontSize={12}
        fontWeight={700}
        letterSpacing="0.08em"
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2} y={y + h / 2 + 10}
          textAnchor="middle"
          fill={`rgba(168,200,240,${subOpacity})`}
          fontFamily="'Courier New', monospace"
          fontSize={9}
        >
          {sub}
        </text>
      )}
    </>
  );
}

function BeforeLayer() {
  return (
    <g>
      {/* bypass arc */}
      <path
        className="bp-fb"
        d="M306 80 Q362 80 362 232 Q362 380 306 380"
        fill="none"
        stroke="rgba(168,200,240,0.28)"
        strokeWidth={1.2}
        strokeDasharray="5 5"
        markerEnd="url(#mb)"
      />
      <text
        x={372} y={232}
        textAnchor="middle"
        fill="rgba(168,200,240,0.25)"
        fontFamily="'Courier New', monospace"
        fontSize={7.5}
        letterSpacing="0.1em"
        transform="rotate(90,372,232)"
      >
        BYPASSES LOGIC LAYER
      </text>

      {/* ghost connectors */}
      {[
        { y1: 90, y2: 168, delay: "-0.3s" },
        { y1: 216, y2: 288, delay: "-0.6s" },
        { y1: 336, y2: 408, delay: "-0.9s" },
      ].map(({ y1, y2, delay }, i) => (
        <line
          key={i}
          className="bp-fb"
          x1={200} y1={y1} x2={200} y2={y2}
          stroke="rgba(168,200,240,0.15)"
          strokeWidth={1}
          strokeDasharray="3 5"
          markerEnd="url(#mb)"
          style={{ animationDelay: delay }}
        />
      ))}

      <Box x={96}  y={32}  w={208} h={58} label="YOUR APP"    sub="[ frontend · vibe-coded ]" strokeOpacity={0.3} fillOpacity={0.04} labelOpacity={0.75} />
      <Box x={96}  y={168} w={208} h={48} label="LOGIC LAYER ?" sub="[ not specified ]" strokeOpacity={0.1} fillOpacity={0.02} labelOpacity={0.18} subOpacity={0.1} cornerOpacity={0.15} dashed />
      <Box x={96}  y={288} w={208} h={48} label="SUPABASE RT"  sub="[ realtime · db ]"        strokeOpacity={0.3} fillOpacity={0.04} labelOpacity={0.75} />
      <Box x={96}  y={408} w={208} h={48} label="POSTGRES"     sub="[ raw DB ]"               strokeOpacity={0.3} fillOpacity={0.04} labelOpacity={0.75} />

      <line x1={50} y1={476} x2={350} y2={476} stroke="rgba(168,200,240,0.12)" strokeWidth={0.5} />
      {["✕ no auth  ·  ✕ no state  ·  ✕ no recovery", "✕ no WS mgmt  ·  ✕ direct DB calls"].map((t, i) => (
        <text key={i} x={200} y={492 + i * 17} textAnchor="middle" fill="rgba(168,200,240,0.28)" fontFamily="'Courier New', monospace" fontSize={9.5}>{t}</text>
      ))}
    </g>
  );
}

function AfterLayer() {
  return (
    <g>
      {[
        { y1: 90,  y2: 160, delay: "0s" },
        { y1: 240, y2: 288, delay: "-0.5s" },
        { y1: 336, y2: 408, delay: "-1s" },
      ].map(({ y1, y2, delay }, i) => (
        <line
          key={i}
          className="bp-fg"
          x1={200} y1={y1} x2={200} y2={y2}
          stroke="rgba(168,200,240,0.7)"
          strokeWidth={1.5}
          markerEnd="url(#mg)"
          style={{ animationDelay: delay }}
        />
      ))}

      <Box x={96} y={32}  w={208} h={58} label="YOUR APP"   sub="[ frontend · vibe-coded ]" />
      <Box x={96} y={288} w={208} h={48} label="SUPABASE RT" sub="[ realtime · db ]" />
      <Box x={96} y={408} w={208} h={48} label="POSTGRES"    sub="[ raw DB ]" />

      {/* Vertoiz — highlighted */}
      <rect x={86} y={160} width={228} height={80} fill="rgba(168,200,240,0.1)" stroke="rgba(168,200,240,0.95)" strokeWidth={1.5} />
      <CornerMarks x={86} y={160} w={228} h={80} opacity={1} />
      <text x={200} y={190} textAnchor="middle" fill="#a8c8f0" fontFamily="'Courier New', monospace" fontSize={14} fontWeight={700} letterSpacing="0.14em">VERTOIZ</text>
      <text x={200} y={209} textAnchor="middle" fill="rgba(168,200,240,0.65)" fontFamily="'Courier New', monospace" fontSize={9.5} letterSpacing="0.05em">[ WS SERVER · LOGIC LAYER ]</text>
      <text x={200} y={226} textAnchor="middle" fill="rgba(168,200,240,0.4)"  fontFamily="'Courier New', monospace" fontSize={8.5}>auth · state · routing · recovery</text>

      <line x1={50} y1={476} x2={350} y2={476} stroke="rgba(168,200,240,0.15)" strokeWidth={0.5} />
      {["✓ auth enforced  ·  ✓ state managed", "✓ WS managed  ·  ✓ recovery handled"].map((t, i) => (
        <text key={i} x={200} y={492 + i * 17} textAnchor="middle" fill="rgba(168,200,240,0.45)" fontFamily="'Courier New', monospace" fontSize={9.5}>{t}</text>
      ))}
    </g>
  );
}

export default function BrokenArchDiagram() {
  const [phase, setPhase] = useState("before");

  useEffect(() => {
    const id = setInterval(() => {
      setPhase((p) => (p === "before" ? "after" : "before"));
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const isBefore = phase === "before";

  return (
    <div style={{ background: "#0b1f3a", borderRadius: 12, overflow: "hidden", padding: "24px 16px 28px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <style>{styles}</style>

      {/* grid */}
      <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.18 }}>
        <defs>
          <pattern id="bp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#a8c8f0" strokeWidth="0.4" />
          </pattern>
          <pattern id="bp-grid-big" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#a8c8f0" strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-grid)" />
        <rect width="100%" height="100%" fill="url(#bp-grid-big)" />
      </svg>

      {/* header */}
      <div style={{ width: "100%", maxWidth: 420, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(168,200,240,0.2)", paddingBottom: 8, marginBottom: 12, position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(168,200,240,0.45)", fontFamily: "'Courier New', monospace" }}>DWG NO. VTZ-001</span>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", padding: "3px 14px",
          border: `1px solid rgba(168,200,240,${isBefore ? 0.3 : 0.8})`,
          color: `rgba(168,200,240,${isBefore ? 0.45 : 0.9})`,
          background: `rgba(168,200,240,${isBefore ? 0.04 : 0.1})`,
          fontFamily: "'Courier New', monospace",
          transition: "all 0.5s ease",
        }}>
          {isBefore ? "WITHOUT VERTOIZ" : "WITH VERTOIZ"}
        </div>
        <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(168,200,240,0.45)", fontFamily: "'Courier New', monospace" }}>REV A</span>
      </div>

      {/* diagram */}
      <svg
        width="100%"
        viewBox="0 0 400 560"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "relative", zIndex: 1, opacity: 1, transition: "opacity 0.5s ease" }}
      >
        <defs>
          <marker id="mb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="rgba(168,200,240,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          </marker>
          <marker id="mg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="rgba(168,200,240,0.9)" strokeWidth="1.5" strokeLinecap="round" />
          </marker>
        </defs>
        {isBefore ? <BeforeLayer /> : <AfterLayer />}
      </svg>

      {/* footer */}
      <div style={{ width: "100%", maxWidth: 420, display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(168,200,240,0.15)", paddingTop: 8, marginTop: 4, position: "relative", zIndex: 1 }}>
        {["VERTOIZ.COM", "BACKEND ARCHITECTURE ENFORCEMENT", "SCALE: N/A"].map((t) => (
          <span key={t} style={{ fontSize: 8, letterSpacing: "0.12em", color: "rgba(168,200,240,0.25)", fontFamily: "'Courier New', monospace" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
