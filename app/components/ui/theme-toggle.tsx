import * as RadixSwitch from "@radix-ui/react-switch";
import { useEffect, useId, useState } from "react";
import { applyTheme, currentTheme } from "../../lib/theme";

// The scheme is only known in the browser, so the switch reads it after mount rather than
// guessing during render.
export function ThemeToggle({ className = "" }: { className?: string }) {
  // The sidebar and the phone bar both render one, so the label needs a name of its own.
  const id = useId();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(currentTheme() === "dark");
  }, []);

  function handleChange(checked: boolean) {
    setDark(checked);
    applyTheme(checked ? "dark" : "light");
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="text-xs text-muted">
        Dark
      </label>

      <RadixSwitch.Root
        id={id}
        checked={dark}
        onCheckedChange={handleChange}
        className="h-5 w-9 rounded-full border border-line bg-raised outline-none data-[state=checked]:border-shared data-[state=checked]:bg-shared focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shared"
      >
        <RadixSwitch.Thumb className="block size-3.5 translate-x-0.5 rounded-full bg-muted transition-transform duration-200 will-change-transform data-[state=checked]:translate-x-4 data-[state=checked]:bg-shared-ink" />
      </RadixSwitch.Root>
    </div>
  );
}
