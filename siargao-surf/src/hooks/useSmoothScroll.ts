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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).lenis) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).lenis) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).lenis.scrollTo(0, { duration })
    }
  }, [])

  const scrollToBottom = useCallback((duration = 1.5) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).lenis) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).lenis.scrollTo(document.body.scrollHeight, { duration })
    }
  }, [])

  const stop = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).lenis) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).lenis.stop()
    }
  }, [])

  const start = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).lenis) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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