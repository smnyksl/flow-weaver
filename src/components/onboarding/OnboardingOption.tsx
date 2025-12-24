import { cn } from '@/lib/utils';

interface OnboardingOptionProps {
  value: string;
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

export function OnboardingOption({ label, icon, selected, onClick }: OnboardingOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
        "hover:scale-105 active:scale-95",
        selected
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      <span className="text-3xl">{icon}</span>
      <span className={cn(
        "text-sm font-medium text-center",
        selected ? "text-primary" : "text-foreground"
      )}>
        {label}
      </span>
    </button>
  );
}
