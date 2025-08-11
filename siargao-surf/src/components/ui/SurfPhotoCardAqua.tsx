'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { StaticImageData } from 'next/image'

interface SurfPhotoCardAquaProps {
  src: string | StaticImageData
  label?: string
  causticsOpacity?: number // intensité des caustiques
  children?: React.ReactNode // Pour les spot details
}

export default function SurfPhotoCardAqua({
  src,
  label = "",
  causticsOpacity = 0.28,
  children,
}: SurfPhotoCardAquaProps) {
  const [loaded, setLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <>
      {/* Keyframes pour les animations */}
      <style jsx>{`
        @keyframes causticsShift {
          0%   { transform: translateX(-10%) translateY(0) rotate(0deg); }
          50%  { transform: translateX(10%) translateY(-3%) rotate(0.4deg); }
          100% { transform: translateX(-10%) translateY(0) rotate(0deg); }
        }
        @keyframes raysRotate {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-ok { animation: none !important; }
        }
      `}</style>

      <div
        className="group relative overflow-hidden rounded-2xl aspect-[21/9] ring-1 ring-white/10 bg-[#091c23] mb-20"
        aria-label={label || "Surf photo"}
      >
        {/* Placeholder de chargement */}
        {!loaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f28] to-[#122b35] animate-pulse" />
        )}
        
        {/* Image avec Next.js Image */}
        <div className={`absolute inset-0 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src={src}
            alt={label || "Surf photo"}
            fill
            onLoad={() => setLoaded(true)}
            onError={() => setImageError(true)}
            className={[
              "h-full w-full object-cover object-[50%_42%]",
              "transition-transform duration-300 ease-out",
              "motion-reduce:transition-none",
              loaded
                ? "scale-100 blur-0 [filter:saturate(.9)_contrast(1.05)_brightness(.96)]"
                : "scale-105 blur-md",
              "group-hover:scale-[1.01] motion-reduce:group-hover:scale-100",
            ].join(" ")}
            priority={true}
            sizes="100vw"
            quality={75}
          />
        </div>

        {/* Teintes aquatiques (radiales, très soft) */}
        <div
          className="absolute inset-0 mix-blend-multiply pointer-events-none"
          style={{
            background:
              "radial-gradient(120% 80% at 20% -10%, rgba(0, 153, 170, .30) 0%, rgba(0,153,170,0) 55%)," +
              "radial-gradient(100% 80% at 90% 100%, rgba(6, 43, 52, .40) 0%, rgba(6,43,52,0) 60%)",
          }}
        />

        {/* Couche de caustiques (déplacement lent, blend soft-light) */}
        <div
          className="absolute inset-[-10%] pointer-events-none motion-ok"
          style={{
            opacity: causticsOpacity,
            mixBlendMode: "soft-light",
            filter: "blur(8px) contrast(1.2) brightness(1.15)",
            backgroundImage:
              "radial-gradient(80px 50px at 15% 20%, rgba(255,255,255,.75) 0, rgba(255,255,255,0) 60%)," +
              "radial-gradient(110px 70px at 65% 35%, rgba(255,255,255,.7) 0, rgba(255,255,255,0) 60%)," +
              "radial-gradient(90px 60px at 30% 75%, rgba(255,255,255,.65) 0, rgba(255,255,255,0) 60%)",
            backgroundRepeat: "no-repeat",
            animation: loaded ? "causticsShift 14s ease-in-out infinite" : "none",
          }}
        />

        {/* Rayons doux (rotation lente), masqués sur haut pour rester subtil */}
        <div
          className="absolute inset-0 pointer-events-none motion-ok"
          style={{
            opacity: 0.10,
            mixBlendMode: "screen",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 45%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 45%)",
            background:
              "conic-gradient(from 0deg at 75% -10%, rgba(255,255,255,.75) 0 10deg, transparent 12deg 360deg)",
            animation: loaded ? "raysRotate 28s linear infinite" : "none",
          }}
        />


        {/* Reflet subtil au hover (balayage léger) */}
        <div
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-130%] transition-transform duration-500 ease-out group-hover:translate-x-[230%] motion-reduce:hidden"
        />

        {/* Masque sombre pour les spot details */}
        {children && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />
        )}

        {/* Spot details au-dessus de la photo */}
        {children && (
          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
            {children}
          </div>
        )}

        {/* Légende */}
        {label && !children && (
          <div className="absolute left-4 top-3 rounded-md bg-white/6 px-2 py-1 text-sm text-white/90 ring-1 ring-white/10 backdrop-blur-sm">
            {label}
          </div>
        )}
      </div>
    </>
  )
}