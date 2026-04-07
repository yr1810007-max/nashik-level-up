interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: "primary" | "accent" | "info" | "xp";
  size?: "sm" | "md" | "lg";
}

const gradients: Record<string, string> = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  info: "gradient-info",
  xp: "gradient-xp",
};

const sizes: Record<string, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({ value, max = 100, label, showPercentage = true, variant = "primary", size = "md" }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs font-semibold">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && <span className="text-primary">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`${sizes[size]} bg-muted rounded-full overflow-hidden`}>
        <div
          className={`h-full ${gradients[variant]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
