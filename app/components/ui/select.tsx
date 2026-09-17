import * as RadixSelect from "@radix-ui/react-select";

export type Option = { value: string; label: string };

type SelectProps = {
  label: string;
  name: string;
  options: readonly Option[];
  hint?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

// Radix renders a hidden native select when given a name, so FormData picks the value up on
// submit. Pass value and onValueChange only where another field depends on the choice.
export function Select({ label, name, options, hint, defaultValue, value, onValueChange }: SelectProps) {
  const labelId = `${name}-label`;
  const hintId = hint ? `${name}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <span id={labelId} className="block text-sm font-medium text-ink">
        {label}
      </span>

      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}

      <RadixSelect.Root
        name={name}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
      >
        <RadixSelect.Trigger
          aria-labelledby={labelId}
          aria-describedby={hintId}
          className="flex w-full items-center justify-between rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-shared focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-shared/40"
        >
          <RadixSelect.Value />
          <RadixSelect.Icon className="text-muted">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M3 4.5 6 7.5 9 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-line bg-surface shadow-lg shadow-ink/5"
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className="cursor-default rounded px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-raised data-[state=checked]:font-medium data-[state=checked]:text-shared"
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
