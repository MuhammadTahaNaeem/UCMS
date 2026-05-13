import * as React from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = React.createContext(null);
let toastId = 0;

function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast];
    case "REMOVE":
      return state.filter((item) => item.id !== action.id);
    default:
      return state;
  }
}

function ToastProvider({ children }) {
  const [toasts, dispatch] = React.useReducer(reducer, []);

  const dismiss = React.useCallback((id) => dispatch({ type: "REMOVE", id }), []);

  const toast = React.useCallback(({ title, description, variant = "default", duration = 3500 }) => {
    const id = ++toastId;
    const nextToast = { id, title, description, variant };
    dispatch({ type: "ADD", toast: nextToast });
    window.setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onClose={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const isDestructive = toast.variant === "destructive";
  const icon = isDestructive ? <XCircle className="size-4" /> : toast.variant === "info" ? <Info className="size-4" /> : <CheckCircle2 className="size-4" />;

  return (
    <div
      role="status"
      className={cn(
        "rounded-xl border bg-background p-4 shadow-lg ring-1 ring-foreground/10",
        isDestructive ? "border-destructive/20" : "border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5", isDestructive ? "text-destructive" : "text-primary")}>{icon}</div>
        <div className="min-w-0 flex-1">
          {toast.title ? <p className="text-sm font-medium">{toast.title}</p> : null}
          {toast.description ? <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p> : null}
        </div>
        <button onClick={onClose} className="text-muted-foreground transition hover:text-foreground" aria-label="Dismiss toast">
          ×
        </button>
      </div>
    </div>
  );
}

function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export { ToastProvider, useToast };