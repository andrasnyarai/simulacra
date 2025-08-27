import { useRef, useEffect } from 'react'
import { useSpring } from '@react-spring/three'
import { runExplosionSpring } from '../../utils'

export function useEnemyDeathEffect(destroyed, color, api, deathFlashColor) {
  const prevDestroyed = useRef(false)
  const [spring, apiSpring] = useSpring(() => ({
    scaleY: 1,
    scale: 1,
    color: color,
    emissive: color,
    emissiveIntensity: 0.2,
    opacity: 1,
    config: { duration: 200 },
  }))

  useEffect(() => {
    let cancelled = false;
    async function runExplosion() {
      await runExplosionSpring(apiSpring, color, deathFlashColor || '#fff');
    }
    if (destroyed && !prevDestroyed.current) {
      prevDestroyed.current = true;
      if (api && api.collisionFilterMask) api.collisionFilterMask.set(0);
      runExplosion();
    }
    if (!destroyed) {
      prevDestroyed.current = false;
      apiSpring.start({ scaleY: 1, scale: 1, color: color, emissive: color, emissiveIntensity: 0.2, opacity: 1, immediate: true });
    }
    return () => { cancelled = true; };
  }, [destroyed, color, apiSpring, api, deathFlashColor])

  return [spring, apiSpring]
} 