import { useEffect, useRef, useState } from 'react'
import type { MotionValue } from 'motion/react'

const vertex = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

// Shifts each pixel by how near it is (from the depth map) times the pointer offset, so
// near parts like the face move towards the pointer and the sky moves away from it. A
// second lookup at the shifted point keeps edges from smearing.
const fragment = `
precision mediump float;
uniform sampler2D u_image;
uniform sampler2D u_depth;
uniform vec2 u_look;
uniform float u_zoom;
varying vec2 v_uv;
const float FOCUS = 0.45;
const float STRENGTH = 0.05;
void main() {
  vec2 uv = (v_uv - 0.5) / u_zoom + 0.5;
  float d = texture2D(u_depth, uv).r;
  vec2 shift = u_look * (d - FOCUS) * STRENGTH;
  d = texture2D(u_depth, uv - shift).r;
  shift = u_look * (d - FOCUS) * STRENGTH;
  gl_FragColor = texture2D(u_image, clamp(uv - shift, 0.0, 1.0));
}`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function texture(gl: WebGLRenderingContext, unit: number, img: HTMLImageElement) {
  const tex = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0 + unit)
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
}

/**
 * A painting plus a hand-made depth map, drawn with WebGL so the picture shifts like a
 * 3D photo instead of a flat card being bent. Falls back to the plain image without WebGL.
 */
export function DepthPortrait({
  image,
  depth,
  x,
  y,
  zoom,
}: {
  image: string
  depth: string
  x: MotionValue<number>
  y: MotionValue<number>
  zoom: MotionValue<number>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', { premultipliedAlpha: false, antialias: false })
    if (!canvas || !gl) {
      setFailed(true)
      return
    }

    let disposed = false
    let frame = 0
    let draw = () => {}

    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex))
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true)
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uLook = gl.getUniformLocation(program, 'u_look')
    const uZoom = gl.getUniformLocation(program, 'u_zoom')
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0)
    gl.uniform1i(gl.getUniformLocation(program, 'u_depth'), 1)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
      draw()
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0
        draw()
      })
    }

    Promise.all([load(image), load(depth)])
      .then(([img, dep]) => {
        if (disposed) return
        texture(gl, 0, img)
        texture(gl, 1, dep)
        draw = () => {
          gl.uniform2f(uLook, x.get(), y.get())
          gl.uniform1f(uZoom, zoom.get())
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        }
        resize()
      })
      .catch(() => setFailed(true))

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    const unsubscribe = [x.on('change', schedule), y.on('change', schedule), zoom.on('change', schedule)]

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      unsubscribe.forEach((off) => off())
    }
  }, [image, depth, x, y, zoom])

  if (failed) return <img className="avatar__layer" src={image} alt="" draggable={false} />
  return <canvas ref={canvasRef} className="avatar__layer" />
}
