import { useEffect, useRef } from 'react'
import { SPOTLIGHT_RADIUS } from '../../lib/constants'
import { VIDEO } from '../../lib/media'

interface RevealLayerProps {
  cursorX: number
  cursorY: number
  mediaTransform: string
}

/**
 * The hero's "spotlight" layer: a soft radial mask, painted on an offscreen
 * canvas and applied as a CSS mask, reveals the moving reveal.mp4 beneath the
 * still base image only where the cursor (or drift point) hovers.
 */
export default function RevealLayer({ cursorX, cursorY, mediaTransform }: RevealLayerProps) {
  const maskRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const maskEl = maskRef.current
    if (!canvas || !maskEl) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const gradient = ctx.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      SPOTLIGHT_RADIUS,
    )
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)')
    gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)')
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(cursorX, cursorY, SPOTLIGHT_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    const mask = `url(${canvas.toDataURL()})`
    maskEl.style.maskImage = mask
    maskEl.style.webkitMaskImage = mask
    maskEl.style.maskSize = '100% 100%'
    maskEl.style.webkitMaskSize = '100% 100%'
  }, [cursorX, cursorY])

  return (
    <>
      {/* Mask lives on the untransformed wrapper so the spotlight stays in
          viewport space while the video inside moves/scales with the base image. */}
      <div
        ref={maskRef}
        className="absolute inset-0 z-30 overflow-hidden"
        data-cursor="lens"
      >
        <video
          src={VIDEO.reveal}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center', transform: mediaTransform }}
        />
      </div>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ display: 'none' }}
      />
    </>
  )
}
