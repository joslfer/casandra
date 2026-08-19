import { useCallback } from "react";

export function useHaptic() {
  const haptic = useCallback((pattern: number | number[] = 10) => {
    const soportaVibrate = typeof navigator !== "undefined" && !!navigator.vibrate;
    const label = document.getElementById("haptic-label");

    // ⬇️ ESTO ES LO QUE VERÁS EN LA CONSOLA
    console.log("[Haptic] Disparando...", { 
      soportaVibrate, 
      labelEncontrado: !!label 
    });

    // Si es Android o navegador compatible con Vibration API
    if (soportaVibrate) {
      navigator.vibrate(pattern);
      return;
    }

    // Truco para iOS Safari: busca el label estático en el DOM
    label?.click();
  }, []);

  return haptic;
}