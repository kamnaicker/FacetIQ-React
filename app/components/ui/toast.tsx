import * as RadixToast from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useState } from "react";

type Tone = "success" | "error" | "warning";

type Notice = { id: number; tone: Tone; message: string };

const tones: Record<Tone, string> = {
  success: "border-l-shared",
  error: "border-l-danger",
  warning: "border-l-withheld",
};

const NotifyContext = createContext<(tone: Tone, message: string) => void>(() => {});

// Actions report back here. A page that could not load says why in place instead.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);

  const notify = useCallback((tone: Tone, message: string) => {
    setNotices((current) => [...current, { id: Date.now() + Math.random(), tone, message }]);
  }, []);

  function dismiss(id: number) {
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }

  return (
    <NotifyContext.Provider value={notify}>
      <RadixToast.Provider duration={4000}>
        {children}

        {notices.map((notice) => (
          <RadixToast.Root
            key={notice.id}
            type={notice.tone === "error" ? "foreground" : "background"}
            onOpenChange={(open) => !open && dismiss(notice.id)}
            className={`flex items-start gap-3 rounded-md border border-l-4 border-line bg-surface px-4 py-3 text-sm text-ink shadow-lg shadow-ink/5 ${tones[notice.tone]}`}
          >
            <RadixToast.Description className="flex-1">{notice.message}</RadixToast.Description>
            <RadixToast.Close
              aria-label="Dismiss"
              className="rounded text-muted outline-none hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shared"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </RadixToast.Close>
          </RadixToast.Root>
        ))}

        <RadixToast.Viewport className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </NotifyContext.Provider>
  );
}

export function useNotify() {
  return useContext(NotifyContext);
}
