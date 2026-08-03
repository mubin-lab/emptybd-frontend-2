"use client";
import BackendImage from "@/components/shared/BackendImage";


import React, { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Download, Upload, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type CardType = "Character" | "Action" | "Item" | "Ability";
type StatusType = "Normal" | "Rare" | "Epic" | "Legendary" | "Ultra Rare" | "Secret Rare";
type PremiumStatus = "Normal" | "Premium" | "Legendary" | "Mythic";

// ─── Config Maps ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  StatusType,
  { border: string[]; bg: string[]; glow: string; textColor: string; label: string }
> = {
  Normal: {
    border: ["#6b7280", "#9ca3af", "#374151"],
    bg: ["#1c1c2e", "#0d0d1a"],
    glow: "rgba(107,114,128,0.15)",
    textColor: "#9ca3af",
    label: "NORMAL",
  },
  Rare: {
    border: ["#2563eb", "#93c5fd", "#1e40af"],
    bg: ["#0a1629", "#030d1a"],
    glow: "rgba(37,99,235,0.25)",
    textColor: "#93c5fd",
    label: "RARE",
  },
  Epic: {
    border: ["#9333ea", "#d8b4fe", "#6b21a8"],
    bg: ["#150a2e", "#080010"],
    glow: "rgba(147,51,234,0.3)",
    textColor: "#d8b4fe",
    label: "EPIC",
  },
  Legendary: {
    border: ["#d97706", "#fcd34d", "#92400e"],
    bg: ["#1c1000", "#0a0700"],
    glow: "rgba(245,158,11,0.35)",
    textColor: "#fcd34d",
    label: "LEGENDARY",
  },
  "Ultra Rare": {
    border: ["#059669", "#6ee7b7", "#065f46"],
    bg: ["#001a12", "#000d09"],
    glow: "rgba(16,185,129,0.3)",
    textColor: "#6ee7b7",
    label: "ULTRA RARE",
  },
  "Secret Rare": {
    border: ["#cbd5e1", "#ffffff", "#94a3b8"],
    bg: ["#0f0f12", "#000000"],
    glow: "rgba(255,255,255,0.12)",
    textColor: "#f1f5f9",
    label: "SECRET RARE",
  },
};

const PREMIUM_INSET: Record<PremiumStatus, number> = {
  Normal: 10,
  Premium: 16,
  Legendary: 22,
  Mythic: 28,
};

// ─── Helper functions ─────────────────────────────────────────────────────────

function borderGrad(status: StatusType) {
  const [a, b, c] = STATUS_CONFIG[status].border;
  return `linear-gradient(135deg, ${a} 0%, ${b} 50%, ${c} 100%)`;
}

function bgGrad(status: StatusType) {
  const [a, b] = STATUS_CONFIG[status].bg;
  return `linear-gradient(160deg, ${a} 0%, ${b} 100%)`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Shared 400×560 card shell — same size for every type */
function CardShell({
  status,
  premium,
  children,
  outerLayer,
}: {
  status: StatusType;
  premium: PremiumStatus;
  children: React.ReactNode;
  outerLayer?: React.ReactNode;
}) {
  const inset = PREMIUM_INSET[premium];
  const sc = STATUS_CONFIG[status];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 400,
        height: 560,
        background: bgGrad(status),
        boxShadow: `0 0 60px ${sc.glow}, inset 0 0 0 1.5px rgba(255,255,255,0.06)`,
      }}
    >
      {/* Outer casing texture */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 10l10-10H0l10 10z' fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Metallic border frame + inner art container */}
      <div
        className="absolute z-[5]"
        style={{
          inset: inset,
          background: borderGrad(status),
        }}
      >
        <div
          className="absolute inset-[5px] bg-black"
          style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.9)" }}
        >
          {children}
        </div>
      </div>

      {/* Premium overlays */}
      {premium === "Premium" && (
        <div
          className="absolute inset-0 z-[20] pointer-events-none"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 8deg, rgba(255,255,255,0.018) 8.5deg, transparent 9deg)",
          }}
        />
      )}
      {premium === "Legendary" && <LegendaryFrame status={status} />}
      {premium === "Mythic" && <MythicFrame />}

      {outerLayer}

      {/* Fingerprint watermark */}
      <FingerprintOverlay status={status} />
    </div>
  );
}

function LegendaryFrame({ status }: { status: StatusType }) {
  const [a, b, c] = STATUS_CONFIG[status].border;
  const grad = `linear-gradient(135deg, ${a}, ${b}, ${c})`;
  return (
    <div className="absolute inset-0 z-[25] pointer-events-none">
      {/* top bar */}
      <div
        className="absolute top-0 left-[15%] h-[26px]"
        style={{ width: "70%", background: grad, clipPath: "polygon(10% 0,90% 0,100% 100%,0 100%)" }}
      />
      {/* bottom bar */}
      <div
        className="absolute bottom-0 left-[15%] h-[26px]"
        style={{ width: "70%", background: grad, clipPath: "polygon(0 0,100% 0,90% 100%,10% 100%)" }}
      />
      {/* left bar */}
      <div
        className="absolute top-[20%] left-0 w-[13px] h-[60%]"
        style={{ background: grad, clipPath: "polygon(0 0,100% 10%,100% 90%,0 100%)" }}
      />
      {/* right bar */}
      <div
        className="absolute top-[20%] right-0 w-[13px] h-[60%]"
        style={{ background: grad, clipPath: "polygon(0 10%,100% 0,100% 100%,0 90%)" }}
      />
    </div>
  );
}

