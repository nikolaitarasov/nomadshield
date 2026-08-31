import { OWNER } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OwnerLine({ className }: { className?: string }) {
  const year = new Date().getFullYear();
  return (
    <p className={cn("text-[11px] text-muted/80", className)}>
      © {year} NomadShield. Owned by{" "}
      <a href={OWNER.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground">
        {OWNER.legalName}
      </a>
      {" · "}
      <a href={OWNER.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground">
        {OWNER.host}
      </a>
      . Software, not a law firm.
    </p>
  );
}
