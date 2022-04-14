import React, { useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Box, OrbitControls, Sphere, Trail, Stars } from '@react-three/drei'
import { Physics, usePlane, useSphere, useBox, useContactMaterial, Debug } from '@react-three/cannon'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { animated, useSpring } from '@react-spring/three'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

extend({ EffectComposer, ShaderPass, SavePass, RenderPass, UnrealBloomPass })

export function Effects() {
  const { gl, camera, size, scene } = useThree()
  const composer = useRef()
  const aspect = useMemo(() => new THREE.Vector2(size.width, size.height), [size])
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  useFrame(() => composer.current.render(), 1)

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <unrealBloomPass attachArray="passes" args={[aspect, 1, 1, 1]} />
      {/* <shaderPass attachArray="passes" args={[FXAAShader]} material-uniforms-resolution-value={[1 / size.width, 1 / size.height]} /> */}
    </effectComposer>
  )
}

const FLOOR_GROUP = 1
const STAR_GROUP = 2
const COLLECTED_STAR_GROUP = 3
const PLAYER_GROUP = 4
const OBSTACLE_GROUP = 5

const ASphere = animated(Sphere)

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
    <Canvas camera={{ fov: 25, position: [0, 45, 10] }} shadows colorManagement onCreated={(state) => state.gl.setClearColor('black')}>
      <Stars />
      <OrbitControls />

      <Physics gravity={[0, -10, 0]}>
        {/* <Debug scale={1.1}> */}
        <PhyPlane color="hotpink" position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} args={[mapWidth, mapHeight, 0.1]} />

        <PhyPlane color="hotpink" position={[0, 0, -mapHeight / 2]} rotation={[0, 0, 0]} args={[mapWidth, 2, 0.1]} />
        <PhyPlane color="hotpink" position={[0, 0, mapHeight / 2]} rotation={[0, 0, 0]} args={[mapWidth, 2, 0.1]} />
        <PhyPlane color="hotpink" position={[-mapWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} args={[mapHeight, 2, 0.1]} />
        <PhyPlane color="hotpink" position={[mapWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} args={[mapHeight, 2, 0.1]} />

        {[...new Array(10)].map(() => {
          const offset = 2.5
          const width = mapWidth - offset
          const height = mapHeight - offset
          const x = lerp(Math.random(), -width / 2, width / 2)
          const z = lerp(Math.random(), -height / 2, height / 2)
          return <PhyBox position={[x, 2, z]} />
        })}

        {[...new Array(30)].map((_, i) => {
          const offset = 2.5
          const width = mapWidth - offset
          const height = mapHeight - offset
          const x = lerp(Math.random(), -width / 2, width / 2)
          const z = lerp(Math.random(), -height / 2, height / 2)
          return <Star position={[x, 1, z]} uuid={`star-${i}`} />
        })}

        {[...new Array(5)].map((_, i) => {
          const offset = 2.5
          const width = mapWidth - offset
          const height = mapHeight - offset
          const x = lerp(Math.random(), -width / 2, width / 2)
          const z = lerp(Math.random(), -height / 2, height / 2)
          return <Obstacle position={[x, 0.5, z]} uuid={`obstacle-${i}`} />
        })}

        <Player position={[0, 3, 0]} />
        {/* </Debug> */}
      </Physics>
      <ambientLight intensity={0.02} color="yellow" />
      <Effects />
    </Canvas>
  )
}

const planeMaterial = { name: 'bouncy', restitution: 11.1 }
const sphereMaterial = { name: 'plane', friction: 0.0001 }
const obstacleMaterial = { name: 'plane', friction: 0.0001 }

function PhyPlane({ args, color, ...props }) {
  const [ref] = useBox(() => ({ args, ...props, material: planeMaterial, collisionFilterGroup: FLOOR_GROUP }))

  return (
    <Box args={args} ref={ref} castShadow receiveShadow>
      <meshStandardMaterial color={color} />
    </Box>
  )
}

