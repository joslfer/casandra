import { useCallback, useEffect, useRef } from "react";

// Un único AudioContext compartido por toda la app
let ctx: AudioContext | null = null;
// Cada sonido se descarga y decodifica una sola vez
const buffers = new Map<string, Promise<AudioBuffer | null>>();

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function cargar(src: string): Promise<AudioBuffer | null> {
  let p = buffers.get(src);
  if (!p) {
    p = (async () => {
      try {
        const c = getCtx();
        if (!c) return null;
        const res = await fetch(src);
        const datos = await res.arrayBuffer();
        return await c.decodeAudioData(datos);
      } catch {
        buffers.delete(src); // permite reintentar más tarde
        return null;
      }
    })();
    buffers.set(src, p);
  }
  return p;
}

export function useSound(src: string) {
  const bufferRef = useRef<AudioBuffer | null>(null);
  const fuenteRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    let vivo = true;
    cargar(src).then((b) => {
      if (vivo) bufferRef.current = b;
    });

    // iOS deja el contexto suspendido hasta el primer gesto del usuario
    const desbloquear = () => {
      const c = getCtx();
      if (c && c.state === "suspended") c.resume().catch(() => {});
    };
    window.addEventListener("pointerdown", desbloquear, { once: true });

    return () => {
      vivo = false;
      window.removeEventListener("pointerdown", desbloquear);
    };
  }, [src]);

  const play = useCallback(() => {
    try {
      const c = getCtx();
      const buffer = bufferRef.current;
      if (!c || !buffer) return;
      if (c.state === "suspended") c.resume().catch(() => {});

      // Corta el anterior para que nunca se apilen voces al apostar rápido
      try {
        fuenteRef.current?.stop();
      } catch {}

      const fuente = c.createBufferSource();
      fuente.buffer = buffer;
      fuente.connect(c.destination);
      fuente.onended = () => {
        fuente.disconnect();
        if (fuenteRef.current === fuente) fuenteRef.current = null;
      };
      fuenteRef.current = fuente;
      fuente.start(0);
    } catch {
      // el sonido nunca debe romper una apuesta
    }
  }, []);

  return play;
}