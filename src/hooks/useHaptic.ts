import { useCallback, useEffect, useRef } from "react";

export function useHaptic() {
  const labelRef = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    // navigator.vibrate funciona en Android, no hacemos el truco
    if (typeof navigator !== "undefined" && navigator.vibrate) return; 

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "haptic-checkbox";
    
    // Ocultamiento visual, NO display: none
    Object.assign(checkbox.style, {
      position: "absolute",
      opacity: "0",
      pointerEvents: "none",
      width: "1px",
      height: "1px",
      margin: "-1px",
      overflow: "hidden"
    });

    const label = document.createElement("label");
    label.htmlFor = "haptic-checkbox";
    
    Object.assign(label.style, {
      position: "absolute",
      opacity: "0",
      pointerEvents: "none",
      width: "1px",
      height: "1px",
      margin: "-1px",
      overflow: "hidden"
    });

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
    // LOG PARA LA CONSOLA:
    console.log("[Haptic] Disparando...", { 
      soportaVibrate: !!navigator.vibrate, 
      labelExiste: !!labelRef.current 
    });

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
      return;
    }
    
    // Fallback para iOS
    labelRef.current?.click();
  }, []);

  return haptic;
}