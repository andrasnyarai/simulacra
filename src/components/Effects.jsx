import React from 'react'
import { EffectComposer, Pixelation } from '@react-three/postprocessing'
import { animated, useSpring } from '@react-spring/three'

import { useStore } from '../useStore'
import { isMobile } from '../utils'

const AnimatedPixelation = animated(Pixelation)

const pixels = isMobile() ? 6 : 7

export function Effects() {
  const { isPlayerAlive } = useStore((state) => state)
  const { granularity } = useSpring({ granularity: isPlayerAlive ? 0 : pixels })

  return (
    <EffectComposer>
      <AnimatedPixelation granularity={granularity} />
    </EffectComposer>
  )
}
