"use client";

import { useState, useEffect } from "react";

// Toast notification types
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // milliseconds (0 = permanent)
}

// Global toast state management
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toastList: Toast[] = [];

export function addToast(message: string, type: ToastType = "info", duration = 4000) {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = { id, message, type, duration };

  toastList = [...toastList, newToast];
  notifyListeners();

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
}

export function removeToast(id: string) {
  toastList = toastList.filter((t) => t.id !== id);
  notifyListeners();
}

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toastList]));
}

export function subscribeToToasts(listener: (toasts: Toast[]) => void) {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter((l) => l !== listener);
  };
}

// Toast Container Component
export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts(setToasts);
    return unsubscribe;
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-500 text-gray-900";
      case "info":
        return "bg-blue-500 text-white";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${getStyles(toast.type)}
            px-4 py-3 rounded-lg shadow-lg
            flex items-center gap-3
            animate-slide-in
            pointer-events-auto
            cursor-pointer
            hover:shadow-xl
            transition-all
          `}
          onClick={() => removeToast(toast.id)}
        >
          <span className="text-xl">{getIcon(toast.type)}</span>
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
