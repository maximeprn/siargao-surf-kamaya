'use client'

import { useEffect } from 'react'

interface ImagePreloaderProps {
  src: string
  priority?: boolean
}

export default function ImagePreloader({ src, priority = true }: ImagePreloaderProps) {
  useEffect(() => {
    if (priority && typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      link.setAttribute('fetchpriority', 'high')
      document.head.appendChild(link)
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      }
    }
  }, [src, priority])

  return null
}