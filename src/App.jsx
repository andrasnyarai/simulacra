import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Box, OrbitControls, Sphere, Plane } from '@react-three/drei'
import { Physics, usePlane, useSphere, useBox, useContactMaterial } from '@react-three/cannon'
import { Canvas, useFrame } from '@react-three/fiber'

function lerp(alpha, min, max) {
  return min * (1 - alpha) + max * alpha
}

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
  // add black hole and targets to guide into
  const mapWidth = 30
  const mapHeight = 15

  return (
    <Canvas camera={{ fov: 25, position: [0, 45, 10] }}>
      <OrbitControls />
      <Physics gravity={[0, -10, 0]}>
        <PhyPlane color="hotpink" position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[mapWidth, mapHeight, 0.1]} />

        <PhyPlane color="red" position={[0, 0, -mapHeight / 2]} rotation={[0, 0, 0]} args={[mapWidth, 2, 0.1]} />
        <PhyPlane color="blue" position={[0, 0, mapHeight / 2]} rotation={[0, 0, 0]} args={[mapWidth, 2, 0.1]} />
        <PhyPlane color="green" position={[-mapWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} args={[mapHeight, 2, 0.1]} />
        <PhyPlane color="yellow" position={[mapWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} args={[mapHeight, 2, 0.1]} />

        <PhyBox position={[2, 2, -2.5]} />
        <PhyBox position={[-2, 2, 2.5]} />
        <PhyBox position={[3, 1, -2]} />
        <PhyBox position={[-2, 2, -5]} />
        <PhyBox position={[-8, 2, -3.5]} />
        <PhyBox position={[7, 2, 6.5]} />
        <PhyBox position={[9, 2, -0.5]} />

        <Star position={[2, 2, 5]} />
        <Star position={[4, 2, 2]} />
        <Star position={[9, 2, 3]} />
        <Star position={[-5, 2, -1]} />
        <Star position={[-9, 2, -3]} />
        <Star position={[10, 2, -6]} />

        <Obstacle position={[1, 1, -3]} uuid="obstacle-1" />
        <Obstacle position={[5, 1, 6]} uuid="obstacle-2" />
        <Obstacle position={[10, 1, 1]} uuid="obstacle-3" />
        <Obstacle position={[-7, 1, 5]} uuid="obstacle-4" />
        <Obstacle position={[9, 1, -7]} uuid="obstacle-5" />

        <PhySphere position={[0, 3, -2.5]} />
      </Physics>
      <ambientLight intensity={0.3} />
      <pointLight intensity={0.8} position={[5, 0, 5]} />
    </Canvas>
  )
}

const planeMaterial = { name: 'bouncy', restitution: 11.1 }
const sphereMaterial = { name: 'plane', friction: 0.0001 }
const obstacleMaterial = { name: 'plane', friction: 0.0001 }

function PhyPlane({ args, color, ...props }) {
  const [ref] = useBox(() => ({ args, ...props, material: planeMaterial }))

  return (
    <Box args={args} ref={ref}>
      <meshStandardMaterial color={color} />
    </Box>
  )
}

function Star(props) {
  const [collected, setCollected] = useState(false)
  const [ref, api] = useSphere(() => ({
    args: [0.4],
    mass: 0.00001,
    ...props,

    onCollide: (stuff) => {
      if (stuff.contact.bj.uuid === 'player') {
        setCollected(true)
      }
    },
  }))

  return (
    !collected && (
      <Sphere args={[0.4]} ref={ref} dispose={null}>
        <meshBasicMaterial color="yellow" />
      </Sphere>
    )
  )
}

function Obstacle(props) {
  const [ref, api] = useSphere(() => ({
    args: [0.4],
    mass: 1,
    ...props,
    material: obstacleMaterial,
  }))

  useEffect(() => {
    console.log('runs')
    api.velocity.set(lerp(Math.random(), -15, 15), 0, lerp(Math.random(), -15, 15))
  }, [])

  return (
    <Sphere args={[0.4]} ref={ref} dispose={null} uuid={props.uuid}>
      <meshBasicMaterial color="red" />
    </Sphere>
  )
}

function PhySphere(props) {
  const [alive, setAlive] = useState(true)
  const [ref, api] = useSphere(() => ({
    args: [0.5],
    mass: 2,
    ...props,
    material: sphereMaterial,
    onCollide: (stuff) => {
      console.log(typeof stuff.contact.bi.uuid)
      if (stuff.contact.bi.uuid.includes('obstacle')) {
        setAlive(false)
      }
    },
  }))

  const up = useKeyPress('w')
  const down = useKeyPress('s')
  const left = useKeyPress('a')
  const right = useKeyPress('d')

  useContactMaterial(planeMaterial, sphereMaterial, { friction: 0, restitution: 0.5 })
  useContactMaterial(planeMaterial, obstacleMaterial, { friction: 0, restitution: 0.5 })

  useFrame(() => {
    let velocity = 30

    if (up.current && (right.current || left.current)) {
      velocity = velocity / Math.sqrt(2)
    }

    if (down.current && (right.current || left.current)) {
      velocity = velocity / Math.sqrt(2)
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
    alive && (
      <Sphere args={[0.5]} ref={ref} uuid="player" dispose={null}>
        <meshNormalMaterial />
      </Sphere>
    )
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
