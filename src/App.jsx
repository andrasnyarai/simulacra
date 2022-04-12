import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Box, OrbitControls, Sphere, Plane } from '@react-three/drei'
import { Physics, usePlane, useSphere, useBox, useContactMaterial } from '@react-three/cannon'
import { Canvas, useFrame } from '@react-three/fiber'

function useKeyPress(targetKey) {
  const keyPressed = useRef(false)

  function downHandler({ key }) {
    if (key === targetKey) {
      keyPressed.current = true
    }
  }
  const upHandler = ({ key }) => {
    if (key === targetKey) {
      keyPressed.current = false
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [])
  return keyPressed
}

export default function App() {
  // add shadows
  return (
    <Canvas camera={{ fov: 25, position: [0, 45, 10] }}>
      <OrbitControls />
      <Physics gravity={[0, -10, 0]}>
        <PhyPlane color="hotpink" position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[10, 10, 0.1]} />

        <PhyPlane color="red" position={[0, 0, -5]} rotation={[0, 0, 0]} args={[10, 2, 0.1]} />
        <PhyPlane color="blue" position={[0, 0, 5]} rotation={[0, 0, 0]} args={[10, 2, 0.1]} />
        <PhyPlane color="green" position={[-5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} args={[10, 2, 0.1]} />
        <PhyPlane color="yellow" position={[5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} args={[10, 2, 0.1]} />

        <PhyBox position={[2, 2, -2.5]} />
        <PhyBox position={[-2, 2, 2.5]} />
        <PhyBox position={[3, 1, -2]} />
        <PhyBox position={[-2, 2, -0.5]} />

        <PhySphere position={[0, 3, -2.5]} />
      </Physics>
      <ambientLight intensity={0.3} />
      <pointLight intensity={0.8} position={[5, 0, 5]} />
    </Canvas>
  )
}

const planeMaterial = { name: 'bouncy', restitution: 11.1 }
const sphereMaterial = { name: 'plane', friction: 0.0001 }

function PhyPlane({ args, color, ...props }) {
  const [ref] = useBox(() => ({ args, ...props, material: planeMaterial }))

  return (
    <Box args={args} ref={ref}>
      <meshStandardMaterial color={color} />
    </Box>
  )
}

function PhySphere(props) {
  const [ref, api] = useSphere(() => ({ args: [0.5], mass: 2, ...props, material: sphereMaterial }))

  const up = useKeyPress('w')
  const down = useKeyPress('s')
  const left = useKeyPress('a')
  const right = useKeyPress('d')

  useContactMaterial(planeMaterial, sphereMaterial, { friction: 0, restitution: 0.5 })

  useFrame(() => {
    let velocity = 20

    if (up.current && (right.current || left.current)) {
      velocity = 20 / Math.sqrt(2)
    }

    if (down.current && (right.current || left.current)) {
      velocity = 20 / Math.sqrt(2)
    }

    if (up.current) {
      // api.velocity.set(0, 0, -1)
      api.applyForce([0, 0, -velocity], [0, 0, 0])
    }
    if (down.current) {
      // api.velocity.set(0, 0, 1)
      api.applyForce([0, 0, velocity], [0, 0, 0])
    }
    if (left.current) {
      // api.velocity.set(-1, 0, 0)
      api.applyForce([-velocity, 0, 0], [0, 0, 0])
    }
    if (right.current) {
      // api.velocity.set(1, 0, 0)
      api.applyForce([velocity, 0, 0], [0, 0, 0])
    }
  })

  return (
    <Sphere args={[0.5]} ref={ref}>
      <meshNormalMaterial />
    </Sphere>
  )
}

function PhyBox(props) {
  const [ref, api] = useBox(() => ({ args: [1, 1, 1], mass: 0.1, ...props }))

  return (
    <Box args={[1]} ref={ref} onClick={() => api.applyForce([0, 0, -100], [0, 0, 0])}>
      <meshNormalMaterial />
    </Box>
  )
}
