'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  intensity?: 'subtle' | 'medium' | 'strong'
  delay?: number
  once?: boolean
}

export default function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  intensity = 'medium',
  delay = 0,
  once = false
}: ScrollRevealProps) {
  const ref = useRef(null)
  
  // Track scroll progress for this element
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.1"] // Trigger when element enters bottom 90% of viewport
  })

  // Define intensity values
  const intensityValues = {
    subtle: { distance: 20, opacity: [0, 1] },
    medium: { distance: 50, opacity: [0, 1] },
    strong: { distance: 100, opacity: [0, 1] }
  }

  const config = intensityValues[intensity]

  // Call hooks unconditionally and select values based on direction
  const yUp = useTransform(scrollYProgress, [0, 1], [config.distance, 0])
  const yDown = useTransform(scrollYProgress, [0, 1], [-config.distance, 0])
  const xLeft = useTransform(scrollYProgress, [0, 1], [config.distance, 0])
  const xRight = useTransform(scrollYProgress, [0, 1], [-config.distance, 0])
  const opacityQuick = useTransform(scrollYProgress, [0, 0.3], config.opacity)
  const opacityFade = useTransform(scrollYProgress, [0, 0.5], config.opacity)

  const transforms = (
    direction === 'up' ? { y: yUp, opacity: opacityQuick } :
    direction === 'down' ? { y: yDown, opacity: opacityQuick } :
    direction === 'left' ? { x: xLeft, opacity: opacityQuick } :
    direction === 'right' ? { x: xRight, opacity: opacityQuick } :
    { opacity: opacityFade }
  )

  return (
    <motion.div
      ref={ref}
      className={className}
      style={transforms}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  )
}