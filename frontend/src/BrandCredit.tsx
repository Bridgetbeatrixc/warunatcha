import { growlaneLogoImage } from "./menuData";

export function GrowlaneLogo({ className = "w-40" }: { className?: string }) {
  return (
    <span className={`relative block aspect-[1468/348] overflow-hidden ${className}`} aria-label="Growlane.ai">
      <img
        src={growlaneLogoImage}
        alt="Growlane.ai"
        className="absolute left-[-19.1%] top-[-233%] w-[136.3%] max-w-none"
      />
    </span>
  );
}

export function BrandCredit() {
  return (
    <div className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
      <span>Made by</span>
      <GrowlaneLogo className="w-32" />
    </div>
  );
}
