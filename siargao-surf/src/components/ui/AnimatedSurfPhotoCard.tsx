'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

interface AnimatedSurfPhotoCardProps {
  src: string
  alt: string
  label?: string
}

export default function AnimatedSurfPhotoCard({ 
  src, 
  alt, 
  label = "Cloud 9" 
}: AnimatedSurfPhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  // Animations désactivées si prefers-reduced-motion
  const animations = shouldReduceMotion ? {} : {
    initial: { 
      opacity: 0, 
      scale: 1.05,
      filter: 'blur(8px)'
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    whileHover: {
      scale: 1.02,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div 
      className="relative overflow-hidden rounded-2xl aspect-[21/9] ring-1 ring-white/10 bg-[#0c2430] mb-20 cursor-pointer"
      {...animations}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image avec filtres */}
      <Image
        src={src}
        alt={alt}
        fill
        className={`
          absolute inset-0 h-full w-full object-cover
          object-[50%_42%]
          transition-all duration-700 ease-out
          ${isHovered 
            ? '[filter:saturate(.75)_contrast(1.1)_brightness(.9)]' 
            : '[filter:saturate(.85)_contrast(1.05)_brightness(.95)]'
          }
        `}
        priority
      />

      {/* Teinte qui s'intensifie au hover */}
      <motion.div 
        className="absolute inset-0 mix-blend-multiply bg-[#0e2b34]/45 transition-opacity duration-700"
        animate={{ 
          opacity: isHovered ? 0.6 : 0.45 
        }}
      />

      {/* Effet de givre qui remonte au hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(255,255,255,0.08) 0%, transparent 50%)',
        }}
        initial={{ y: '100%' }}
        animate={{ 
          y: isHovered ? '30%' : '100%' 
        }}
        transition={{ 
          duration: 0.7, 
          ease: "easeOut" 
        }}
      />

      {/* Reflet qui balaie au hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)',
        }}
        animate={{
          opacity: isHovered ? [0, 1, 0] : 0,
          x: isHovered ? ['-100%', '200%'] : '-100%'
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
        }}
      />

      {/* Fondu aux bords */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      />

      {/* Label avec animation */}
      <motion.div 
        className="absolute left-4 top-3 rounded-md bg-white/6 px-2 py-1 text-sm text-white/90 ring-1 ring-white/10 backdrop-blur-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: 0.5, duration: 0.5 }
        }}
        whileHover={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          transition: { duration: 0.2 }
        }}
      >
        {label}
      </motion.div>
    </motion.div>
  )
}