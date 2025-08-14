'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollToTop } = useSmoothScroll()

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scrollToTop(2)}
          className="fixed bottom-8 right-8 z-50 p-3 bg-glass border border-glass rounded-full backdrop-blur-sm hover:bg-theme-primary/20 transition-colors duration-300"
          aria-label="Retour en haut"
        >
          <ChevronUp className="w-6 h-6 text-theme-primary" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}