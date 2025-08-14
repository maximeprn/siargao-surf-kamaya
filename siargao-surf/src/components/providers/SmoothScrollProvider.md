# SmoothScrollProvider Documentation

## Vue d'ensemble

Le `SmoothScrollProvider` utilise la librairie **Lenis** pour créer un défilement fluide avec inertie, similaire aux sites primés (Awwwards). Il transforme le défilement natif du navigateur en une expérience plus cinématique et naturelle.

## Fonctionnalités

- ✅ **Défilement avec inertie** : Effet de décélération progressive
- ✅ **Easing sophistiqué** : Courbe d'animation personnalisée
- ✅ **Optimisé mobile** : Adapte automatiquement les paramètres selon le device
- ✅ **Performance** : Utilise requestAnimationFrame pour un rendu fluide
- ✅ **Contrôle programmatique** : Hook `useSmoothScroll` pour contrôler le scroll

## Configuration

### Paramètres Desktop
- **Duration** : 1.8s pour un effet très fluide
- **Wheel Multiplier** : 0.7 pour réduire la sensibilité
- **Smooth** : Activé pour l'effet d'inertie

### Paramètres Mobile
- **Duration** : 1.0s pour de meilleures performances
- **Smooth** : Désactivé (scroll natif plus performant)
- **Wheel Multiplier** : 1.0 (standard)

## Utilisation

### Configuration de base
Le provider est déjà intégré dans le layout principal :

```tsx
<SmoothScrollProvider>
  <App />
</SmoothScrollProvider>
```

### Contrôle programmatique

```tsx
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

function Component() {
  const { scrollTo, scrollToTop, scrollToBottom } = useSmoothScroll()

  const handleClick = () => {
    // Scroll vers un élément
    scrollTo('#section-id', { offset: -100, duration: 2 })
    
    // Scroll vers une position
    scrollTo(500, { duration: 1.5 })
    
    // Scroll vers le haut
    scrollToTop(2)
  }

  return <button onClick={handleClick}>Scroll</button>
}
```

### BackToTopButton
Un bouton "retour en haut" est automatiquement ajouté :
- Apparaît après 500px de scroll
- Animation Framer Motion
- Durée de scroll : 2s

## Easing personnalisé

L'easing utilisé combine ease-out-quart et ease-out-expo pour un effet très naturel :

```tsx
easing: (t: number) => {
  return t < 0.5 
    ? 8 * t * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 4) / 2
}
```

## Optimisations CSS

Le fichier `globals.css` inclut des optimisations :

```css
/* Désactiver le scroll natif */
html {
  scroll-behavior: auto;
}

/* Optimisations Lenis */
html.lenis {
  height: auto;
}

/* Accélération matérielle */
.smooth-scroll-element {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

## Désactiver sur certains éléments

Pour empêcher le smooth scroll sur certains éléments :

```tsx
<div data-lenis-prevent>
  {/* Le scroll sera natif ici */}
</div>
```

## Debug et inspection

Lenis est accessible globalement pour debug :

```javascript
// Dans la console du navigateur
window.lenis.scrollTo(500)
window.lenis.stop()
window.lenis.start()
```

## Respect des préférences utilisateur

Le système respecte automatiquement `prefers-reduced-motion` :

```css
@media (prefers-reduced-motion: reduce) {
  /* Les animations sont réduites */
}
```

## Performance

- **RAF optimisé** : Utilise requestAnimationFrame
- **Mobile adaptatif** : Désactive le smooth scroll sur mobile
- **Cleanup automatique** : Destruction propre du composant
- **No layout shifts** : N'impacte pas le CLS

## Comparaison avec d'autres solutions

| Feature | Lenis | locomotive-scroll | AOS |
|---------|-------|------------------|-----|
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Légèreté | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Contrôle | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Mobile | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

## Sites de référence utilisant Lenis

- Studio Freight
- Awwwards nominees
- Many award-winning portfolio sites

L'effet créé est celui qu'on retrouve sur les sites les plus primés, avec un défilement qui semble "coller" légèrement avant de se déplacer avec inertie.