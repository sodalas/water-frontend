import React from "react";

type ProviderBadgeProps = {
  label: string;
  tone?: "blue" | "purple" | "neutral";
};

export function ProviderBadge({
  label,
  tone = "neutral",
}: ProviderBadgeProps) {
  const toneClasses =
    tone === "blue"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : tone === "purple"
      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
      : "bg-slate-500/10 text-slate-300 border-slate-500/20";

  return (
    <span
      aria-label={`Source: ${label}`}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${toneClasses}`}
    >
      {label}
    </span>
  );
}