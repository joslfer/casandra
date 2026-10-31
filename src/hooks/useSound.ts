import { useCallback, useEffect, useRef } from 'react'

export function useSound(src: string, volume = 0.5) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  if (typeof Audio !== 'undefined' && !audioRef.current) {
    const audio = new Audio(src)
    audio.preload = 'auto'
    audio.volume = volume
    audio.addEventListener('error', () => {
      console.error('sonido: no se pudo cargar', src, audio.error)
    })
    audio.load()
    audioRef.current = audio
  }

  // iOS solo deja reproducir audio "desbloqueado" por un toque del usuario.
  // Con el primer toque en cualquier parte, lo desbloqueamos en silencio.
  useEffect(() => {
    const unlock = () => {
      const a = audioRef.current
      if (!a) return
      a.muted = true
      a.play()
        .then(() => {
          a.pause()
          a.currentTime = 0
          a.muted = false
        })
        .catch((e) => {
          a.muted = false
          console.error('sonido: fallo al desbloquear', e)
        })
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  return useCallback(() => {
    try {
      if (localStorage.getItem('casandra_sonido') === 'off') return
    } catch {}
    const a = audioRef.current
    if (!a) {
      console.error('sonido: audio no creado')
      return
    }
    a.currentTime = 0
    a.play().catch((e) => console.error('sonido: fallo al reproducir', e))
  }, [])
}