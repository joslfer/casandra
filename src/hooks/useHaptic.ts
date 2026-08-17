import { useCallback, useEffect, useRef } from "react";

/**
 * Reproduce el haptic nativo de Safari cuando el navegador admite controles
 * `switch`. Fuera de Safari no tiene efecto.
 */
export function useHaptic() {
  const switchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.setAttribute("aria-hidden", "true");
    input.tabIndex = -1;
    input.style.cssText =
      "position:fixed;inline-size:1px;block-size:1px;opacity:0;pointer-events:none;" +
      "clip-path:inset(50%);overflow:hidden;inset:0;";

    document.body.appendChild(input);
    switchRef.current = input;

    return () => {
      switchRef.current = null;
      input.remove();
    };
  }, []);

  return useCallback(() => {
    const input = switchRef.current;
    if (!input) return;

    // Se llama solamente desde un handler de interacción real.
    input.click();
  }, []);
}

