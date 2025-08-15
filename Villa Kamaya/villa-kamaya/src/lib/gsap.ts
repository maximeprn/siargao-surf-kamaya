import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);
}

// Default GSAP settings
gsap.defaults({
  ease: 'power2.out',
  duration: 1.2,
});

// Animation presets
export const animations = {
  fadeInUp: {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  },
  fadeInLeft: {
    x: -60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  },
  fadeInRight: {
    x: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  },
  scaleIn: {
    scale: 0.8,
    opacity: 0,
    duration: 1,
    ease: 'back.out(1.7)',
  },
  staggerContainer: {
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power2.out',
  },
};

// Scroll reveal utility
export const scrollReveal = (element: string | Element | null, animation: any = animations.fadeInUp) => {
  if (!element) return null;
  
  return gsap.fromTo(element, animation, {
    ...animation,
    y: 0,
    x: 0,
    scale: 1,
    opacity: 1,
    scrollTrigger: {
      trigger: element,
      start: 'top 90%',
      toggleActions: 'play none none reverse',
    },
  });
};

// Page transition animations
export const pageTransitions = {
  enter: (element: Element) => {
    return gsap.fromTo(
      element,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  },
  exit: (element: Element) => {
    return gsap.to(element, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.in',
    });
  },
};

export default gsap;
export { ScrollTrigger, TextPlugin, ScrollToPlugin };