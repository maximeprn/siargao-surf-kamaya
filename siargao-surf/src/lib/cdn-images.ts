// Image CDN URLs for optimal performance
// Ces URLs pointent vers des CDN edge locations pour un chargement ultra-rapide

export const CDN_IMAGES = {
  // Images des spots Siargao - format optimisé 4:2.2 ratio, 1920px width
  'cloud-9': '/images/cloud-9.webp',
  'quicksilver': '/images/quicksilver.webp', 
  'stimpys': '/images/stimpys.webp',
  'rock-island': '/images/rock-island.webp',
  'cemetery': '/images/cemetery.webp',
  'jacking-horse': '/images/jacking-horse.webp',
  'tuason': '/images/tuason.webp',
  'daku-reef': '/images/daku-reef.webp',
  'pacifico': '/images/pacifico.webp',
  'salvacion': '/images/salvacion.webp',
  'philippine-deep': '/images/philippine-deep.webp',
  'ocean-9': '/images/ocean-9.webp',
  
  // Image par défaut pour fallback
  'default': '/images/cloud-9.webp',
  
  // Legacy pour compatibilité
  cloudNine: '/images/cloud-9.webp',
}

// Fonction pour obtenir l'image d'un spot dynamiquement
export function getSpotImage(spotName: string): string {
  // Convertir le nom du spot en clé (ex: "Cloud 9" → "cloud-9")
  const spotKey = spotName
    .toLowerCase()
    .replace(/\s+/g, '-')         // Espaces → tirets
    .replace(/[^a-z0-9-]/g, '')   // Garder seulement lettres, chiffres, tirets
  
  // Retourner l'image correspondante ou fallback
  return CDN_IMAGES[spotKey as keyof typeof CDN_IMAGES] || CDN_IMAGES.default
}

// Pour tester immédiatement avec une image optimisée publique
export const DEMO_CDN_IMAGES = {
  // Image de test depuis Unsplash (déjà optimisée et sur CDN)
  cloudNine: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920&q=75&auto=format'
}