function MythicFrame() {
  return (
    <div className="absolute inset-0 z-[25] pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 560"
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        <path d="M0,0 L110,0 L55,40 L35,20 L0,74 Z" fill="#08000f" opacity="0.97" />
        <path d="M400,0 L290,0 L345,40 L365,20 L400,74 Z" fill="#08000f" opacity="0.97" />
        <path d="M0,560 L110,560 L55,520 L35,540 L0,486 Z" fill="#08000f" opacity="0.97" />
        <path d="M400,560 L290,560 L345,520 L365,540 L400,486 Z" fill="#08000f" opacity="0.97" />
        <path d="M0,196 L38,224 L19,252 L46,272 L0,324 Z" fill="#08000f" opacity="0.92" />
        <path d="M400,196 L362,224 L381,252 L354,272 L400,324 Z" fill="#08000f" opacity="0.92" />
      </svg>
      <div
        className="absolute inset-[2px] pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(60deg, rgba(192,0,211,0.04), rgba(192,0,211,0.04) 2px, transparent 2px, transparent 10px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

function FingerprintOverlay({ status }: { status: StatusType }) {
  const code = `CF-${status.toUpperCase().replace(/\s/g, "")}-${Math.floor(Date.now() / 1000).toString(16).toUpperCase()}`;
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[60] overflow-hidden"
      style={{ mixBlendMode: "overlay", opacity: 0.07 }}
    >
      <svg width="100%" height="100%">
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          fill="white"
          fontSize="6.5"
          fontFamily="monospace"
          letterSpacing="3"
          transform="rotate(-35, 200, 280)"
        >
          {code} • AUTHENTICATED ASSET • NOT FOR REDISTRIBUTION • {code}
        </text>
        <text x="8" y="554" fill="white" fontSize="5.5" fontFamily="monospace" letterSpacing="2">
          {code}
        </text>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="white"
          strokeWidth="36"
          strokeDasharray="2 14"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}

/** Shared UI chrome: type badge, status badge, number strip, star seal */
function CardChrome({
  cardType,
  status,
  starRating,
  baseNumber,
}: {
  cardType: CardType;
  status: StatusType;
  starRating: number;
  baseNumber: string;
}) {
  const sc = STATUS_CONFIG[status];
  const typeColors: Record<CardType, string> = {
    Character: "#c4b5fd",
    Action: "#fca5a5",
    Item: "#86efac",
    Ability: "#fde047",
  };
  const num = baseNumber.padStart(4, "0");

  return (
    <>
      {/* Type badge — top left */}
      <div
        className="absolute top-4 left-4 z-[50] px-2 py-1 rounded"
        style={{
          background: "rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(4px)",
        }}
      >
        {/* <span
          className="text-[9px] font-black tracking-[0.2em]"
          style={{ color: typeColors[cardType] }}
        >
          {cardType.toUpperCase()}
        </span> */}
      </div>

      {/* Status badge — top right */}
      <div
        className="absolute top-4 right-4 z-[50] px-2 py-1 rounded"
        style={{
          background: "rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(4px)",
        }}
      >
        {/* <span className="text-[9px] font-black tracking-[0.12em]" style={{ color: sc.textColor }}>
          {sc.label}
        </span> */}
      </div>

      {/* Number strip — vertical left edge */}
      <div
        className="absolute z-[50]"
        style={{
          bottom: "22%",
          left: 10,
          transform: "rotate(-90deg)",
          transformOrigin: "0% 100%",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.78)",
            border: "2px solid #1a1a1a",
            padding: "4px 14px",
            clipPath: "polygon(8% 0,100% 0,92% 100%,0 100%)",
          }}
        >
          {/* <span className="font-mono font-black text-white tracking-[0.3em] text-[11px]">
            NO.{num}
          </span> */}
        </div>
      </div>

      {/* Star seal — bottom right */}
      <div className="absolute bottom-5 right-5 z-[50]">
        <div
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 76,
            height: 76,
            background: borderGrad(status),
          }}
        >
          <div
            className="absolute inset-[3px] rounded-full flex flex-col items-center justify-center"
            style={{
              background: "#050507",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.9)",
            }}
          >
            <span
              className="font-mono font-black leading-none text-[26px]"
              style={{ color: sc.textColor }}
            >
              {starRating}
            </span>
            <span className="text-[7px] font-bold tracking-[0.2em] text-gray-600 mt-0.5">
              RATING
            </span>
            <div className="flex gap-px mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className="w-2.5 h-2.5"
                  fill={i <= starRating ? "#fbbf24" : "#1f2937"}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Status-based art overlays ────────────────────────────────────────────────

function StatusOverlay({ status }: { status: StatusType }) {
  if (status === "Legendary")
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(251,191,36,0.04) 8px,rgba(251,191,36,0.04) 9px),repeating-linear-gradient(-45deg,transparent,transparent 8px,rgba(251,191,36,0.04) 8px,rgba(251,191,36,0.04) 9px)",
        }}
      />
    );
  if (status === "Epic")
    return (
      <div
        className="absolute inset-0 pointer-events-none animate-pulse"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%,rgba(147,51,234,0.18),transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(99,102,241,0.18),transparent 60%)",
        }}
      />
    );
  if (status === "Ultra Rare")
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(45deg,rgba(5,150,105,0.15),rgba(6,182,212,0.15),rgba(5,150,105,0.15))",
        }}
      />
    );
  if (status === "Secret Rare")
    return (
      <>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(90deg,transparent,transparent 3px,rgba(255,255,255,0.025) 3px,rgba(255,255,255,0.025) 4px)",
            mixBlendMode: "overlay",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.22),transparent 65%)",
          }}
        />
      </>
    );
  if (status === "Rare")
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg,rgba(37,99,235,0.12),rgba(147,197,253,0.12),rgba(37,99,235,0.12))",
        }}
      />
    );
  return null;
}

// ─── Card Type Models ─────────────────────────────────────────────────────────

/**
 * CHARACTER — classic portrait with dual side notches.
 * Clip shape on the inner art frame, heavy vignette at bottom for text area feel.
 */
