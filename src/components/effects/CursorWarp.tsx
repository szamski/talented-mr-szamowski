"use client";

import { useEffect, useRef, useCallback } from "react";

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform vec2 u_cursor;
  uniform vec2 u_prevCursor;
  uniform float u_time;
  uniform float u_moveTime;

  const vec3 BRAND = vec3(0.051, 0.875, 0.447);
  const float PI = 3.14159265359;

  float ease(float x) {
    return sqrt(1.0 - pow(x - 1.0, 2.0));
  }

  float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);

    vec2 cursor = u_cursor * aspect;
    vec2 prev = u_prevCursor * aspect;
    vec2 pos = uv * aspect;

    float elapsed = u_time - u_moveTime;
    float duration = 0.4;
    float progress = clamp(elapsed / duration, 0.0, 1.0);
    float eased = ease(progress);

    // Trail between previous and current position
    vec2 trailHead = mix(prev, cursor, eased);
    float distToTrail = sdSegment(pos, prev, trailHead);

    float trailLen = length(cursor - prev);
    float trailWidth = 0.012 * (1.0 - eased) * min(trailLen * 10.0, 1.0);

    float trail = smoothstep(trailWidth + 0.006, trailWidth, distToTrail);
    trail *= (1.0 - eased);
    float trailAlpha = trail * 0.15;

    // Cursor glow
    float distToCursor = length(pos - cursor);
    float cursorGlow = exp(-distToCursor * distToCursor * 1200.0) * 0.12;

    // Blinking block cursor (terminal style)
    float blink = step(0.0, sin(u_time * PI * 2.0));
    float blockDist = max(
      abs(pos.x - cursor.x) - 0.003,
      abs(pos.y - cursor.y) - 0.009
    );
    float block = smoothstep(0.001, 0.0, blockDist) * blink * 0.95;

    // Warp ring on jump
    float warpRing = exp(-pow(distToCursor - 0.025, 2.0) * 25000.0)
      * (1.0 - eased) * min(trailLen * 15.0, 1.0) * 0.1;

    float alpha = trailAlpha + cursorGlow + block + warpRing;
    gl_FragColor = vec4(BRAND, alpha);
  }
`;

// Selectors for text elements the cursor can land on
const TEXT_SELECTORS = "h1, h2, h3, h4, p, li, span, a, blockquote";

/**
 * Find the end-of-line position for the text element closest to the
 * vertical centre of the viewport.  Returns normalised {x, y} in
 * screen-space (0–1 range, y=0 bottom, y=1 top).
 */
function findCursorTarget(): { x: number; y: number } | null {
  const els = document.querySelectorAll<HTMLElement>(TEXT_SELECTORS);
  if (!els.length) return null;

  const vh = window.innerHeight;
  const vw = window.innerWidth;
  // Target the top-third of the viewport — feels like "reading position"
  const targetY = vh * 0.35;

  let best: { x: number; y: number } | null = null;
  let bestDist = Infinity;

  for (const el of els) {
    // Skip invisible or very small elements
    if (el.offsetHeight === 0 || el.offsetWidth === 0) continue;
    // Skip elements nested inside other matched elements (avoid duplicates)
    if (el.closest(TEXT_SELECTORS) !== el && el.parentElement?.closest(TEXT_SELECTORS)) continue;

    const rect = el.getBoundingClientRect();
    // Must be at least partially in viewport
    if (rect.bottom < 0 || rect.top > vh) continue;

    // Use the element's vertical centre distance to our target line
    const elCenterY = (rect.top + rect.bottom) / 2;
    const dist = Math.abs(elCenterY - targetY);

    if (dist < bestDist) {
      bestDist = dist;

      // Try to get the end of the last text line using Range API
      const textNode = getLastTextNode(el);
      if (textNode && textNode.textContent) {
        const range = document.createRange();
        range.setStart(textNode, textNode.textContent.length);
        range.setEnd(textNode, textNode.textContent.length);
        const rects = range.getClientRects();
        if (rects.length > 0) {
          const r = rects[0];
          best = {
            x: Math.min(r.right + 4, vw - 10) / vw,
            y: 1.0 - (r.top + r.height / 2) / vh,
          };
          continue;
        }
      }

      // Fallback: right edge of the element bounding box
      best = {
        x: Math.min(rect.right, vw - 10) / vw,
        y: 1.0 - (rect.top + rect.height / 2) / vh,
      };
    }
  }

  return best;
}

function getLastTextNode(el: Node): Text | null {
  if (el.nodeType === Node.TEXT_NODE && el.textContent?.trim()) {
    return el as Text;
  }
  for (let i = el.childNodes.length - 1; i >= 0; i--) {
    const found = getLastTextNode(el.childNodes[i]);
    if (found) return found;
  }
  return null;
}

export default function CursorWarp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const rafRef = useRef<number>(0);
  const cursorRef = useRef({ x: 0.5, y: 0.5 });
  const prevCursorRef = useRef({ x: 0.5, y: 0.5 });
  const moveTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastTargetRef = useRef<string>("");

  const initGL = useCallback((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return null;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return null;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return null;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    uniformsRef.current = {
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_cursor: gl.getUniformLocation(program, "u_cursor"),
      u_prevCursor: gl.getUniformLocation(program, "u_prevCursor"),
      u_time: gl.getUniformLocation(program, "u_time"),
      u_moveTime: gl.getUniformLocation(program, "u_moveTime"),
    };

    glRef.current = gl;
    return gl;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip on touch / mobile
    if ("ontouchstart" in window && navigator.maxTouchPoints > 0) return;

    const gl = initGL(canvas);
    if (!gl) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Throttled scroll/resize handler to update cursor target
    let scrollTick = false;
    const updateTarget = () => {
      const target = findCursorTarget();
      if (!target) return;

      const key = `${target.x.toFixed(3)},${target.y.toFixed(3)}`;
      if (key !== lastTargetRef.current) {
        lastTargetRef.current = key;
        prevCursorRef.current = { ...cursorRef.current };
        cursorRef.current = target;
        moveTimeRef.current = (performance.now() - startTimeRef.current) / 1000;
      }
    };

    const onScroll = () => {
      if (!scrollTick) {
        scrollTick = true;
        requestAnimationFrame(() => {
          updateTarget();
          scrollTick = false;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Also fire on initial load
    startTimeRef.current = performance.now();
    updateTarget();

    const render = () => {
      const u = uniformsRef.current;
      const t = (performance.now() - startTimeRef.current) / 1000;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(u.u_resolution, canvas.width, canvas.height);
      gl.uniform2f(u.u_cursor, cursorRef.current.x, cursorRef.current.y);
      gl.uniform2f(u.u_prevCursor, prevCursorRef.current.x, prevCursorRef.current.y);
      gl.uniform1f(u.u_time, t);
      gl.uniform1f(u.u_moveTime, moveTimeRef.current);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [initGL]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
