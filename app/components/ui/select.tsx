import * as RadixSelect from "@radix-ui/react-select";

export type Option = { value: string; label: string };

type SelectProps = {
  label: string;
  name: string;
  defaultValue: string;
  options: readonly Option[];
};

// Radix renders a hidden native select when given a name, so the form stays uncontrolled and
// FormData picks the value up on submit.
export function Select({ label, name, defaultValue, options }: SelectProps) {
  const labelId = `${name}-label`;

  return (
    <div className="space-y-1.5">
      <span
        id={labelId}
        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </span>

      <RadixSelect.Root name={name} defaultValue={defaultValue}>
        <RadixSelect.Trigger
          aria-labelledby={labelId}
          className="flex w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <RadixSelect.Value />
          <RadixSelect.Icon>
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
            className="w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className="cursor-default rounded px-2 py-1.5 text-sm text-neutral-900 outline-none data-[highlighted]:bg-neutral-100 dark:text-neutral-100 dark:data-[highlighted]:bg-neutral-800"
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
