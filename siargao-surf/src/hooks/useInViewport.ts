'use client'

import { useEffect, useState, useRef, RefObject } from 'react'

interface UseInViewportOptions {
  threshold?: number | number[]
  rootMargin?: string
  triggerOnce?: boolean
}

interface UseInViewportReturn {
  ref: RefObject<HTMLElement | null>
  isInView: boolean
  hasBeenInView: boolean
}

export function useInViewport({
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  triggerOnce = true
}: UseInViewportOptions = {}): UseInViewportReturn {
  const ref = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting
        setIsInView(inView)
        
        if (inView && !hasBeenInView) {
          setHasBeenInView(true)
          
          if (triggerOnce) {
            observer.unobserve(entry.target)
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    const currentRef = ref.current
    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin, triggerOnce, hasBeenInView])

  return { ref, isInView, hasBeenInView }
}