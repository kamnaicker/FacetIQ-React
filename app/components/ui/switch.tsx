import * as RadixSwitch from "@radix-ui/react-switch";
import { useId } from "react";

type SwitchProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
};

export function Switch({ label, checked, onCheckedChange, className = "" }: SwitchProps) {
  // The same switch can render twice on one page, so each needs an id of its own.
  const id = useId();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="text-xs text-muted">
        {label}
      </label>

      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="focus-ring h-5 w-9 rounded-full border border-line bg-raised data-[state=checked]:border-shared data-[state=checked]:bg-shared"
      >
        <RadixSwitch.Thumb className="block size-3.5 translate-x-0.5 rounded-full bg-muted transition-transform duration-200 will-change-transform data-[state=checked]:translate-x-4 data-[state=checked]:bg-shared-ink" />
      </RadixSwitch.Root>
    </div>
  );
}
