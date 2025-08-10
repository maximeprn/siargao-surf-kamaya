import { siargaoSpotsComplete } from '@/lib/spot-configs'
import type { SpotMeta } from '@/lib/spot-configs'

interface SpotDetailsOverlayProps {
  spotName: string
}

export default function SpotDetailsOverlay({ spotName }: SpotDetailsOverlayProps) {
  const spotMeta = siargaoSpotsComplete[spotName] as SpotMeta | undefined
  
  if (!spotMeta) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
      {/* Skill Level */}
      <div>
        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Skill</div>
        <div className="text-sm font-medium capitalize">
          {spotMeta.minSkill}{spotMeta.minSkill !== spotMeta.maxSkill && ` - ${spotMeta.maxSkill}`}
        </div>
      </div>

      {/* Wave Size */}
      <div>
        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Best Size</div>
        <div className="text-sm font-medium">
          {spotMeta.optimalHeight[0]}-{spotMeta.optimalHeight[1]}m
        </div>
      </div>

      {/* Access */}
      <div>
        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Access</div>
        <div className="text-sm font-medium capitalize">
          {spotMeta.access?.replace('_', ' ')}
        </div>
      </div>

      {/* Bottom Type */}
      <div>
        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Bottom</div>
        <div className="text-sm font-medium capitalize">
          {spotMeta.bottomType?.replace('_', ' ').replace('reef', 'Reef')}
        </div>
      </div>
    </div>
  )
}