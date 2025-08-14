'use client'

import { useCallback } from 'react'

interface SmoothScrollMethods {
  scrollTo: (target: string | number, options?: { offset?: number; duration?: number }) => void
  scrollToTop: (duration?: number) => void
  scrollToBottom: (duration?: number) => void
  stop: () => void
  start: () => void
}

export function useSmoothScroll(): SmoothScrollMethods {
  const scrollTo = useCallback((target: string | number, options?: { offset?: number; duration?: number }) => {
    if (typeof window !== 'undefined' && (window as any).lenis) {
      const lenis = (window as any).lenis
      
      if (typeof target === 'string') {
        // Scroll vers un élément
        const element = document.querySelector(target)
        if (element) {
          lenis.scrollTo(element, {
            offset: options?.offset || 0,
            duration: options?.duration || 1.2
          })
        }
      } else {
        // Scroll vers une position
        lenis.scrollTo(target, {
          duration: options?.duration || 1.2
        })
      }
    }
  }, [])

  const scrollToTop = useCallback((duration = 1.5) => {
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { duration })
    }
  }, [])

  const scrollToBottom = useCallback((duration = 1.5) => {
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.scrollTo(document.body.scrollHeight, { duration })
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.stop()
    }
  }, [])

  const start = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.start()
    }
  }, [])

  return {
    scrollTo,
    scrollToTop,
    scrollToBottom,
    stop,
    start
  }
}