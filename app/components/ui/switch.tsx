import * as RadixSwitch from "@radix-ui/react-switch";
import { useId, type Ref } from "react";

type SwitchProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  // So a caller can put focus back on the switch when what it controls goes away.
  ref?: Ref<HTMLButtonElement>;
};

export function Switch({ label, checked, onCheckedChange, className = "", ref }: SwitchProps) {
  // The same switch can render twice on one page, so each needs an id of its own.
  const id = useId();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="text-xs text-muted">
        {label}
      </label>

      <RadixSwitch.Root
        ref={ref}
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
