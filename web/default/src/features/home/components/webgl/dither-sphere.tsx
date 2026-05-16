import { useEffect, useRef } from 'react'
import { useTheme } from '@/context/theme-provider'
import { ditherVS, ditherFS } from './shaders'
import { hexToVec4, initGL, type GLContext } from './gl-utils'

const LIGHT_FRONT = '#fa8023FF'
const DARK_FRONT = '#DF3F00FF'

export function DitherSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLContext | null>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = initGL(canvas, ditherVS, ditherFS)
    if (!ctx) return
    glRef.current = ctx

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      const { gl, prog } = ctx
      gl.viewport(0, 0, canvas.width, canvas.height)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      const dark = document.documentElement.classList.contains('dark')
      const frontColor = dark ? DARK_FRONT : LIGHT_FRONT

      gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), canvas.width, canvas.height)
      gl.uniform4fv(gl.getUniformLocation(prog, 'u_colorFront'), hexToVec4(frontColor))
      gl.uniform4fv(gl.getUniformLocation(prog, 'u_colorBack'), hexToVec4('#00000000'))
      gl.uniform1f(gl.getUniformLocation(prog, 'u_scale'), 0.5)
      gl.uniform1f(gl.getUniformLocation(prog, 'u_pxSize'), 3.0 * dpr)
      gl.uniform1f(gl.getUniformLocation(prog, 'u_time'), 600.0)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    draw()

    const onResize = () => draw()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    const ctx = glRef.current
    if (!ctx) return
    const { gl, prog } = ctx
    const dpr = Math.min(window.devicePixelRatio, 2)
    const rect = canvasRef.current!.getBoundingClientRect()
    canvasRef.current!.width = Math.round(rect.width * dpr)
    canvasRef.current!.height = Math.round(rect.height * dpr)
    gl.viewport(0, 0, canvasRef.current!.width, canvasRef.current!.height)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const dark = document.documentElement.classList.contains('dark')
    const frontColor = dark ? DARK_FRONT : LIGHT_FRONT

    gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), canvasRef.current!.width, canvasRef.current!.height)
    gl.uniform4fv(gl.getUniformLocation(prog, 'u_colorFront'), hexToVec4(frontColor))
    gl.uniform4fv(gl.getUniformLocation(prog, 'u_colorBack'), hexToVec4('#00000000'))
    gl.uniform1f(gl.getUniformLocation(prog, 'u_scale'), 0.5)
    gl.uniform1f(gl.getUniformLocation(prog, 'u_pxSize'), 3.0 * dpr)
    gl.uniform1f(gl.getUniformLocation(prog, 'u_time'), 600.0)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }, [resolvedTheme])

  return (
    <canvas
      ref={canvasRef}
      id="dither-canvas"
      className="pointer-events-none absolute bottom-[15%] right-[5%] h-[80vh] w-[80vh] max-h-[900px] max-w-[900px] opacity-0"
      style={{ animation: 'fadeIn 400ms ease forwards 400ms' }}
    />
  )
}
