'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

interface SmoothScrollProviderProps {
  children: React.ReactNode
  options?: {
    duration?: number
    easing?: (t: number) => number
    smooth?: boolean
    smoothTouch?: boolean
    touchMultiplier?: number
  }
}

export default function SmoothScrollProvider({ 
  children, 
  options = {} 
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Détection du device pour adapter les paramètres
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isTouch = 'ontouchstart' in window
    
    // Configuration optimisée pour les sites awards
    const lenis = new Lenis({
      duration: isMobile ? 1.0 : 0.6, // Plus rapide sur mobile
      easing:  (t: number) => 1 - Math.pow(1 - t, 6),
      smooth: !isMobile, // Désactiver le smooth scroll sur mobile pour de meilleures performances
      smoothTouch: false,
      touchMultiplier: isMobile ? 1.0 : 1.5,
      wheelMultiplier: isMobile ? 1.0 : 1.0,
      infinite: false,
      ...options
    })

    lenisRef.current = lenis
    
    // Exposer Lenis globalement pour les hooks
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).lenis = lenis
    }

    // Fonction de rendu pour l'animation
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Prévenir le scroll par défaut
    lenis.on('scroll', () => {
      // Optionnel: callback pour les autres composants
    })

    return () => {
      lenis.destroy()
      lenisRef.current = null
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).lenis = null
      }
    }
  }, [options])

  return <>{children}</>
}