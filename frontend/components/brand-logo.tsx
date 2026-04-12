import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = 32,
  showWordmark = true,
  subtitle,
}: {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo_white.png"
        alt="Vertoiz"
        width={size}
        height={size}
        className="shrink-0"
        style={{ width: size, height: size }}
        priority
      />
      {showWordmark ? (
        <div>
          <p className="text-base font-semibold tracking-tight text-white">Vertoiz</p>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
