import { useCallback, useRef } from 'react'

export function useSound(src: string, volume = 0.5) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  if (typeof Audio !== 'undefined' && !audioRef.current) {
    try {
      const audio = new Audio(src)
      audio.preload = 'auto'
      audio.volume = volume
      audio.addEventListener('error', () => {
        console.error('sonido: no se pudo cargar', src, audio.error)
      })
      audioRef.current = audio
    } catch (e) {
      console.error('sonido: no se pudo crear', e)
    }
  }

  return useCallback(() => {
    try {
      if (localStorage.getItem('casandra_sonido') === 'off') return
    } catch {}

    try {
      const a = audioRef.current
      if (!a) return
      try {
        a.currentTime = 0
      } catch {}
      const p = a.play()
      if (p !== undefined) {
        p.catch((e) => console.error('sonido: fallo al reproducir', e))
      }
    } catch (e) {
      console.error('sonido: error', e)
    }
  }, [])
}