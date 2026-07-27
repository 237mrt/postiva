import { useEffect, useRef, useState } from 'react'
import PixelCat from './PixelCat'

const CAT_WIDTH = 76
const CAT_HEIGHT = 61
const SCREEN_MARGIN = 12

const clamp = (value, minimum, maximum) => {
  return Math.min(Math.max(value, minimum), maximum)
}

function FloatingCat() {
  const catElementRef = useRef(null)

  const positionRef = useRef({
    x: 30,
    y: 180
  })

  const velocityRef = useRef({
    x: 0,
    y: 0
  })

  const targetRef = useRef({
    x: 250,
    y: 180
  })

  const mouseRef = useRef({
    x: -1000,
    y: -1000
  })

  const nextWanderTimeRef = useRef(0)
  const petEndTimeRef = useRef(0)

  const moodRef = useRef('walking')
  const facingRef = useRef('right')

  const [mood, setMood] = useState('walking')
  const [facing, setFacing] = useState('right')
  const [heartBurst, setHeartBurst] = useState(0)

  useEffect(() => {
    const updateMood = (nextMood) => {
      if (moodRef.current === nextMood) {
        return
      }

      moodRef.current = nextMood
      setMood(nextMood)
    }

    const updateFacing = (nextFacing) => {
      if (facingRef.current === nextFacing) {
        return
      }

      facingRef.current = nextFacing
      setFacing(nextFacing)
    }

    const createRandomTarget = () => {
      const maximumX = Math.max(SCREEN_MARGIN, window.innerWidth - CAT_WIDTH - SCREEN_MARGIN)

      const maximumY = Math.max(SCREEN_MARGIN, window.innerHeight - CAT_HEIGHT - SCREEN_MARGIN)

      targetRef.current = {
        x: SCREEN_MARGIN + Math.random() * (maximumX - SCREEN_MARGIN),

        y: SCREEN_MARGIN + Math.random() * (maximumY - SCREEN_MARGIN)
      }

      nextWanderTimeRef.current = performance.now() + 2000 + Math.random() * 3500
    }

    const handleMouseMove = (event) => {
      mouseRef.current = {
        x: event.clientX,
        y: event.clientY
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = {
        x: -1000,
        y: -1000
      }
    }

    const keepCatInsideScreen = () => {
      const maximumX = Math.max(SCREEN_MARGIN, window.innerWidth - CAT_WIDTH - SCREEN_MARGIN)

      const maximumY = Math.max(SCREEN_MARGIN, window.innerHeight - CAT_HEIGHT - SCREEN_MARGIN)

      positionRef.current.x = clamp(positionRef.current.x, SCREEN_MARGIN, maximumX)

      positionRef.current.y = clamp(positionRef.current.y, SCREEN_MARGIN, maximumY)
    }

    window.addEventListener('mousemove', handleMouseMove)

    document.addEventListener('mouseleave', handleMouseLeave)

    window.addEventListener('resize', keepCatInsideScreen)

    createRandomTarget()

    let animationFrameId
    let previousTime = performance.now()

    const animateCat = (currentTime) => {
      const deltaTime = Math.min((currentTime - previousTime) / 1000, 0.033)

      previousTime = currentTime

      const position = positionRef.current
      const velocity = velocityRef.current
      const mouse = mouseRef.current

      const catCenterX = position.x + CAT_WIDTH / 2

      const catCenterY = position.y + CAT_HEIGHT / 2

      const mouseDistanceX = mouse.x - catCenterX

      const mouseDistanceY = mouse.y - catCenterY

      const mouseDistance = Math.hypot(mouseDistanceX, mouseDistanceY)

      const isBeingPetted = currentTime < petEndTimeRef.current

      let target = targetRef.current
      let movementSpeed = 48

      if (isBeingPetted) {
        updateMood('happy')

        velocity.x *= 0.84
        velocity.y *= 0.84
      } else if (mouseDistance < 230) {
        updateMood('curious')

        target = {
          x: mouse.x - CAT_WIDTH / 2,
          y: mouse.y - CAT_HEIGHT / 2
        }

        /*
         * Fare çok yakındaysa kedi durur.
         * Biraz uzaktaysa fareye doğru yürür.
         */
        movementSpeed = mouseDistance < 72 ? 0 : 95
      } else {
        updateMood('walking')

        const targetDistance = Math.hypot(target.x - position.x, target.y - position.y)

        if (currentTime > nextWanderTimeRef.current || targetDistance < 18) {
          createRandomTarget()
          target = targetRef.current
        }
      }

      if (!isBeingPetted) {
        const distanceX = target.x - position.x

        const distanceY = target.y - position.y

        const distance = Math.hypot(distanceX, distanceY)

        const desiredVelocityX = distance > 1 ? (distanceX / distance) * movementSpeed : 0

        const desiredVelocityY = distance > 1 ? (distanceY / distance) * movementSpeed : 0

        const smoothMovement = 1 - Math.exp(-6 * deltaTime)

        velocity.x += (desiredVelocityX - velocity.x) * smoothMovement

        velocity.y += (desiredVelocityY - velocity.y) * smoothMovement
      }

      position.x += velocity.x * deltaTime

      position.y += velocity.y * deltaTime

      const maximumX = Math.max(SCREEN_MARGIN, window.innerWidth - CAT_WIDTH - SCREEN_MARGIN)

      const maximumY = Math.max(SCREEN_MARGIN, window.innerHeight - CAT_HEIGHT - SCREEN_MARGIN)

      position.x = clamp(position.x, SCREEN_MARGIN, maximumX)

      position.y = clamp(position.y, SCREEN_MARGIN, maximumY)

      if (Math.abs(velocity.x) > 4) {
        updateFacing(velocity.x < 0 ? 'left' : 'right')
      }

      if (catElementRef.current) {
        catElementRef.current.style.transform =
          `translate3d(` + `${position.x}px, ` + `${position.y}px, 0)`
      }

      animationFrameId = window.requestAnimationFrame(animateCat)
    }

    animationFrameId = window.requestAnimationFrame(animateCat)

    return () => {
      window.cancelAnimationFrame(animationFrameId)

      window.removeEventListener('mousemove', handleMouseMove)

      document.removeEventListener('mouseleave', handleMouseLeave)

      window.removeEventListener('resize', keepCatInsideScreen)
    }
  }, [])

  const handlePetCat = () => {
    petEndTimeRef.current = performance.now() + 1600

    setHeartBurst((currentValue) => currentValue + 1)
  }

  return (
    <button
      ref={catElementRef}
      type="button"
      className={`floating-cat ` + `floating-cat-${mood} ` + `floating-cat-facing-${facing}`}
      style={{
        transform: 'translate3d(30px, 180px, 0)'
      }}
      aria-label="Postiva kedisini sev"
      title="Beni sev!"
      onClick={handlePetCat}
    >
      <PixelCat />

      {heartBurst > 0 && (
        <span key={heartBurst} className="floating-cat-hearts" aria-hidden="true">
          <span>♥</span>
          <span>♥</span>
          <span>♥</span>
        </span>
      )}

      <span className="floating-cat-status" aria-hidden="true">
        {mood === 'happy' && '♥'}

        {mood === 'curious' && '?'}

        {mood === 'walking' && ''}
      </span>
    </button>
  )
}

export default FloatingCat
