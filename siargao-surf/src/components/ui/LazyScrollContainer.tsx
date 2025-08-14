'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface LazyScrollContainerProps {
  children: React.ReactNode
  className?: string
  animation?: 'fade' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'none'
  delay?: number
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export default function LazyScrollContainer({
  children,
  className = '',
  animation = 'fade',
  delay = 0,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  once = true
}: LazyScrollContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const [isVisible, setIsVisible] = useState(false)

  const animationVariants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slideUp: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 }
    },
    slideLeft: {
      hidden: { opacity: 0, x: 30 },
      visible: { opacity: 1, x: 0 }
    },
    slideRight: {
      hidden: { opacity: 0, x: -30 },
      visible: { opacity: 1, x: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 }
    },
    none: {
      hidden: {},
      visible: {}
    }
  }

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          controls.start('visible')
          
          if (once) {
            observer.unobserve(entry.target)
          }
        } else if (!entry.isIntersecting && !once) {
          setIsVisible(false)
          controls.start('hidden')
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
  }, [controls, threshold, rootMargin, once, isVisible])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={animationVariants[animation]}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  )
}