import { useEffect, useState } from "react";
import { applyTheme, currentTheme } from "../../lib/theme";
import { Switch } from "./switch";

// The scheme is only known in the browser, so the switch reads it after mount rather than
// guessing during render.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(currentTheme() === "dark");
  }, []);

  function handleChange(checked: boolean) {
    setDark(checked);
    applyTheme(checked ? "dark" : "light");
  }

  return <Switch label="Dark" checked={dark} onCheckedChange={handleChange} className={className} />;
}
