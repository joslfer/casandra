import { useCallback, useEffect, useRef } from "react";

/**
 * Hook de feedback háptico.
 * - Android / navegadores con Vibration API: usa navigator.vibrate directamente.
 * - iOS Safari (17.4+): no soporta Vibration API, así que simula un click
 *   sobre un <label> asociado a un checkbox oculto, lo cual dispara el
 *   haptic feedback nativo del sistema en ciertos controles de formulario.
 */
export function useHaptic() {
  const labelRef = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    if (navigator.vibrate) return; // no hace falta el truco de iOS

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "haptic-checkbox";
    checkbox.style.display = "none";

    const label = document.createElement("label");
    label.htmlFor = "haptic-checkbox";
    label.style.display = "none";

    document.body.appendChild(checkbox);
    document.body.appendChild(label);
    labelRef.current = label;

    return () => {
      checkbox.remove();
      label.remove();
      labelRef.current = null;
    };
  }, []);

  const haptic = useCallback((pattern: number | number[] = 10) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
      return;
    }
    labelRef.current?.click();
  }, []);

  return haptic;
}

