import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** Optional action button rendered inside the toast (e.g. Retry, Undo). */
  action?: ToastAction;
  /** Milliseconds before auto-dismiss. 0 keeps the toast until dismissed. */
  duration?: number;
}

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
  action?: ToastAction;
  /** Identical messages collapsed into this toast, shown as a ×N badge. */
  count: number;
  /** Bumped when a duplicate refreshes the toast, restarting its progress bar. */
  run: number;
  leaving?: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  dismiss: (id: number) => void;
  dismissAll: () => void;
}

/** Maximum toasts on screen at once; the oldest is dropped when exceeded. */
const MAX_VISIBLE = 4;
/** Time allowed for the slide-out animation before the node is removed. */
const EXIT_MS = 220;

/** Errors linger longest — they usually need a reaction from the user. */
const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3500,
  info: 4500,
  warning: 6500,
  error: 8000,
};

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <AlertCircle size={18} className="text-red-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
  info: <Info size={18} className="text-indigo-500" />,
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastsRef = useRef<Toast[]>(toasts);
  toastsRef.current = toasts;
  const idRef = useRef(0);
  const timers = useRef(new Map<number, { timer: number; remaining: number; startedAt: number }>());

  const clearTimer = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) {
      window.clearTimeout(t.timer);
      timers.current.delete(id);
    }
  }, []);

  /** Slide-out, then remove. Also the auto-dismiss path, so timeouts animate away. */
  const dismiss = useCallback(
    (id: number) => {
      clearTimer(id);
      setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), EXIT_MS);
    },
    [clearTimer]
  );

  const dismissAll = useCallback(() => {
    [...timers.current.keys()].forEach(clearTimer);
    setToasts((ts) => ts.map((t) => ({ ...t, leaving: true })));
    window.setTimeout(() => setToasts([]), EXIT_MS);
  }, [clearTimer]);

  const scheduleDismiss = useCallback(
    (id: number, ms: number) => {
      clearTimer(id);
      if (ms <= 0) return; // sticky toast
      timers.current.set(id, {
        timer: window.setTimeout(() => dismiss(id), ms),
        remaining: ms,
        startedAt: Date.now(),
      });
    },
    [clearTimer, dismiss]
  );

  /** Freeze the countdown while the user hovers/focuses the toast. */
  const pauseToast = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (!t) return;
    window.clearTimeout(t.timer);
    timers.current.set(id, { ...t, remaining: Math.max(0, t.remaining - (Date.now() - t.startedAt)) });
  }, []);

  const resumeToast = useCallback(
    (id: number) => {
      const t = timers.current.get(id);
      if (!t) return;
      timers.current.set(id, {
        ...t,
        timer: window.setTimeout(() => dismiss(id), t.remaining),
        startedAt: Date.now(),
      });
    },
    [dismiss]
  );

  const push = useCallback(
    (message: string, type: ToastType = "info", options: ToastOptions = {}) => {
      const duration = options.duration ?? DEFAULT_DURATION[type];
      const existing = toastsRef.current.find((t) => t.message === message && t.type === type && !t.leaving);

      // Smart de-dupe: repeat the same message instead of stacking identical popups.
      if (existing) {
        setToasts((ts) =>
          ts.map((t) =>
            t.id === existing.id
              ? { ...t, run: t.run + 1, count: t.count + 1, duration, action: options.action ?? t.action }
              : t
          )
        );
        scheduleDismiss(existing.id, duration);
        return;
      }

      const id = ++idRef.current;
      const entry: Toast = { id, type, message, duration, action: options.action, count: 1, run: 0 };
      setToasts((ts) => {
        const next = [...ts, entry];
        if (next.length > MAX_VISIBLE) {
          // clearTimer is idempotent, so this stays safe if the updater re-runs.
          clearTimer(next.shift()!.id);
        }
        return next;
      });
      scheduleDismiss(id, duration);
    },
    [clearTimer, scheduleDismiss]
  );

  // Clear every pending timeout if the provider ever unmounts.
  useEffect(
    () => () => {
      [...timers.current.values()].forEach((t) => window.clearTimeout(t.timer));
      timers.current.clear();
    },
    []
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: push,
      success: (m, o) => push(m, "success", o),
      error: (m, o) => push(m, "error", o),
      info: (m, o) => push(m, "info", o),
      warning: (m, o) => push(m, "warning", o),
      dismiss,
      dismissAll,
    }),
    [push, dismiss, dismissAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.length > 1 && (
          <button type="button" className="toast-dismiss-all" onClick={dismissAll}>
            Clear all
          </button>
        )}
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type}${t.leaving ? " is-leaving" : ""}`}
            role={t.type === "error" ? "alert" : "status"}
            onMouseEnter={() => pauseToast(t.id)}
            onMouseLeave={() => resumeToast(t.id)}
            onFocus={() => pauseToast(t.id)}
            onBlur={() => resumeToast(t.id)}
          >
            <span className="toast-icon" aria-hidden="true">
              {ICONS[t.type]}
            </span>
            <span className="flex-1 text-sm font-medium text-gray-800">{t.message}</span>
            {t.count > 1 && <span className="toast-count">×{t.count}</span>}
            {t.action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  dismiss(t.id);
                  t.action?.onClick();
                }}
              >
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismiss(t.id)} className="toast-close" aria-label="Dismiss notification">
              <X size={14} />
            </button>
            {/* Re-keyed on every de-dupe refresh so the bar restarts. */}
            <span key={t.run} className="toast-progress" style={{ animationDuration: `${t.duration}ms` }} aria-hidden="true" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
