'use client'

import dynamic from 'next/dynamic'

const SiargaoMap = dynamic(() => import('./SiargaoMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-black">Loading interactive map...</div>
    </div>
  )
})

export default function SiargaoMapWrapper() {
  return <SiargaoMap />
}