function CharacterCard({
  image,
  status,
  premium,
  cardType,
  starRating,
  baseNumber,
  imageScale,
  imageX,
  imageY,
  imageFit = "cover",
}: CardModelProps) {
  const sc = STATUS_CONFIG[status];
  const inset = PREMIUM_INSET[premium];

  return (
    <CardShell status={status} premium={premium}>
      {/* Art */}
      {image ? (
        <div className="w-full h-full overflow-hidden">
          <div className={`w-full h-full ${imageFit === "contain" ? "bg-contain bg-no-repeat" : imageFit === "stretch" ? "bg-[length:100%_100%] bg-no-repeat" : "bg-cover"} bg-center transition-transform duration-100 ease-out`} style={{ backgroundImage: `url(${image})`, transform: `scale(${imageScale || 1}) translateX(${imageX || 0}px) translateY(${imageY || 0}px)` }} />
        </div>
      ) : (
        <ArtPlaceholder status={status} />
      )}
      <StatusOverlay status={status} />

      {/* Bottom gradient panel */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[45%] pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${sc.bg[0]} 40%, transparent 100%)`,
        }}
      />

      {/* Decorative side notch accents */}
      <div
        className="absolute left-0 top-[44%] w-[6px] h-[12%] pointer-events-none"
        style={{ background: borderGrad(status) }}
      />
      <div
        className="absolute right-0 top-[44%] w-[6px] h-[12%] pointer-events-none"
        style={{ background: borderGrad(status) }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,0.75) 100%)",
        }}
      />

      <CardChrome
        cardType={cardType}
        status={status}
        starRating={starRating}
        baseNumber={baseNumber}
      />
    </CardShell>
  );
}

/**
 * ACTION — full-art portrait with a bold chevron divider and a bottom stats panel.
 * Art fills top ~62%, a thick angled metallic bar cuts across, bottom panel shows
 * action-type iconography and stat bars. Clean and readable at 400×560.
 */
function ActionCard({
  image,
  status,
  premium,
  cardType,
  starRating,
  baseNumber,
  imageScale,
  imageX,
  imageY,
  imageFit = "cover",
}: CardModelProps) {
  const sc = STATUS_CONFIG[status];
  const [c1, c2, c3] = STATUS_CONFIG[status].border;

  // divider sits at 60% of card height (inside the inset frame ~530px tall)
  const dividerY = 62; // percent

  return (
    <CardShell status={status} premium={premium}>
      {/* ── Full art layer, no clipping — sits behind everything ── */}
      <div className="absolute inset-0 overflow-hidden">
        {image ? (
          <div className={`w-full h-full ${imageFit === "contain" ? "bg-contain bg-no-repeat" : imageFit === "stretch" ? "bg-[length:100%_100%] bg-no-repeat" : "bg-cover"} bg-top transition-transform duration-100 ease-out`} style={{ backgroundImage: `url(${image})`, transform: `scale(${imageScale || 1}) translateX(${imageX || 0}px) translateY(${imageY || 0}px)` }} />
        ) : (
          <ArtPlaceholder status={status} />
        )}
        <StatusOverlay status={status} />
      </div>

      {/* ── Bottom dark panel that covers art from divider down ── */}
      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none z-[8]"
        style={{
          top: `${dividerY}%`,
          background: `linear-gradient(175deg, ${sc.bg[0]}f5, ${sc.bg[1]})`,
        }}
      />

      {/* ── Vignette on the art area only ── */}
      <div
        className="absolute left-0 right-0 top-0 pointer-events-none z-[7]"
        style={{
          height: `${dividerY + 6}%`,
          background:
            "radial-gradient(ellipse at center top, transparent 40%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* ── Chevron divider bar (SVG so we get a perfect sharp chevron) ── */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-[15]"
        style={{ top: `calc(${dividerY}% - 22px)`, height: 44 }}
      >
        <svg width="100%" height="44" viewBox="0 0 390 44" preserveAspectRatio="none">
          {/* shadow strip behind */}
          <polygon points="0,12 390,0 390,44 0,44" fill={sc.bg[1]} opacity="0.9" />
          {/* main metallic chevron */}
          <polygon
            points="0,14 390,2 390,20 0,32"
            fill="none"
            stroke={`url(#actGrad)`}
            strokeWidth="10"
          />
          {/* thin highlight line */}
          <polygon points="0,10 390,-2 390,4 0,18" fill={c2} opacity="0.35" />
          <defs>
            <linearGradient id="actGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={c3} />
              <stop offset="50%" stopColor={c2} />
              <stop offset="100%" stopColor={c3} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Bottom panel content ── */}
      <div
        className="absolute left-0 right-0 bottom-0 z-[20] pointer-events-none flex flex-col items-center justify-center gap-3"
        style={{ top: `${dividerY + 6}%`, padding: "10px 20px 16px" }}
      >
        {/* Action type icon cluster */}
        <svg width="100%" height="56" viewBox="0 0 360 56">
          {/* Three lightning / energy arrows */}
          {[-100, 0, 100].map((dx, i) => (
            <g key={i} transform={`translate(${180 + dx}, 28)`} opacity={i === 1 ? 1 : 0.4}>
              <polygon
                points="0,-18 10,-4 4,-4 4,18 -4,18 -4,-4 -10,-4"
                fill={i === 1 ? c2 : c1}
              />
            </g>
          ))}
          {/* Label */}
          <text
            x="180"
            y="52"
            textAnchor="middle"
            fill={sc.textColor}
            fontSize="9"
            fontFamily="monospace"
            fontWeight="900"
            letterSpacing="4"
            opacity="0.6"
          >
            ACTION TYPE
          </text>
        </svg>

        {/* Stat bars */}
        {["PWR", "SPD", "DEF"].map((label, i) => {
          const val = [82, 67, 45][i];
          return (
            <div key={label} className="w-full flex items-center gap-2">
              <span
                className="font-mono font-black text-[9px] tracking-[0.15em] w-8 shrink-0"
                style={{ color: sc.textColor, opacity: 0.5 }}
              >
                {label}
              </span>
              <div
                className="flex-1 rounded-full overflow-hidden"
                style={{ height: 4, background: "rgba(255,255,255,0.07)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${val}%`,
                    background: `linear-gradient(to right, ${c3}, ${c2})`,
                    opacity: 0.85,
                  }}
                />
              </div>
              <span
                className="font-mono text-[9px] w-6 text-right shrink-0"
                style={{ color: sc.textColor, opacity: 0.4 }}
              >
                {val}
              </span>
            </div>
          );
        })}
      </div>

      <CardChrome
        cardType={cardType}
        status={status}
        starRating={starRating}
        baseNumber={baseNumber}
      />
    </CardShell>
  );
}

/**
 * ITEM — relic/inventory card with a true octagonal art window, ornate corner
 * inlays, side attribute slots, and a bottom relic-name panel.
 * The art is SVG-clipped to a clean octagon; the rest is structured decoration.
 */