function Star(props) {
  const [collected, setCollected] = useState(false)
  const { scale } = useSpring({ scale: collected ? 0.1 : 1, config: { mass: 1, tension: 280, friction: 60 } })
  const [ref, api] = useSphere(() => ({
    args: [0.4],
    mass: 0.00001,
    ...props,
    allowSleep: true,
    collisionFilterGroup: STAR_GROUP,
    onCollide: (stuff) => {
      if (stuff.contact.bj.uuid === 'player') {
        setCollected(true)

        api.collisionFilterMask.set(FLOOR_GROUP)
        api.collisionFilterGroup.set(COLLECTED_STAR_GROUP)
        api.applyForce(
          stuff.contact.ni.map((n) => n / 500),
          [0, 0, 0]
        )

        setTimeout(() => api.position.set(0, -10, 0), 200)
        // console.log(api.collisionResponse.set(0))
        // api.position.set(0, -10, 0)
        // add removebody to lib
      }
    },
  }))

  return (
    <ASphere args={[0.4]} ref={ref} dispose={null} scale={scale} castShadow receiveShadow uuid={props.uuid}>
      <meshPhongMaterial color="yellow" shininess={100} emissive="orange" specular="pink" />
    </ASphere>
  )
}

function Obstacle(props) {
  const [ref, api] = useSphere(() => ({
    args: [0.4],
    mass: 1,
    ...props,
    material: obstacleMaterial,
    collisionFilterGroup: OBSTACLE_GROUP,
  }))

  useEffect(() => {
    api.velocity.set(lerp(Math.random(), -15, 15), 0, lerp(Math.random(), -15, 15))
  }, [])

  return (
    <Sphere args={[0.4]} ref={ref} dispose={null} uuid={props.uuid} castShadow receiveShadow>
      <meshPhongMaterial color="red" shininess={100000} emissive="black" />
    </Sphere>
  )
}

function Player(props) {
  const [alive, setAlive] = useState(true)
  const [lightIntensity, setLightIntensity] = useState(0.1)
  const { scale } = useSpring({ scale: alive ? 1 : 0.1 })
  const [ref, api] = useSphere(() => ({
    args: [0.5],
    mass: 2,
    ...props,
    collisionFilterGroup: PLAYER_GROUP,
    material: sphereMaterial,
    onCollide: (stuff) => {
      if (stuff.contact.bi.uuid.includes('obstacle')) {
        setAlive(false)

        api.collisionFilterMask.set(FLOOR_GROUP)
        api.mass.set(1)
        api.applyForce(
          stuff.contact.ni.map((n) => n * -1),
          [0, 0, 0]
        )

        setTimeout(() => api.position.set(0, -10, 0), 200)
      }

      if (stuff.contact.bi.uuid.includes('star')) {
        setLightIntensity((intensity) => intensity + 0.05)
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
    <>
      <Trail
        width={2} // Width of the line
        color={'white'} // Color of the line
        length={2} // Length of the line
        decay={1} // How fast the line fades away
        local={false} // Wether to use the target's world or local positions
        stride={0} // Min distance between previous and current point
        interval={1} // Number of frames to wait before next calculation
        target={undefined} // Optional target. This object will produce the trail.
        attenuation={(width) => width} // A function to define the width in each point along it.
      >
        <group ref={ref} uuid="player" dispose={null}>
          <ASphere args={[0.5]} scale={scale} castShadow receiveShadow>
            <meshBasicMaterial color="white" />
          </ASphere>
          <pointLight
            intensity={lightIntensity}
            castShadow
            shadow-mapSize-height={512}
            shadow-mapSize-width={512}
            distance={lightIntensity * 100}
            decay={lightIntensity * 10}
          />
        </group>
      </Trail>
    </>
  )
}

function PhyBox(props) {
  const [ref, api] = useBox(() => ({ args: [1, 1, 1], mass: 0.1, ...props }))

  return (
    <Box args={[1]} ref={ref} onClick={() => api.applyForce([0, 0, -100], [0, 0, 0])} castShadow receiveShadow>
      <meshPhongMaterial color="blue" shininess={100} emissive="#000138" />
    </Box>
  )
}
