import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index === currentStep 
              ? "w-8 bg-primary" 
              : index < currentStep 
                ? "w-2 bg-primary/60" 
                : "w-2 bg-muted"
          )}
        />
      ))}
    </div>
  );
}