function ItemCard({
  image,
  status,
  premium,
  cardType,
  starRating,
  baseNumber,
  imageScale,
  imageX,
  imageY,
  imageFit = "cover",
}: CardModelProps) {
  const sc = STATUS_CONFIG[status];
  const [c1, c2, c3] = STATUS_CONFIG[status].border;

  // Octagon clip path for the art window (within the inner frame ~380×540)
  // Centered, 260×260, with 38px cut corners
  const OCT = "polygon(38px 0%, calc(100% - 38px) 0%, 100% 38px, 100% calc(100% - 38px), calc(100% - 38px) 100%, 38px 100%, 0% calc(100% - 38px), 0% 38px)";

  return (
    <CardShell status={status} premium={premium}>
      {/* ── Dark patterned background ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, ${sc.bg[0]}, ${sc.bg[1]})`,
        }}
      />

      {/* Subtle grid lines on the background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(${c2}55 1px, transparent 1px), linear-gradient(90deg, ${c2}55 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Octagonal art window — centered, takes up most of the card ── */}
      <div
        className="absolute z-[8] overflow-hidden"
        style={{
          top: "7%",
          left: "8%",
          right: "8%",
          bottom: "28%",
          clipPath: OCT,
          outline: "none",
        }}
      >
        {image ? (
          <div className="w-full h-full overflow-hidden">
            <div className={`w-full h-full ${imageFit === "contain" ? "bg-contain bg-no-repeat" : imageFit === "stretch" ? "bg-[length:100%_100%] bg-no-repeat" : "bg-cover"} bg-center transition-transform duration-100 ease-out`} style={{ backgroundImage: `url(${image})`, transform: `scale(${imageScale || 1}) translateX(${imageX || 0}px) translateY(${imageY || 0}px)` }} />
          </div>
        ) : (
          <ArtPlaceholder status={status} />
        )}
        <StatusOverlay status={status} />
        {/* Inner vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)",
          }}
        />
      </div>

      {/* ── Octagonal art window border (SVG overlay) ── */}
      <div className="absolute z-[12] pointer-events-none" style={{ top: "7%", left: "8%", right: "8%", bottom: "28%" }}>
        <svg width="100%" height="100%" viewBox="0 0 304 366">
          <polygon
            points="38,0 266,0 304,38 304,328 266,366 38,366 0,328 0,38"
            fill="none"
            stroke={`url(#itemBorderGrad)`}
            strokeWidth="2.5"
            opacity="0.9"
          />
          {/* Inner glow ring */}
          <polygon
            points="44,6 260,6 298,44 298,322 260,360 44,360 6,322 6,44"
            fill="none"
            stroke={c2}
            strokeWidth="0.5"
            opacity="0.25"
          />
          <defs>
            <linearGradient id="itemBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c3} />
              <stop offset="50%" stopColor={c2} />
              <stop offset="100%" stopColor={c3} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── 4 Corner ornaments ── */}
      {[
        { top: "6%",    left:  "6%",  rotate: "0deg" },
        { top: "6%",    right: "6%",  rotate: "90deg" },
        { bottom: "27%", left: "6%",  rotate: "270deg" },
        { bottom: "27%", right: "6%", rotate: "180deg" },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute z-[18] pointer-events-none"
          style={{ ...pos, width: 22, height: 22 }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            style={{ transform: `rotate(${pos.rotate})` }}
          >
            <path d="M2,2 L20,2 L20,8 M2,2 L2,20 L8,20" fill="none" stroke={c2} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <circle cx="2" cy="2" r="2" fill={c2} opacity="0.7" />
          </svg>
        </div>
      ))}

      {/* ── Bottom relic panel ── */}
      <div
        className="absolute left-0 right-0 bottom-0 z-[16]"
        style={{ height: "27%", padding: "10px 16px 12px" }}
      >
        {/* Top divider line */}
        <div
          className="w-full mb-3"
          style={{ height: 1, background: `linear-gradient(to right, transparent, ${c2}55, transparent)` }}
        />

        {/* 3 attribute pips */}
        <div className="flex justify-between items-center px-1 mb-3">
          {[
            { icon: "⬡", label: "ATK", val: "74" },
            { icon: "◈", label: "MAG", val: "91" },
            { icon: "⬢", label: "RES", val: "58" },
          ].map(({ icon, label, val }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span style={{ color: c2, fontSize: 14, opacity: 0.7, lineHeight: 1 }}>{icon}</span>
              <span className="font-mono font-black text-[13px] leading-none" style={{ color: sc.textColor }}>
                {val}
              </span>
              <span className="font-mono text-[8px] tracking-[0.2em]" style={{ color: sc.textColor, opacity: 0.4 }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom divider */}
        <div
          className="w-full"
          style={{ height: 1, background: `linear-gradient(to right, transparent, ${c2}30, transparent)` }}
        />
      </div>

      <CardChrome
        cardType={cardType}
        status={status}
        starRating={starRating}
        baseNumber={baseNumber}
      />
    </CardShell>
  );
}

/**
 * ABILITY — energy/spell card with radial burst art and rune circle overlay.
 * Art is circular-masked; outer area is a dark patterned field.
 */
function AbilityCard({
  image,
  status,
  premium,
  cardType,
  starRating,
  baseNumber,
  imageScale,
  imageX,
  imageY,
  imageFit = "cover",
}: CardModelProps) {
  const sc = STATUS_CONFIG[status];

  return (
    <CardShell status={status} premium={premium}>
      {/* Full background */}
      {image ? (
        <div className="w-full h-full overflow-hidden">
          <div className={`w-full h-full ${imageFit === "contain" ? "bg-contain bg-no-repeat" : imageFit === "stretch" ? "bg-[length:100%_100%] bg-no-repeat" : "bg-cover"} bg-center transition-transform duration-100 ease-out`} style={{ backgroundImage: `url(${image})`, transform: `scale(${imageScale || 1}) translateX(${imageX || 0}px) translateY(${imageY || 0}px)` }} />
        </div>
      ) : (
        <ArtPlaceholder status={status} />
      )}
      <StatusOverlay status={status} />

      {/* Radial vignette leaving center bright */}
      <div
        className="absolute inset-0 pointer-events-none z-[7]"
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 50% 42%,transparent 0%,rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* SVG rune/energy circles */}
      <div className="absolute inset-0 pointer-events-none z-[10] flex items-center justify-center">
        <svg
          width="340"
          height="340"
          viewBox="0 0 340 340"
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-54%)" }}
        >
          {/* Outer ring */}
          <circle
            cx="170"
            cy="170"
            r="155"
            fill="none"
            stroke={sc.textColor}
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.2"
          />
          {/* Mid ring */}
          <circle
            cx="170"
            cy="170"
            r="125"
            fill="none"
            stroke={sc.textColor}
            strokeWidth="0.5"
            opacity="0.15"
          />
          {/* Inner ring */}
          <circle
            cx="170"
            cy="170"
            r="90"
            fill="none"
            stroke={sc.textColor}
            strokeWidth="1.5"
            strokeDasharray="12 4"
            opacity="0.25"
          />
          {/* 8 radial spokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 170 + Math.cos(rad) * 92;
            const y1 = 170 + Math.sin(rad) * 92;
            const x2 = 170 + Math.cos(rad) * 153;
            const y2 = 170 + Math.sin(rad) * 153;
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={sc.textColor}
                strokeWidth="0.5"
                opacity="0.2"
              />
            );
          })}
          {/* 8 outer gems */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const cx = 170 + Math.cos(rad) * 155;
            const cy = 170 + Math.sin(rad) * 155;
            return (
              <polygon
                key={deg}
                points={`${cx},${cy - 6} ${cx + 5},${cy} ${cx},${cy + 6} ${cx - 5},${cy}`}
                fill={sc.textColor}
                opacity="0.4"
              />
            );
          })}
        </svg>
      </div>

      {/* Bottom energy bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[28%] pointer-events-none z-[8]"
        style={{
          background: `linear-gradient(to top, ${sc.bg[0]}f0 0%, transparent 100%)`,
        }}
      />

      <CardChrome
        cardType={cardType}
        status={status}
        starRating={starRating}
        baseNumber={baseNumber}
      />
    </CardShell>
  );
}

// ─── Shared Art Placeholder ───────────────────────────────────────────────────

function ArtPlaceholder({ status }: { status: StatusType }) {
  const sc = STATUS_CONFIG[status];
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ background: bgGrad(status) }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" opacity={0.22}>
        <polygon
          points="32,4 56,18 56,46 32,60 8,46 8,18"
          fill={sc.border[1]}
        />
        <polygon
          points="32,4 56,18 32,32"
          fill={sc.border[0]}
          opacity={0.7}
        />
      </svg>
      <span
        className="text-[10px] font-black tracking-[0.3em] opacity-40"
        style={{ color: sc.textColor }}
      >
        ARTWORK
      </span>
    </div>
  );
}

// ─── Card model props type ─────────────────────────────────────────────────────

interface CardModelProps {
  image: string | null;
  status: StatusType;
  premium: PremiumStatus;
  cardType: CardType;
  starRating: number;
  baseNumber: string;
  imageScale?: number;
  imageX?: number;
  imageY?: number;
  imageFit?: "cover" | "contain" | "stretch";
}

// ─── Selector components ──────────────────────────────────────────────────────

function PillGroup<T extends string>({
  options,
  value,
  onChange,
  colorMap,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  colorMap: Record<string, { bg: string; border: string; text: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value;
        const colors = colorMap[opt] ?? {
          bg: "#111",
          border: "#333",
          text: "#666",
        };
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.06em] transition-all border"
            style={
              active
                ? { background: colors.bg, borderColor: colors.border, color: colors.text }
                : { background: "#111", borderColor: "#222", color: "#555" }
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CardGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>("Normal");
  const [cardType, setCardType] = useState<CardType>("Character");
  const [starRating, setStarRating] = useState(1);
  const [baseNumber, setBaseNumber] = useState("001");
  const [statusType, setStatusType] = useState<StatusType>("Normal");
  const [imageScale, setImageScale] = useState(1);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [imageFit, setImageFit] = useState<"cover" | "contain" | "stretch">("cover");
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Please use an image under 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    if (!image) {
      toast.error("Please upload an image first.");
      return;
    }
    setIsGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 4, // Optimized pixelRatio for ultra-high quality without memory crash in production
        cacheBust: true,
        style: { transform: "none" },
      });
      const link = document.createElement("a");
      link.download = `card-${baseNumber.padStart(4, "0")}-${statusType.replace(/\s/g, "-")}-hq.png`;
      link.href = dataUrl;
      link.click();
      toast.success("High-Quality Card downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const cardProps: CardModelProps = {
    image,
    status: statusType,
    premium: premiumStatus,
    cardType,
    starRating,
    baseNumber,
    imageScale,
    imageX,
    imageY,
    imageFit,
  };

  const CardModel =
    cardType === "Character"
      ? CharacterCard
      : cardType === "Action"
      ? ActionCard
      : cardType === "Item"
      ? ItemCard
      : AbilityCard;

  // Pill color maps
  const typePills: Record<string, { bg: string; border: string; text: string }> = {
    Character: { bg: "#1a1040", border: "#7c3aed", text: "#c4b5fd" },
    Action:    { bg: "#1c0a0a", border: "#dc2626", text: "#fca5a5" },
    Item:      { bg: "#0a1c12", border: "#16a34a", text: "#86efac" },
    Ability:   { bg: "#1a1200", border: "#ca8a04", text: "#fde047" },
  };
  const statusPills: Record<string, { bg: string; border: string; text: string }> = {
    Normal:       { bg: "#1a1a1a", border: "#6b7280", text: "#9ca3af" },
    Rare:         { bg: "#0c1829", border: "#2563eb", text: "#93c5fd" },
    Epic:         { bg: "#150a2e", border: "#9333ea", text: "#d8b4fe" },
    Legendary:    { bg: "#1c1000", border: "#d97706", text: "#fcd34d" },
    "Ultra Rare": { bg: "#001a12", border: "#059669", text: "#6ee7b7" },
    "Secret Rare":{ bg: "#0d0d0d", border: "#cbd5e1", text: "#f1f5f9" },
  };
  const premiumPills: Record<string, { bg: string; border: string; text: string }> = {
    Normal:    { bg: "#111",    border: "#333",    text: "#777" },
    Premium:   { bg: "#0e1a2e",border: "#3b82f6", text: "#93c5fd" },
    Legendary: { bg: "#1c1000",border: "#f59e0b", text: "#fde68a" },
    Mythic:    { bg: "#1a001a",border: "#c026d3", text: "#f0abfc" },
  };

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "#09090b", fontFamily: "system-ui, sans-serif" }}
    >
      <div className="grid lg:grid-cols-[360px_1fr] min-h-screen">
        {/* ── SIDEBAR ── */}
        <aside
          className="p-6 overflow-y-auto"
          style={{ background: "#111113", borderRight: "1px solid #1c1c1f" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <polygon points="16,2 28,10 28,22 16,30 4,22 4,10" fill="#7c3aed" opacity="0.9" />
              <polygon points="16,2 28,10 16,16" fill="#a78bfa" opacity="0.7" />
              <polygon points="4,10 16,16 16,30 4,22" fill="#5b21b6" opacity="0.8" />
              <polygon points="28,10 28,22 16,16" fill="#6d28d9" opacity="0.6" />
            </svg>
            <div>
              <div className="text-[13px] font-black tracking-[0.12em] uppercase text-white">
                CardForge
              </div>
              <div className="text-[10px] text-gray-600 tracking-[0.05em]">Asset Generator</div>
            </div>
          </div>

          {/* Upload */}
          <label className="text-[10px] font-bold tracking-[0.15em] text-gray-600 uppercase block mb-2">
            Artwork
          </label>
          <label
            className="relative flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-colors"
            style={{
              height: 100,
              border: `1.5px dashed ${image ? "#7c3aed55" : "#222"}`,
              background: image ? "#1a102888" : "#0d0d0f",
            }}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload size={20} className={image ? "text-purple-400" : "text-gray-700"} />
            <span className="text-[12px]" style={{ color: image ? "#9f7aea" : "#555" }}>
              {image ? "✓ Image loaded" : "Click or drop image"}
            </span>
          </label>

          {image && (
            <div className="mt-4 p-4 bg-[#151518] rounded-xl border border-[#222]">
              <label className="text-[10px] font-bold tracking-[0.15em] text-gray-600 uppercase block mb-3">
                Image Adjustments
              </label>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-2 font-mono">
                    <span>Zoom</span>
                    <span>{Math.round(imageScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={imageScale}
                    onChange={(e) => setImageScale(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-2 font-mono">
                    <span>Horizontal Pos</span>
                    <span>{imageX > 0 ? `+${imageX}` : imageX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="2"
                    value={imageX}
                    onChange={(e) => setImageX(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-2 font-mono">
                    <span>Vertical Pos</span>
                    <span>{imageY > 0 ? `+${imageY}` : imageY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="2"
                    value={imageY}
                    onChange={(e) => setImageY(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-2 font-mono">
                    <span>Fit Mode</span>
                  </div>
                  <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                    <button 
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-colors ${imageFit === "cover" ? "bg-[#7c3aed] text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
                      onClick={() => setImageFit("cover")}
                    >Fill (Crop)</button>
                    <button 
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-colors ${imageFit === "contain" ? "bg-[#7c3aed] text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
                      onClick={() => setImageFit("contain")}
                    >Fit (No Crop)</button>
                    <button 
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-colors ${imageFit === "stretch" ? "bg-[#7c3aed] text-white shadow-sm" : "text-gray-400 hover:text-white"}`}
                      onClick={() => setImageFit("stretch")}
                    >Stretch</button>
                  </div>
                </div>
                
                {(imageScale !== 1 || imageX !== 0 || imageY !== 0 || imageFit !== "cover") && (
                  <button 
                    onClick={() => { setImageScale(1); setImageX(0); setImageY(0); setImageFit("cover"); }}
                    className="text-[10px] uppercase font-bold text-purple-400 hover:text-purple-300 transition-colors w-full text-center mt-2"
                  >
                    Reset Adjustments
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Card Type */}
          <label className="text-[10px] font-bold tracking-[0.15em] text-gray-600 uppercase block mt-6 mb-2">
            Card Type
          </label>
          <PillGroup
            options={["Character", "Action", "Item", "Ability"] as CardType[]}
            value={cardType}
            onChange={setCardType}
            colorMap={typePills}
          />

          {/* Status */}
          <label className="text-[10px] font-bold tracking-[0.15em] text-gray-600 uppercase block mt-5 mb-2">
            Rarity Status
          </label>
          <PillGroup
            options={["Normal", "Rare", "Epic", "Legendary", "Ultra Rare", "Secret Rare"] as StatusType[]}
            value={statusType}
            onChange={setStatusType}
            colorMap={statusPills}
          />

          {/* Premium */}
          <label className="text-[10px] font-bold tracking-[0.15em] text-gray-600 uppercase block mt-5 mb-2">
            Premium Tier
          </label>
          <PillGroup
            options={["Normal", "Premium", "Legendary", "Mythic"] as PremiumStatus[]}
            value={premiumStatus}
            onChange={setPremiumStatus}
            colorMap={premiumPills}
          />

          {/* Stars */}
          <label className="text-[10px] font-bold tracking-[0.15em] text-gray-600 uppercase block mt-5 mb-2">
            Star Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setStarRating(s)}
                className="w-9 h-9 rounded-lg text-base border transition-all"
                style={
                  s <= starRating
                    ? { background: "#1c1000", borderColor: "#b45309", color: "#fbbf24" }
                    : { background: "#111", borderColor: "#222", color: "#333" }
                }
              >
                ★
              </button>
            ))}
          </div>

          {/* Number */}
          <label className="text-[10px] font-bold tracking-[0.15em] text-gray-600 uppercase block mt-5 mb-2">
            Card Number
          </label>
          <input
            type="text"
            value={baseNumber}
            onChange={(e) => setBaseNumber(e.target.value)}
            maxLength={6}
            placeholder="e.g. 150"
            className="w-full rounded-lg px-3 py-2.5 text-[13px] font-mono outline-none transition-colors"
            style={{
              background: "#0d0d0f",
              border: "1.5px solid #222",
              color: "#d4d4d8",
            }}
          />

          <div className="h-px bg-[#1a1a1f] my-6" />

          <p className="text-[10px] text-gray-700 leading-relaxed mb-6">
            Each export carries a unique invisible fingerprint encoding the card number, type,
            status, and generation timestamp — making every asset cryptographically distinct.
          </p>

          <button
            onClick={handleDownload}
            disabled={isGenerating || !image}
            className="w-full py-3.5 rounded-xl text-[12px] font-black tracking-[0.1em] uppercase flex items-center justify-center gap-2 transition-all"
            style={
              image
                ? {
                    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    color: "#fff",
                    boxShadow: "0 0 24px #7c3aed33",
                  }
                : { background: "#1a1a1a", color: "#333", cursor: "not-allowed" }
            }
          >
            {isGenerating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isGenerating ? "Processing…" : "Generate & Download"}
          </button>
        </aside>

        {/* ── PREVIEW ── */}
        <main
          className="flex flex-col items-center justify-center relative overflow-hidden"
          style={{ background: "#060608", minHeight: "100vh" }}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #1f1f24 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              opacity: 0.6,
            }}
          />

          {/* Ambient glow */}
          <div
            className="absolute pointer-events-none transition-all duration-700"
            style={{
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${STATUS_CONFIG[statusType].glow}, transparent 70%)`,
            }}
          />

          <span
            className="absolute top-5 left-6 text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: "#2a2a30" }}
          >
            Live Preview
          </span>

          {/* Card — fixed 400×560 regardless of type */}
          <div
            ref={cardRef}
            className="relative"
            style={{
              filter: "drop-shadow(0 32px 60px rgba(0,0,0,0.95))",
            }}
          >
            {/* SVG filter for physical texture (anti-screenshot effect) */}
            <svg style={{ display: "none" }}>
              <defs>
                <filter id="physical-texture">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.85"
                    numOctaves="3"
                    stitchTiles="stitch"
                    result="noise"
                  />
                  <feColorMatrix
                    type="matrix"
                    values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.12 0"
                    in="noise"
                    result="coloredNoise"
                  />
                  <feBlend mode="multiply" in="SourceGraphic" in2="coloredNoise" />
                </filter>
              </defs>
            </svg>

            <div style={{ filter: "url(#physical-texture)" }}>
              <CardModel {...cardProps} />
            </div>
          </div>

          {/* Bottom label row */}
          {/* <div className="flex items-center gap-2 mt-6">
            <span
              className="text-[10px] font-black tracking-[0.18em] uppercase px-3 py-1 rounded-full border"
              style={{
                ...typePills[cardType],
                borderColor: typePills[cardType]?.border,
                background: typePills[cardType]?.bg,
                color: typePills[cardType]?.text,
              }}
            >
              {cardType}
            </span>
            <span
              className="text-[10px] font-black tracking-[0.12em] uppercase px-3 py-1 rounded-full border"
              style={{
                background: statusPills[statusType]?.bg,
                borderColor: statusPills[statusType]?.border,
                color: statusPills[statusType]?.text,
              }}
            >
              {statusType}
            </span>
            {premiumStatus !== "Normal" && (
              <span
                className="text-[10px] font-black tracking-[0.12em] uppercase px-3 py-1 rounded-full border"
                style={{
                  background: premiumPills[premiumStatus]?.bg,
                  borderColor: premiumPills[premiumStatus]?.border,
                  color: premiumPills[premiumStatus]?.text,
                }}
              >
                {premiumStatus}
              </span>
            )}
          </div> */}
        </main>
      </div>
    </div>
  );
}


// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { toPng } from "html-to-image";
// import { Download, Upload, Loader2, Sparkles } from "lucide-react";
// import { toast } from "sonner";
// import { useAuthStore } from "@/lib/store/authStore";

// export default function CardGenerator() {
//   const router = useRouter();
//   const { user } = useAuthStore();
//   const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

//   // Card State
//   const [image, setImage] = useState<string | null>(null);
//   const [premiumStatus, setPremiumStatus] = useState("Normal");
//   const [cardType, setCardType] = useState("Character");
//   const [starRating, setStarRating] = useState("1");
//   const [baseNumber, setBaseNumber] = useState("001");
//   const [statusType, setStatusType] = useState("Normal");
  
//   const [isGenerating, setIsGenerating] = useState(false);
//   const cardRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     // Check auth on mount
//     if (user === undefined) return; // Still loading auth state
    
//     if (user?.role === "superAdmin") {
//       setIsAuthorized(true);
//     } else {
//       setIsAuthorized(false);
//       toast.error("Forbidden: Super Admin access required");
//       router.push("/admin");
//     }
//   }, [user, router]);

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 10 * 1024 * 1024) {
//         toast.error("Image too large. Please use an image under 10MB.");
//         return;
//       }
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImage(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleDownload = async () => {
//     if (!cardRef.current) return;
//     if (!image) {
//       toast.error("Please upload an image first.");
//       return;
//     }

//     setIsGenerating(true);
//     try {
//       // Small delay to ensure all CSS animations/fonts are rendered
//       await new Promise(r => setTimeout(r, 300));
      
//       const dataUrl = await toPng(cardRef.current, {
//         quality: 1,
//         pixelRatio: 2, // 2x export quality
//         cacheBust: true,
//         style: {
//           transform: 'none', // Prevent skewing during capture
//         }
//       });

//       const link = document.createElement('a');
//       link.download = `card-${baseNumber}-${statusType}.png`;
//       link.href = dataUrl;
//       link.click();
//       toast.success("Card downloaded successfully!");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to generate image.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   if (isAuthorized === null) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;
//   if (isAuthorized === false) return null;

//   // Render logic for effects
//   // Render logic for effects
//   const getBorderGradient = () => {
//     switch (statusType) {
//       case "Normal": return "linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #475569 100%)";
//       case "Rare": return "linear-gradient(135deg, #60a5fa 0%, #bfdbfe 50%, #2563eb 100%)";
//       case "Epic": return "linear-gradient(135deg, #c084fc 0%, #e9d5ff 50%, #7e22ce 100%)";
//       case "Legendary": return "linear-gradient(135deg, #fbbf24 0%, #fef08a 50%, #b45309 100%)"; // Pure solid gold tones
//       case "Ultra Rare": return "linear-gradient(135deg, #34d399 0%, #a7f3d0 50%, #059669 100%)"; 
//       case "Secret Rare": return "linear-gradient(135deg, #e2e8f0 0%, #ffffff 50%, #94a3b8 100%)"; // Diamond/Platinum
//       default: return "linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #475569 100%)";
//     }
//   };

//   const getStatusBaseGradient = () => {
//     switch (statusType) {
//       case "Normal": return "linear-gradient(to bottom right, #334155, #0f172a)";
//       case "Rare": return "linear-gradient(to bottom right, #1e3a8a, #020617)";
//       case "Epic": return "linear-gradient(to bottom right, #4c1d95, #170229)";
//       case "Legendary": return "linear-gradient(to bottom right, #7f1d1d, #2a0a0a)"; // Deep rich crimson
//       case "Ultra Rare": return "linear-gradient(to bottom right, #064e3b, #011c14)";
//       case "Secret Rare": return "radial-gradient(circle at 50% 0%, #1f2937 0%, #000000 100%)"; // Obsidian black
//       default: return "linear-gradient(to bottom right, #334155, #0f172a)";
//     }
//   };

//   const getCardShape = () => {
//     switch (cardType) {
//       case "Character": 
//         // 16-point complex notched layout
//         return "polygon(5% 0, 95% 0, 100% 5%, 100% 45%, 95% 50%, 100% 55%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 55%, 5% 50%, 0 45%, 0 5%)";
//       case "Action": 
//         // Aggressive slanted layout
//         return "polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)";
//       case "Item": 
//         // Symmetrical Octagon layout
//         return "polygon(0 10%, 10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%)";
//       case "Ability":
//         // Diamond-notched top/bottom
//         return "polygon(50% 0%, 100% 10%, 100% 90%, 50% 100%, 0% 90%, 0% 10%)";
//       default:
//         return "polygon(5% 0, 95% 0, 100% 5%, 100% 45%, 95% 50%, 100% 55%, 100% 95%, 95% 100%, 5% 100%, 0 95%, 0 55%, 5% 50%, 0 45%, 0 5%)";
//     }
//   };

//   const getPremiumInset = () => {
//     switch (premiumStatus) {
//       case "Normal": return "10px";
//       case "Premium": return "18px";
//       case "Legendary": return "26px";
//       case "Mythic": return "32px";
//       default: return "10px";
//     }
//   };

//   return (
//     <div className="p-8 font-parkinsans max-w-7xl mx-auto text-white">
//       <div className="mb-8">
//         <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider flex items-center gap-3">
//           <Sparkles className="text-primary" /> Card Banner Generator
//         </h1>
//         <p className="text-gray-400 mt-1">Design and export high-resolution collectible card assets. No database connection required.</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
//         {/* Left Side: Controls */}
//         <div className="lg:col-span-5 space-y-6 bg-gray-950 p-6 rounded-3xl border border-gray-800">
//           <h2 className="text-xl font-bold border-b border-gray-800 pb-4">Card Configuration</h2>
          
//           <div className="space-y-2">
//             <label className="text-sm text-gray-400 font-medium">Main Artwork</label>
//             <div className="relative group cursor-pointer border-2 border-dashed border-gray-700 rounded-xl hover:border-primary transition-colors bg-gray-900/50 h-32 flex flex-col items-center justify-center">
//               <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
//               <Upload className="text-gray-500 group-hover:text-primary mb-2 transition-colors" />
//               <span className="text-sm text-gray-400 font-medium group-hover:text-white transition-colors">Click or drag image here</span>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <label className="text-sm text-gray-400 font-medium">Card Type (Layout)</label>
//               <select value={cardType} onChange={e => setCardType(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:border-primary outline-none text-white transition-colors">
//                 <option>Character</option>
//                 <option>Action</option>
//                 <option>Item</option>
//                 <option>Ability</option>
//               </select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm text-gray-400 font-medium">Premium Status</label>
//               <select value={premiumStatus} onChange={e => setPremiumStatus(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:border-primary outline-none text-white transition-colors">
//                 <option>Normal</option>
//                 <option>Premium</option>
//                 <option>Legendary</option>
//                 <option>Mythic</option>
//               </select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm text-gray-400 font-medium">Status Type</label>
//               <select value={statusType} onChange={e => setStatusType(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:border-primary outline-none text-white transition-colors">
//                 <option>Normal</option>
//                 <option>Rare</option>
//                 <option>Epic</option>
//                 <option>Legendary</option>
//                 <option>Ultra Rare</option>
//                 <option>Secret Rare</option>
//               </select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm text-gray-400 font-medium">Star Rating</label>
//               <select value={starRating} onChange={e => setStarRating(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:border-primary outline-none text-white transition-colors">
//                 <option value="1">1 Star</option>
//                 <option value="2">2 Star</option>
//                 <option value="3">3 Star</option>
//                 <option value="4">4 Star</option>
//                 <option value="5">5 Star</option>
//               </select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm text-gray-400 font-medium">Base Number</label>
//               <input 
//                 type="text" 
//                 value={baseNumber} 
//                 onChange={e => setBaseNumber(e.target.value)} 
//                 placeholder="e.g. 150"
//                 className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:border-primary outline-none text-white font-mono transition-colors"
//               />
//             </div>
//           </div>

//           <div className="pt-6 border-t border-gray-800">
//             <button 
//               onClick={handleDownload}
//               disabled={isGenerating || !image}
//               className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
//                 image ? "bg-primary text-black hover:bg-primary/90" : "bg-gray-800 text-gray-500 cursor-not-allowed"
//               }`}
//             >
//               {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />}
//               {isGenerating ? "Processing Canvas..." : "Generate & Download"}
//             </button>
//           </div>
//         </div>

//         {/* Right Side: Live Preview */}
//         <div className="lg:col-span-7 flex flex-col items-center justify-center bg-gray-950 p-8 rounded-3xl border border-gray-800 relative overflow-hidden">
//           {/* Subtle grid background for the preview area */}
//           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
//           <h3 className="absolute top-6 left-6 text-sm font-bold text-gray-500 uppercase tracking-widest font-orbitron">Live Preview</h3>
          
//           {/* THE CARD CONTAINER - TARGETED BY HTML-TO-IMAGE */}
//           <div className="relative mt-8 drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]">
            
//             {/* INVISIBLE SVG FILTERS FOR ANTI-COUNTERFEIT RENDER */}
//             <svg style={{ display: 'none' }}>
//               <defs>
//                 <filter id="physical-texture">
//                   <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" result="noise" />
//                   <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.15 0" in="noise" result="coloredNoise" />
//                   <feBlend mode="multiply" in="SourceGraphic" in2="coloredNoise" />
//                 </filter>
//               </defs>
//             </svg>

//             <div 
//               ref={cardRef} 
//               className={`relative flex flex-col rounded-xl overflow-hidden transition-all duration-500 ease-in-out ${
//                 cardType === 'Action' ? 'w-[560px] h-[400px]' : 
//                 cardType === 'Item' ? 'w-[460px] h-[460px]' : 
//                 'w-[400px] h-[560px]'
//               }`}
//               style={{
//                 background: getStatusBaseGradient(),
//                 boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.15), inset 0 0 40px rgba(0,0,0,1)',
//                 filter: 'url(#physical-texture)'
//               }}
//             >
//               {/* Complex SVG Texture Pattern on the Casing */}
//               <div 
//                 className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" 
//                 style={{ 
//                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 10l10-10H0l10 10z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
//                   backgroundSize: '20px 20px'
//                 }}
//               ></div>

//               {/* ACTION CARD LINES (For Premium, Legendary, Mythic) */}
//               {premiumStatus !== "Normal" && (
//                 <div 
//                   className="absolute inset-0 opacity-50 mix-blend-color-dodge pointer-events-none"
//                   style={{
//                     backgroundImage: 'repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 5deg, rgba(255,255,255,0.3) 5.5deg, transparent 6deg)',
//                     backgroundSize: '100% 100%'
//                   }}
//                 ></div>
//               )}

//               {/* Micro-printing Anti-Counterfeit Border Text */}
//               <div className="absolute inset-1 pointer-events-none z-0 opacity-20">
//                 <svg width="100%" height="100%">
//                   <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="white" strokeWidth="20" strokeDasharray="5 15" />
//                   <text x="10" y="20" fill="white" fontSize="8" fontFamily="monospace" letterSpacing="5">AUTHENTIC SECURE ASSET • DO NOT COPY • AUTHENTIC SECURE ASSET • DO NOT COPY</text>
//                   <text x="10" y="540" fill="white" fontSize="8" fontFamily="monospace" letterSpacing="5">AUTHENTIC SECURE ASSET • DO NOT COPY • AUTHENTIC SECURE ASSET • DO NOT COPY</text>
//                   <text x="20" y="-10" fill="white" fontSize="8" fontFamily="monospace" letterSpacing="5" transform="rotate(90)">SECURE ASSET • DO NOT COPY • SECURE ASSET • DO NOT COPY • SECURE ASSET • DO NOT COPY</text>
//                   <text x="20" y="-380" fill="white" fontSize="8" fontFamily="monospace" letterSpacing="5" transform="rotate(90)">SECURE ASSET • DO NOT COPY • SECURE ASSET • DO NOT COPY • SECURE ASSET • DO NOT COPY</text>
//                 </svg>
//               </div>

//               {/* Structural Frame Overlays based on Premium Status */}
//               {premiumStatus === "Legendary" && (
//                 <div className="absolute inset-0 z-20 pointer-events-none drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
//                   {/* Golden Armor Plates */}
//                   <div className="absolute top-0 left-[15%] w-[70%] h-[30px] bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700" style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)' }}></div>
//                   <div className="absolute bottom-0 left-[15%] w-[70%] h-[30px] bg-gradient-to-t from-yellow-300 via-yellow-500 to-yellow-700" style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)' }}></div>
//                   <div className="absolute top-[20%] left-0 w-[15px] h-[60%] bg-gradient-to-r from-yellow-300 to-yellow-700" style={{ clipPath: 'polygon(0 0, 100% 10%, 100% 90%, 0 100%)' }}></div>
//                   <div className="absolute top-[20%] right-0 w-[15px] h-[60%] bg-gradient-to-l from-yellow-300 to-yellow-700" style={{ clipPath: 'polygon(0 10%, 100% 0, 100% 100%, 0 90%)' }}></div>
//                 </div>
//               )}

//               {premiumStatus === "Mythic" && (
//                 <div className="absolute inset-0 z-20 pointer-events-none drop-shadow-[0_0_30px_rgba(0,0,0,1)]">
//                   {/* Corrupted / Shattered Obsidian Spikes cutting into the frame */}
//                   <svg width="100%" height="100%" viewBox="0 0 400 560" preserveAspectRatio="none">
//                     <path d="M0,0 L120,0 L60,40 L40,20 L0,80 Z" fill="#111" />
//                     <path d="M400,0 L280,0 L340,40 L360,20 L400,80 Z" fill="#111" />
//                     <path d="M0,560 L120,560 L60,520 L40,540 L0,480 Z" fill="#111" />
//                     <path d="M400,560 L280,560 L340,520 L360,540 L400,480 Z" fill="#111" />
//                     <path d="M0,200 L40,240 L20,280 L50,300 L0,360 Z" fill="#111" />
//                     <path d="M400,200 L360,240 L380,280 L350,300 L400,360 Z" fill="#111" />
//                   </svg>
//                 </div>
//               )}

//               {/* Complex Metallic Border Layer (Dynamic Cut and Inset) */}
//               <div 
//                 className="absolute z-10 transition-all duration-500 ease-in-out"
//                 style={{ 
//                   inset: getPremiumInset(),
//                   background: getBorderGradient(), 
//                   clipPath: getCardShape(),
//                 }}
//               >
//                 {/* Deep Inner Shadow Layer */}
//                 <div 
//                   className="absolute inset-[6px] bg-black shadow-[inset_0_0_40px_rgba(0,0,0,1)]"
//                   style={{ 
//                     clipPath: getCardShape(),
//                     transition: 'clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
//                   }}
//                 >
//                   {/* Main Artwork Image */}
//                   {image ? (
//                     <BackendImage src={image} alt="Card Artwork" className="w-full h-full object-cover opacity-90"  />
//                   ) : (
//                     <div className="w-full h-full flex flex-col items-center justify-center text-gray-800 bg-gray-950">
//                       <Sparkles className="w-24 h-24 opacity-30 mb-6" />
//                       <span className="font-orbitron font-bold tracking-[0.5em] opacity-30 text-2xl">ARTWORK</span>
//                     </div>
//                   )}

//                   {/* Dark Vignette over Artwork */}
//                   <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)] pointer-events-none mix-blend-multiply"></div>

//                   {/* High-End Static Holographic/Foil Overlays */}
//                   {statusType === "Secret Rare" && (
//                     <div className="absolute inset-0 z-20 pointer-events-none opacity-70 mix-blend-color-dodge" 
//                       style={{ 
//                         backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0) 4px), radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.9), transparent 60%)' 
//                       }}>
//                     </div>
//                   )}
//                   {statusType === "Ultra Rare" && (
//                     <div className="absolute inset-0 z-20 pointer-events-none opacity-50 mix-blend-screen" 
//                       style={{ 
//                         backgroundImage: 'linear-gradient(45deg, rgba(255,0,150,0.4), rgba(0,204,255,0.4), rgba(0,255,100,0.4))' 
//                       }}>
//                     </div>
//                   )}
//                 </div>
//               </div>


//               {/* Vertical Base Number Indicator (Attached to Left Edge) */}
//               <div className="absolute bottom-[20%] left-4 z-30 drop-shadow-[0_5px_10px_rgba(0,0,0,0.9)] origin-bottom-left -rotate-90 translate-y-full">
//                 <div className="bg-black/80 backdrop-blur-sm border-[3px] border-gray-700 px-8 py-2 shadow-[inset_0_0_15px_rgba(255,255,255,0.2)]" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}>
//                   <span className="font-mono font-black text-white text-lg tracking-[0.3em] drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
//                     NO. {baseNumber.padStart(4, '0')}
//                   </span>
//                 </div>
//               </div>

//               {/* Star Rating Seal (Massive Circular Emblem at Bottom Right) */}
//               <div className="absolute bottom-8 right-8 z-30 drop-shadow-[0_10px_20px_rgba(0,0,0,1)]">
//                 <div className="relative w-28 h-28 flex items-center justify-center rounded-full" style={{ background: getBorderGradient() }}>
//                   {/* Inner Ring */}
//                   <div className="absolute inset-1.5 bg-gray-950 rounded-full shadow-[inset_0_0_30px_rgba(0,0,0,1)] border border-white/10 flex flex-col items-center justify-center">
                    
//                     {/* The Star Rating Number */}
//                     <div className="relative z-10 flex flex-col items-center justify-center -mt-2">
//                       <span className="font-black text-5xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_2px_5px_rgba(250,204,21,0.5)] leading-none">
//                         {starRating}
//                       </span>
//                     </div>
                    
//                     {/* Curved text approximation (Stars) */}
//                     <div className="font-orbitron font-bold text-[11px] text-gray-400 uppercase tracking-widest mt-1">
//                       RATING
//                     </div>

//                     {/* Miniature Star Icons circling the bottom */}
//                     <div className="absolute bottom-3 flex gap-0.5">
//                       {[...Array(5)].map((_, i) => (
//                         <svg key={i} className={`w-3 h-3 ${i < parseInt(starRating) ? 'text-yellow-400' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 20 20">
//                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                         </svg>
//                       ))}
//                     </div>

//                   </div>
//                 </div>
//               </div>

//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
