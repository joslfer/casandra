import { useCallback } from "react";

export function useHaptic() {
  const haptic = useCallback((pattern: number | number[] = 10) => {
    // Si es Android o navegador compatible con Vibration API
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
      return;
    }

    // Truco para iOS Safari: busca el label estático en el DOM
    const label = document.getElementById("haptic-label");
    label?.click();
  }, []);

  return haptic;
}