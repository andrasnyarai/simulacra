import React from 'react'
import { EffectComposer, Pixelation } from '@react-three/postprocessing'
import { animated, useSpring } from '@react-spring/three'

import { useStore } from '../useStore'

const AnimatedPixelation = animated(Pixelation)

export function Effects() {
  const { isPlayerAlive } = useStore((state) => state)
  const { granularity } = useSpring({ granularity: isPlayerAlive ? 0 : 7 })

  return (
    <EffectComposer>
      <AnimatedPixelation granularity={granularity} />
    </EffectComposer>
  )
}
