import { useEffect, useRef } from 'react'
import { useTheme } from '@/context/theme-provider'
import { grainVS, grainFS } from './shaders'
import { hexToVec4, initGL, type GLContext } from './gl-utils'

const LIGHT_COLORS = ['#fcfc51FF', '#ffa057FF', '#7A2A0020']
const DARK_COLORS = ['#39BE1CFF', '#9c2f05FF', '#7A2A0000']
const MAX_PIXEL_COUNT = 1920 * 1080

export function GrainGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<GLContext | null>(null)
  const frameRef = useRef<number>(0)
  const timeRef = useRef(0)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = initGL(canvas, grainVS, grainFS)
    if (!gl) return
    glRef.current = gl

    const resizeGrain = () => {
      const rect = canvas.parentElement!.getBoundingClientRect()
      let dpr = Math.min(window.devicePixelRatio, 2)
      if (rect.width * rect.height * dpr * dpr > MAX_PIXEL_COUNT) {
        dpr = Math.sqrt(MAX_PIXEL_COUNT / (rect.width * rect.height))
      }
      dpr = Math.max(dpr, 1)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      gl.gl.viewport(0, 0, canvas.width, canvas.height)
    }

    resizeGrain()

    const draw = () => {
      const { gl, prog } = glRef.current!
      const dark = document.documentElement.classList.contains('dark')
      const colors = dark ? DARK_COLORS : LIGHT_COLORS

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(gl.getUniformLocation(prog, 'u_time'), timeRef.current / 1000.0)
      gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), canvas.width, canvas.height)
      gl.uniform4fv(gl.getUniformLocation(prog, 'u_colorBack'), hexToVec4('#00000000'))
      for (let i = 0; i < 3; i++) {
        gl.uniform4fv(gl.getUniformLocation(prog, `u_colors[${i}]`), hexToVec4(colors[i]))
      }
      gl.uniform1f(gl.getUniformLocation(prog, 'u_colorsCount'), 3)
      gl.uniform1f(gl.getUniformLocation(prog, 'u_softness'), 1.0)
      gl.uniform1f(gl.getUniformLocation(prog, 'u_intensity'), 0.9)
      gl.uniform1f(gl.getUniformLocation(prog, 'u_noise'), 0.5)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      timeRef.current++
      frameRef.current = requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => resizeGrain()
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    const { gl, prog } = glRef.current ?? {}
    if (!gl || !prog) return

    const dark = document.documentElement.classList.contains('dark')
    const colors = dark ? DARK_COLORS : LIGHT_COLORS
    for (let i = 0; i < 3; i++) {
      gl.uniform4fv(gl.getUniformLocation(prog, `u_colors[${i}]`), hexToVec4(colors[i]))
    }
  }, [resolvedTheme])

  return (
    <canvas
      ref={canvasRef}
      id="grain-canvas"
      className="absolute inset-0 h-full w-full opacity-0"
      style={{ animation: 'fadeIn 800ms ease forwards 400ms' }}
    />
  )
}
