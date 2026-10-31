import { useCallback, useEffect } from 'react'

let ctx: AudioContext | null = null
const buffers = new Map<string, AudioBuffer>()
const cargando = new Set<string>()

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

function cargar(src: string) {
  const c = getCtx()
  if (!c || buffers.has(src) || cargando.has(src)) return
  cargando.add(src)
  fetch(src)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.arrayBuffer()
    })
    .then(
      (data) =>
        new Promise<AudioBuffer>((resolve, reject) =>
          c.decodeAudioData(data, resolve, reject)
        )
    )
    .then((buf) => {
      buffers.set(src, buf)
    })
    .catch((e) => console.error('sonido: no se pudo cargar', src, e))
    .finally(() => cargando.delete(src))
}

export function useSound(src: string, volume = 0.5) {
  useEffect(() => {
    cargar(src)

    // iOS deja el AudioContext suspendido hasta un toque del usuario
    const despertar = () => {
      const c = getCtx()
      if (c && c.state === 'suspended') c.resume().catch(() => {})
      cargar(src)
    }
    window.addEventListener('pointerdown', despertar)
    return () => window.removeEventListener('pointerdown', despertar)
  }, [src])

  return useCallback(() => {
    try {
      if (localStorage.getItem('casandra_sonido') === 'off') return
    } catch {}

    try {
      const c = getCtx()
      const buf = buffers.get(src)
      if (!c || !buf) {
        cargar(src)
        return
      }
      if (c.state === 'suspended') c.resume().catch(() => {})

      const fuente = c.createBufferSource()
      const ganancia = c.createGain()
      ganancia.gain.value = volume
      fuente.buffer = buf
      fuente.connect(ganancia)
      ganancia.connect(c.destination)
      fuente.start(0)
    } catch (e) {
      console.error('sonido: error', e)
    }
  }, [src, volume])
}