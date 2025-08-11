'use client'

import React from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  priority?: boolean
  className?: string
  fill?: boolean
  width?: number
  height?: number
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  priority = false,
  className = '',
  fill = false,
  width,
  height,
  onLoad,
  onError
}: OptimizedImageProps) {
  // Si l'image est locale et dans /images/, utiliser la version optimisée
  const optimizedSrc = src.startsWith('/images/') && !src.includes('/optimized/')
    ? src.replace('/images/', '/images/optimized/').replace('.png', '-optimized.png')
    : src

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      {...(fill ? { fill: true } : { width, height })}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      quality={85}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
      className={className}
      onLoad={onLoad}
      onError={(e) => {
        // Fallback à l'image originale si l'optimisée n'existe pas
        if (optimizedSrc !== src) {
          const target = e.target as HTMLImageElement
          target.src = src
        }
        onError?.()
      }}
    />
  )
}