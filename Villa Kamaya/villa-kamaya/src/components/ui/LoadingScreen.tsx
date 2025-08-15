'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  duration?: number;
}

export default function LoadingScreen({ onLoadingComplete, duration = 3000 }: LoadingScreenProps) {
  const [showContent, setShowContent] = useState(true);
  const [showScreen, setShowScreen] = useState(true);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Vérifier si la font Analogue est chargée
    const checkFont = () => {
      if (document.fonts) {
        document.fonts.ready.then(() => {
          setFontLoaded(true);
        });
      } else {
        // Fallback pour les navigateurs plus anciens
        setTimeout(() => setFontLoaded(true), 100);
      }
    };

    checkFont();

    // Faire disparaître le contenu (texte + logo) 500ms avant la fin
    const contentTimer = setTimeout(() => {
      setShowContent(false);
    }, duration - 500);

    // Faire disparaître l'écran à la fin
    const screenTimer = setTimeout(() => {
      setShowScreen(false);
      setTimeout(() => {
        onLoadingComplete();
      }, 500);
    }, duration);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(screenTimer);
    };
  }, [onLoadingComplete, duration]);

  if (!showScreen) {
    return (
      <div className="fixed inset-0 bg-[#1C3340] z-50 transition-opacity duration-500 opacity-0 pointer-events-none" />
    );
  }

  return (
    <div className="fixed inset-0 bg-[#1C3340] z-50 flex flex-col items-center justify-center">
      <div 
        className={`flex justify-center transition-opacity duration-500 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="animate-pulse-slow">
          <Image
            src="/assets/logos/loading-logo.svg"
            alt="Villa Kamaya Loading Logo"
            width={200}
            height={200}
            className="w-32 h-32 md:w-40 md:h-40"
          />
        </div>
      </div>
    </div>
  );
}