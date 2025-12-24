import { OnboardingStep as StepType } from '@/types/preferences';
import { OnboardingOption } from './OnboardingOption';

interface OnboardingStepProps {
  step: StepType;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

export function OnboardingStepComponent({ step, value, onChange }: OnboardingStepProps) {
  const handleOptionClick = (optionValue: string) => {
    if (step.type === 'single') {
      onChange(optionValue);
    } else {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter(v => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    }
  };

  const isSelected = (optionValue: string) => {
    if (step.type === 'single') {
      return value === optionValue;
    }
    return Array.isArray(value) && value.includes(optionValue);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
        <p className="text-muted-foreground">{step.subtitle}</p>
        {step.type === 'multi' && (
          <p className="text-xs text-muted-foreground mt-2">Birden fazla seçebilirsin</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {step.options.map((option) => (
          <OnboardingOption
            key={option.value}
            value={option.value}
            label={option.label}
            icon={option.icon}
            selected={isSelected(option.value)}
            onClick={() => handleOptionClick(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
