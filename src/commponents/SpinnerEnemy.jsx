import { Physics, useBox, useSphere, useSpring } from '@react-three/cannon'
import { MeshWobbleMaterial, Octahedron } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { animated } from '@react-spring/three'

import { ENEMY_GROUP } from '../groups'
import { lerp } from '../utils'

const Box = forwardRef((props, ref) => {
  useSphere(
    () => ({
      args: [0.5],
      linearDamping: 0.1,
      mass: 1,
      ...props,
      collisionFilterGroup: ENEMY_GROUP,
    }),
    ref
  )
  return (
    <Octahedron args={[0.5, 0]} ref={ref} uuid={'spinner-enemy-core'}>
      <meshBasicMaterial color={'yellow'} />
    </Octahedron>
  )
})

const Ball = forwardRef((props, ref) => {
  const [, api] = useSphere(() => ({ args: [0.5], mass: 1, type: 'Kinematic', collisionFilterGroup: ENEMY_GROUP, ...props }), ref)

  useFrame(({ clock }) => {
    if (clock.elapsedTime % Math.random() < 0.01) {
      //   api.applyTorque([lerp(Math.random(), -10, 10), lerp(Math.random(), -10, 10), lerp(Math.random(), -10, 10)])
      api.rotation.set(lerp(Math.random(), -15, 15), 0, lerp(Math.random(), -15, 15))
      api.velocity.set(lerp(Math.random(), -15, 15), 0, lerp(Math.random(), -15, 15))
    }
  })

  //   useFrame(({ mouse: { x, y }, viewport: { height, width } }) => position.set((x * width) / 2, (y * height) / 2, 0))
  return (
    <Octahedron args={[0.5, 0]} ref={ref} uuid={'spinner-enemy'}>
      <meshBasicMaterial color={'red'} />
    </Octahedron>
  )
})

export const SpinnerEnemy = (props) => {
  const [spinnerCoreRef, spinnerCoreApi] = useSphere(() => ({
    args: [0.5],
    linearDamping: 0.9,
    mass: 100,
    ...props,
    collisionFilterGroup: ENEMY_GROUP,
  }))
  const [spinnerRef, spinnerApi] = useSphere(() => ({
    args: [0.5],
    mass: 10,
    // type: 'Kinematic',
    collisionFilterGroup: ENEMY_GROUP,
    ...props,
  }))

  const [, , api] = useSpring(spinnerCoreRef, spinnerRef, { damping: 100, restLength: 1, stiffness: 1000 })

  useFrame(({ clock }) => {
    if (clock.elapsedTime % Math.random() < 0.01) {
      api.setRestLength(lerp(Math.random(), 1, 4))
      //   api.setStiffness(lerp(Math.random(), 1, 1000))

      spinnerCoreApi.rotation.set(lerp(Math.random(), -25, 25), 0, lerp(Math.random(), -25, 25))
      spinnerCoreApi.velocity.set(lerp(Math.random(), -25, 25), 0, lerp(Math.random(), -25, 25))
      spinnerApi.rotation.set(lerp(Math.random(), -15, 15), 0, lerp(Math.random(), -15, 15))
      spinnerApi.rotation.set(lerp(Math.random(), -15, 15), 0, lerp(Math.random(), -15, 15))
    }
  })

  return (
    <group>
      <Octahedron args={[0.5, 0]} ref={spinnerCoreRef} uuid={'spinner-enemy-core'}>
        <MeshWobbleMaterial color="red" speed={5} factor={50} />
        <animated.pointLight
          position={[0, 0.5, 0]}
          intensity={5}
          color="red"
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={10}
        />
      </Octahedron>

      <Octahedron args={[0.5, 0]} ref={spinnerRef} uuid={'spinner-enemy'}>
        <MeshWobbleMaterial color="red" speed={5} factor={50} />
        <animated.pointLight
          position={[0, 0.5, 0]}
          intensity={5}
          color="red"
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
          distance={10}
        />
      </Octahedron>
    </group>
  )
}
