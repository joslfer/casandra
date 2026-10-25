import { useSyncExternalStore } from "react";

export interface Suplantado {
  id: string;
  nombre: string;
}

const CLAVE = "casandra:suplantado";
const oyentes = new Set<() => void>();

function leerGuardado(): Suplantado | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    const raw = sessionStorage.getItem(CLAVE);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && typeof v.id === "string" ? { id: v.id, nombre: String(v.nombre ?? "") } : null;
  } catch {
    return null;
  }
}

let actual: Suplantado | null = leerGuardado();

function cambiar(nuevo: Suplantado | null) {
  actual = nuevo;
  try {
    if (nuevo) sessionStorage.setItem(CLAVE, JSON.stringify(nuevo));
    else sessionStorage.removeItem(CLAVE);
  } catch {
    // sessionStorage no disponible: el estado sigue funcionando en memoria
  }
  oyentes.forEach((f) => f());
}

export function suplantarUsuario(s: Suplantado) {
  cambiar({ id: s.id, nombre: s.nombre });
}

export function dejarDeSuplantar() {
  cambiar(null);
}

function suscribir(f: () => void) {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
}

export function useSuplantado(): Suplantado | null {
  return useSyncExternalStore(suscribir, () => actual, () => null);
}