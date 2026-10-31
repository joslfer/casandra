import { useCallback, useEffect } from 'react'

let ctx: AudioContext | null = null
let desbloqueado = false
const buffers = new Map<string, AudioBuffer>()
const cargando = new Set<string>()

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    try {
      ctx = new AC({ latencyHint: 'interactive' })
    } catch {
      ctx = new AC()
    }
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

// Reanuda el contexto y, la primera vez, reproduce un sonido vacío para
// que iOS lo deje "caliente" y el siguiente suene sin retraso.
function despertar() {
  const c = getCtx()
  if (!c) return
  if (c.state !== 'running') c.resume().catch(() => {})
  if (!desbloqueado) {
    try {
      const vacio = c.createBuffer(1, 1, 22050)
      const s = c.createBufferSource()
      s.buffer = vacio
      s.connect(c.destination)
      s.start(0)
      desbloqueado = true
    } catch {}
  }
}

export function useSound(src: string, volume = 0.5) {
  useEffect(() => {
    cargar(src)

    const alVolver = () => {
      if (document.visibilityState === 'visible') despertar()
    }

    window.addEventListener('touchend', despertar, { passive: true })
    window.addEventListener('pointerdown', despertar, { passive: true })
    window.addEventListener('click', despertar)
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      window.removeEventListener('touchend', despertar)
      window.removeEventListener('pointerdown', despertar)
      window.removeEventListener('click', despertar)
      document.removeEventListener('visibilitychange', alVolver)
    }
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

      const reproducir = () => {
        try {
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
      }

      if (c.state === 'running') {
        reproducir()
      } else {
        c.resume().then(reproducir).catch(() => {})
      }
    } catch (e) {
      console.error('sonido: error', e)
    }
  }, [src, volume])
}