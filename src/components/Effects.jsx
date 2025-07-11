import React, { useState, useRef } from 'react'
import { EffectComposer, Pixelation, HueSaturation, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { animated, useSpring } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'

import { useStore } from '../useStore'
import { isMobile } from '../utils'

const AnimatedPixelation = animated(Pixelation)
const AnimatedHueSaturation = animated(HueSaturation)
const AnimatedBloom = animated(Bloom)
const AnimatedChromaticAberration = animated(ChromaticAberration)

const pixels = isMobile() ? 6 : 7

export function Effects() {
  const { isPlayerAlive } = useStore((state) => state)
  const currentPowerup = useStore((state) => state.currentPowerup)
  const [hueOffset, setHueOffset] = useState(0)
  const { camera } = useThree()

  // Camera movement tracking
  const lastCamPos = useRef(camera.position.toArray())
  const movementRef = useRef([0, 0, 0])
  const speedRef = useRef(0)

  // Spring for chromatic aberration offset
  const [{ chromaOffsetX, chromaOffsetY }, chromaApi] = useSpring(() => ({ chromaOffsetX: 0, chromaOffsetY: 0, config: { tension: 120, friction: 30 } }))

  useFrame((state) => {
    // Hue cycling for Mushroom
    if (currentPowerup?.type === 'Mushroom') {
      setHueOffset((state.clock.elapsedTime * 200) % 360)
    }
    // Camera movement calculation
    const [x, y, z] = camera.position.toArray()
    const [lx, ly, lz] = lastCamPos.current
    const dx = x - lx
    const dy = y - ly
    const dz = z - lz
    
    // Normalize speed calculation: use the maximum of X and Z movement
    // This ensures diagonal movement has the same intensity as cardinal directions
    const speedX = Math.abs(dx)
    const speedZ = Math.abs(dz)
    const speed = Math.max(speedX, speedZ) // Use max instead of sqrt(dx² + dz²)
    
    speedRef.current = speed
    movementRef.current = [dx, dy, dz]
    lastCamPos.current = [x, y, z]
    
    // Normalize direction
    let dirX = 0, dirY = 0
    if (speed > 0.0001) {
      dirX = dx / speed
      dirY = dz / speed // Use Z for Y offset for a top-down game
    }
    // Dynamic scale based on speed - higher speed = stronger effect
    const baseScale = 0.004
    const speedMultiplier = Math.min(speed * 2, 3) // cap at 3x for very high speeds
    const dynamicScale = baseScale * speedMultiplier
    const maxOffset = 0.02 // increased max for high speeds
    
    // Fix the color channel issue: invert Y offset to make blue appear ahead for vertical movement
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, dirX * speed * dynamicScale))
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, -dirY * speed * dynamicScale)) // Inverted Y offset
    
    chromaApi.start({ chromaOffsetX: offsetX, chromaOffsetY: offsetY })
  })

  // Only animate bloom intensity for Mushroom, otherwise use default
  const { granularity, hue, bloomIntensity, bloomSmoothing } = useSpring({ 
    granularity: isPlayerAlive ? 0 : pixels,
    hue: currentPowerup?.type === 'Mushroom' ? hueOffset / 360 : 0,
    bloomIntensity: currentPowerup?.type === 'Mushroom' ? 1.2 : 0.9,
    bloomSmoothing: currentPowerup?.type === 'Mushroom' ? 0.85 : 0.7,
  })

  return (
    <EffectComposer>
      <AnimatedPixelation granularity={granularity} />
      <AnimatedBloom 
        intensity={bloomIntensity}
        luminanceThreshold={0.5}
        luminanceSmoothing={bloomSmoothing}
      />
      <AnimatedChromaticAberration 
        offset-x={chromaOffsetX}
        offset-y={chromaOffsetY}
        radialModulation={false}
        modulationOffset={0.5}
      />
      {currentPowerup?.type === 'Mushroom' && (
        <AnimatedHueSaturation hue={hue} saturation={0.2} />
      )}
    </EffectComposer>
  )
}
