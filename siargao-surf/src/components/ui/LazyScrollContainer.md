# LazyScrollContainer Documentation

## Vue d'ensemble

Le `LazyScrollContainer` est un composant React léger qui utilise l'Intersection Observer API pour déclencher des animations Framer Motion lorsque les éléments entrent dans le viewport. Il est conçu pour être performant et s'intègre parfaitement avec le système de thème existant de l'application.

## Utilisation de base

```tsx
import LazyScrollContainer from '@/components/ui/LazyScrollContainer'

// Animation simple de fade
<LazyScrollContainer>
  <div>Contenu qui apparaît en fondu</div>
</LazyScrollContainer>

// Animation personnalisée avec délai
<LazyScrollContainer animation="slideUp" delay={0.3}>
  <section>Contenu qui glisse vers le haut</section>
</LazyScrollContainer>
```

## Props disponibles

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `React.ReactNode` | - | Le contenu à animer |
| `className` | `string` | `''` | Classes CSS supplémentaires |
| `animation` | `'fade' \| 'slideUp' \| 'slideLeft' \| 'slideRight' \| 'scale' \| 'none'` | `'fade'` | Type d'animation |
| `delay` | `number` | `0` | Délai en secondes avant l'animation |
| `threshold` | `number` | `0.1` | Pourcentage de visibilité pour déclencher l'animation |
| `rootMargin` | `string` | `'0px 0px -50px 0px'` | Marge pour l'Intersection Observer |
| `once` | `boolean` | `true` | Si true, l'animation ne se joue qu'une fois |

## Types d'animations

### `fade`
Animation d'opacité simple (0 → 1)

### `slideUp`
Glissement vers le haut avec fondu (opacity: 0, y: 30 → opacity: 1, y: 0)

### `slideLeft`
Glissement vers la gauche avec fondu (opacity: 0, x: 30 → opacity: 1, x: 0)

### `slideRight`
Glissement vers la droite avec fondu (opacity: 0, x: -30 → opacity: 1, x: 0)

### `scale`
Effet de zoom avec fondu (opacity: 0, scale: 0.95 → opacity: 1, scale: 1)

### `none`
Aucune animation (utile pour désactiver temporairement)

## Exemples avancés

### Animation avec paramètres personnalisés
```tsx
<LazyScrollContainer
  animation="slideUp"
  delay={0.5}
  threshold={0.3}
  rootMargin="0px 0px -100px 0px"
  once={false}
>
  <div>Contenu avec animation personnalisée</div>
</LazyScrollContainer>
```

### Utilisation avec le système de glassmorphisme
```tsx
<LazyScrollContainer animation="scale" delay={0.2}>
  <section className="bg-glass border border-glass rounded-2xl p-8 backdrop-blur-sm">
    <h2 className="text-2xl font-semibold text-theme-primary mb-4">Titre</h2>
    <p className="text-theme-muted">Contenu avec effet glassmorphisme</p>
  </section>
</LazyScrollContainer>
```

## Hook useInViewport

Pour des cas d'usage plus avancés, vous pouvez utiliser le hook `useInViewport` :

```tsx
import { useInViewport } from '@/hooks/useInViewport'
import { motion } from 'framer-motion'

function CustomComponent() {
  const { ref, isInView, hasBeenInView } = useInViewport({
    threshold: 0.2,
    triggerOnce: true
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6 }}
    >
      Contenu avec animation personnalisée
    </motion.div>
  )
}
```

## Optimisations de performance

- **Intersection Observer** : Utilise l'API native du navigateur pour un suivi efficace
- **Unobserve automatique** : Arrête l'observation après la première apparition (par défaut)
- **SSR friendly** : Vérifie la disponibilité de `window` avant d'initialiser
- **Cleanup automatique** : Nettoie les observers lors du démontage du composant

## Bonnes pratiques

1. **Utilisez `once: true`** pour les animations qui ne doivent se jouer qu'une fois
2. **Ajustez `rootMargin`** pour déclencher l'animation avant que l'élément soit complètement visible
3. **Utilisez des délais échelonnés** pour créer des effets de cascade
4. **Testez sur mobile** pour vous assurer que les animations sont fluides

## Intégration avec le thème

Le composant s'intègre parfaitement avec le système de thème existant :

```tsx
<LazyScrollContainer animation="slideLeft">
  <div className="bg-glass border border-glass text-theme-primary">
    Contenu avec thème adaptatif
  </div>
</LazyScrollContainer>
```

## Configuration recommandée

Pour desktop, ces paramètres offrent une expérience optimale :

```tsx
<LazyScrollContainer
  animation="slideUp"
  delay={0.1}
  threshold={0.1}
  rootMargin="0px 0px -50px 0px"
  once={true}
>
  {children}
</LazyScrollContainer>
```