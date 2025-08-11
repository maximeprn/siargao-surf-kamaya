// Image CDN URLs for optimal performance
// Ces URLs pointent vers des CDN edge locations pour un chargement ultra-rapide

export const CDN_IMAGES = {
  // GitHub direct (fonctionne immédiatement)
  cloudNine: 'https://raw.githubusercontent.com/maximeprn/siargao-surf-kamaya/main/siargao-surf/public/images/CloudNine.webp',
  
  // TwicPics à utiliser une fois configuré :
  // cloudNine: 'https://kamaya.twic.pics/github/CloudNine.webp?twic=v1/resize=1920/quality=85',
  
  // Option 2: Utiliser Imgix (plus rapide mais payant)
  // cloudNine: 'https://YOUR_SUBDOMAIN.imgix.net/CloudNine.webp?auto=format,compress&w=1920',
  
  // Option 3: Utiliser Bunny CDN (très économique)
  // cloudNine: 'https://YOUR_PULL_ZONE.b-cdn.net/CloudNine.webp',
  
  // Option 4: GitHub CDN (gratuit, utiliser jsdelivr)
  // cloudNine: 'https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/images/CloudNine.webp',
}

// Pour tester immédiatement avec une image optimisée publique
export const DEMO_CDN_IMAGES = {
  // Image de test depuis Unsplash (déjà optimisée et sur CDN)
  cloudNine: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1920&q=75&auto=format'
}