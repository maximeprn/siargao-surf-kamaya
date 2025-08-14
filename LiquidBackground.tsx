'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useThemeOptional } from '@/contexts/ThemeContext';
import type * as THREE_NS from 'three';

// ---------------- Types ----------------
export interface VantaConfig {
  el?: HTMLElement | null;
  highlightColor: number;
  midtoneColor: number;
  lowlightColor: number;
  baseColor: number;
  blurFactor: number;
  speed: number;
  zoom: number;
  mouseControls: boolean;
  touchControls: boolean;
  gyroControls: boolean;
  minHeight: number;
  minWidth: number;
}

export interface SmudgeConfig {
  radius: number;
  gain: number;
  clamp: number;
  decay: number;
  pressMul: number;
  hoverMul: number;
}

export interface RipplesConfig {
  count: number;
  amp: number;
  speed: number;
  width: number;
  freq: number;
  decay: number;
  rate: number;
}

export interface LiquidConfig {
  vanta: VantaConfig;
  smudge: SmudgeConfig;
  ripples: RipplesConfig;
}

// Minimal runtime shape for Vanta instance
type VantaInstance = {
  renderer?: { domElement: HTMLCanvasElement };
  destroy?: () => void;
};

declare global {
  interface Window {
    THREE: typeof THREE_NS;
    VANTA: { FOG: (opts: Record<string, unknown>) => VantaInstance };
    liquid?: { set?: (partial: Partial<LiquidConfig>) => void };
    gc?: () => void; // Chrome DevTools garbage collection
  }
}

// ---------------- Component ----------------

type Props = {
  config?: Partial<LiquidConfig>;
  className?: string;
  style?: React.CSSProperties;
};

export default function LiquidBackground({ config: configOverrides, className, style }: Props) {
  const bgRef = useRef<HTMLDivElement>(null);   // VANTA container
  const fxRef = useRef<HTMLCanvasElement>(null); // overlay canvas
  const cleanupRef = useRef<(() => void) | null>(null); // Immediate cleanup reference
  const mountedRef = useRef(true); // Track if component is still mounted
  
  // Prevent hydration mismatch by only rendering on client
  const [isClient, setIsClient] = useState(false);
  
  // Theme logic - simple and direct
  const themeContext = useThemeOptional()
  const isLight = themeContext?.isLight ?? false
  
  // ===== CONFIG (edit here) =====
  const CONFIG: LiquidConfig = {
    vanta: {
      el: null,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      highlightColor: 0xbee6f7,
      midtoneColor:   0xd4d1f5,
      lowlightColor:  0xfa8282,
      baseColor: 0xffffff,
      blurFactor: 0.54,
      speed: 0.80,
      zoom: 0.30
    },
    smudge: { radius: 0.097, gain: 0.530, clamp: 0.110, decay: 0.875, pressMul: 5.0, hoverMul: 2.7 },
    ripples: { count: 3, amp: 0.032, speed: 0.35, width: 0.065, freq: 52.0, decay: 1.70, rate: 18 },
  };

  if (configOverrides) {
    Object.assign(CONFIG.vanta,  (configOverrides.vanta  ?? {}));
    Object.assign(CONFIG.smudge, (configOverrides.smudge ?? {}));
    Object.assign(CONFIG.ripples,(configOverrides.ripples?? {}));
  }

  // Client-side mount detection
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Main initialization effect - only runs if component should be active
  useEffect(() => {
    // Don't initialize on server or in dark mode
    if (!isClient || !isLight) {
      console.log('[LiquidBackground] Skipping init - client:', isClient, 'light:', isLight);
      return;
    }
    
    console.log('[LiquidBackground] Starting initialization...');
    let vanta: VantaInstance | null = null;
    mountedRef.current = true;

    // Immediate cleanup of any previous instance
    if (cleanupRef.current) {
      console.log('[LiquidBackground] Cleaning up previous instance');
      cleanupRef.current();
      cleanupRef.current = null;
    }

    const loadScriptOnce = (src: string, check: () => boolean): Promise<void> =>
      new Promise<void>((resolve, reject) => {
        if (check()) { resolve(); return; }

        const existing = Array.from(document.scripts).find((s) => s.src === src) as HTMLScriptElement | undefined;
        if (existing) {
          const onLoad = () => { existing.removeEventListener('error', onError); resolve(); };
          const onError = (e: Event) => { existing.removeEventListener('load', onLoad); reject(e); };
          existing.addEventListener('load', onLoad, { once: true });
          existing.addEventListener('error', onError, { once: true });
          return;
        }

        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.crossOrigin = 'anonymous';
        const onLoad = () => { s.removeEventListener('error', onError); resolve(); };
        const onError = (e: Event) => { s.removeEventListener('load', onLoad); reject(e); };
        s.addEventListener('load', onLoad, { once: true });
        s.addEventListener('error', onError, { once: true });
        document.head.appendChild(s);
      });

    // Size canvas to full document dimensions
    const sizeToDocument = () => {
      const width = document.documentElement.clientWidth;
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = fxRef.current;
      
      if (canvas) {
        // CSS size (layout)
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        // Drawing buffer (for canvas sharpness)
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }
      
      return { width, height, dpr };
    };

    const init = async (): Promise<() => void> => {
      // Check if refs are available
      if (!bgRef.current || !fxRef.current) {
        console.warn('[LiquidBackground] Refs not available, skipping init');
        return () => {}; // Return empty cleanup
      }
      
      console.log('[LiquidBackground] Loading THREE.js...');
      // Load THREE and VANTA (runtime)
      await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js', () => !!window.THREE);
      console.log('[LiquidBackground] Loading VANTA.js...');
      await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.fog.min.js', () => !!window.VANTA?.FOG);
      
      console.log('[LiquidBackground] Sizing to document...');
      // Size to document first
      const { width, height, dpr } = sizeToDocument();
      console.log('[LiquidBackground] Document size:', { width, height, dpr });
      
      // ---- VANTA init ---- (full document dimensions)
      CONFIG.vanta.el = bgRef.current;
      CONFIG.vanta.minHeight = height;
      CONFIG.vanta.minWidth = width;
      const vantaOpts = { ...CONFIG.vanta, THREE: window.THREE };
      try { vanta?.destroy?.(); } catch {}
      vanta = window.VANTA.FOG(vantaOpts);

      const vantaCanvas = vanta?.renderer?.domElement;
      if (vantaCanvas) {
        // VANTA canvas - full document dimensions
        vantaCanvas.width = Math.floor(width * dpr);
        vantaCanvas.height = Math.floor(height * dpr);
        vantaCanvas.style.width = width + 'px';
        vantaCanvas.style.height = height + 'px';
      }

      // ---- Overlay (Three.js) ----
      const COUNT = CONFIG.ripples.count;
      const renderer = new window.THREE.WebGLRenderer({ canvas: fxRef.current as HTMLCanvasElement, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false); // Don't touch CSS size

      const scene = new window.THREE.Scene();
      const camera = new window.THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // Create grain texture that will blend with VANTA background
      const grainCanvas = document.createElement('canvas');
      grainCanvas.width = Math.floor(width * dpr);
      grainCanvas.height = Math.floor(height * dpr);
      const grainCtx = grainCanvas.getContext('2d');
      
      // Generate grain pattern
      const grainImageData = grainCtx.createImageData(grainCanvas.width, grainCanvas.height);
      const grainData = grainImageData.data;
      for (let i = 0; i < grainData.length; i += 4) {
        const noise = (Math.random() - 0.5) * 25; // Grain intensity
        grainData[i] = 253 + noise;     // R (base light color + noise)
        grainData[i + 1] = 252 + noise; // G 
        grainData[i + 2] = 245 + noise; // B
        grainData[i + 3] = 255;         // A
      }
      grainCtx.putImageData(grainImageData, 0, 0);
      
      // Composite VANTA canvas with grain
      const compositeCanvas = document.createElement('canvas');
      compositeCanvas.width = Math.floor(width * dpr);
      compositeCanvas.height = Math.floor(height * dpr);
      const compositeCtx = compositeCanvas.getContext('2d');
      
      const srcTex = new window.THREE.CanvasTexture(compositeCanvas);
      srcTex.minFilter = window.THREE.LinearFilter; srcTex.magFilter = window.THREE.LinearFilter;
      srcTex.wrapS = window.THREE.ClampToEdgeWrapping; srcTex.wrapT = window.THREE.ClampToEdgeWrapping;

      const quadV = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`;
      const quadF = `
        precision highp float; varying vec2 vUv; uniform sampler2D tSrc; uniform float time;
        // Smudge
        uniform vec4 strokes[12]; uniform float radius; uniform float gain; uniform float clampMax;
        // Ripples
        const int RIPPLE_COUNT = ${COUNT};
        uniform vec4 ripples[RIPPLE_COUNT];
        uniform float rippleAmp, rippleSpeed, rippleWidth, rippleFreq, rippleDecay;
        float falloff(float d, float r){ float x = clamp(d / r, 0.0, 1.0); return 1.0 - (x*x*(3.0 - 2.0*x)); }
        void main(){
          vec2 uv = vUv; vec2 disp = vec2(0.0);
          // Smudge
          for(int i=0;i<12;i++){ vec2 p = strokes[i].xy; vec2 dir = strokes[i].zw; float f = falloff(distance(uv,p), radius); disp += dir * f * gain; }
          // Ripples
          for(int i=0;i<RIPPLE_COUNT;i++){
            vec4 r = ripples[i]; if(r.w<=0.0) continue; float age = time - r.z; if(age<0.0) continue;
            float d = distance(uv, r.xy); float x = d - age * rippleSpeed;
            float ring = exp(-x*x/(rippleWidth*rippleWidth)) * sin(x * rippleFreq);
            float fade = exp(-age * rippleDecay);
            vec2 dir = normalize(uv - r.xy + 1e-5);
            disp += dir * (ring * fade * r.w * rippleAmp);
          }
          disp = clamp(disp, vec2(-clampMax), vec2(clampMax));
          gl_FragColor = texture2D(tSrc, clamp(uv + disp, 0.0, 1.0));
        }`;

      const mat = new window.THREE.ShaderMaterial({
        uniforms: {
          tSrc: { value: srcTex }, time: { value: 0 },
          strokes: { value: Array.from({ length: 12 }, () => new window.THREE.Vector4(0,0,0,0)) },
          radius: { value: CONFIG.smudge.radius }, gain: { value: CONFIG.smudge.gain }, clampMax: { value: CONFIG.smudge.clamp },
          ripples: { value: Array.from({ length: COUNT }, () => new window.THREE.Vector4(0,0,-9999,0)) },
          rippleAmp: { value: CONFIG.ripples.amp }, rippleSpeed: { value: CONFIG.ripples.speed },
          rippleWidth: { value: CONFIG.ripples.width }, rippleFreq: { value: CONFIG.ripples.freq }, rippleDecay: { value: CONFIG.ripples.decay },
        },
        vertexShader: quadV, fragmentShader: quadF, transparent: true,
      });

      const quad = new window.THREE.Mesh(new window.THREE.PlaneGeometry(2, 2), mat);
      scene.add(quad);

      // Interaction state
      const trail = Array.from({ length: 12 }, () => ({ x: 0.5, y: 0.5, dx: 0, dy: 0 }));
      let isDown = false;
      let last = { x: 0.5, y: 0.5 };
      const rippleBuf = mat.uniforms.ripples.value as THREE_NS.Vector4[]; let rippleIndex = 0; let lastRippleAt = 0;

      const applyTrail = () => { for (let i = 0; i < 12; i++) { const t = trail[i]; (mat.uniforms.strokes.value[i] as THREE_NS.Vector4).set(t.x, t.y, t.dx, t.dy); } };
      const pushStroke = (nx: number, ny: number) => {
        const dx = nx - last.x, dy = ny - last.y; last = { x: nx, y: ny };
        for (let i = 11; i > 0; i--) trail[i] = trail[i - 1];
        const mul = isDown ? CONFIG.smudge.pressMul : CONFIG.smudge.hoverMul;
        trail[0] = { x: nx, y: ny, dx: dx * mul, dy: dy * mul };
      };
      const pushRipple = (nx: number, ny: number, s: number) => {
        const t = mat.uniforms.time.value as number;
        rippleBuf[rippleIndex].set(nx, ny, t, s);
        rippleIndex = (rippleIndex + 1) % COUNT;
      };
      const maybeRipple = (nx: number, ny: number, vMag: number) => {
        const t = mat.uniforms.time.value as number;
        const interval = CONFIG.ripples.rate > 0 ? 1 / CONFIG.ripples.rate : Infinity;
        if (t - lastRippleAt >= interval) { pushRipple(nx, ny, Math.min(Math.max(vMag * 10.0, 0.15), 1.0)); lastRippleAt = t; }
      };

      const onPointer = (e: PointerEvent | TouchEvent) => {
        const touch = (e as TouchEvent).touches && (e as TouchEvent).touches[0];
        const cx = touch ? touch.clientX : (e as PointerEvent).clientX;
        const cy = touch ? touch.clientY : (e as PointerEvent).clientY;
        const nx = cx / window.innerWidth; const ny = 1 - cy / window.innerHeight;
        const vx = nx - last.x, vy = ny - last.y; const vMag = Math.hypot(vx, vy);
        pushStroke(nx, ny); if (isDown) maybeRipple(nx, ny, vMag);
      };

      const onDown = (e: PointerEvent | TouchEvent) => { isDown = true; onPointer(e); pushRipple(last.x, last.y, 0.9); };
      const onMove = (e: PointerEvent | TouchEvent) => onPointer(e);
      const onUp   = () => { isDown = false; };
      const onTouchMove: EventListener = (e) => { const te = e as TouchEvent; if (te.touches?.[0]) { te.preventDefault(); onPointer(te); } };

      // Use window listeners since canvas has pointer-events: none
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      
      // Resize and mutation observers for dynamic sizing
      const onResize = () => { 
        const newDims = sizeToDocument();
        renderer.setSize(newDims.width, newDims.height, false);
        if (camera) {
          camera.aspect = newDims.width / newDims.height;
          camera.updateProjectionMatrix();
        }
      };
      
      // Set up observers after a small delay to avoid blocking
      const mutationObserver = new MutationObserver(onResize);
      
      window.addEventListener('resize', onResize);
      
      // Add mutation observer with throttling
      setTimeout(() => {
        if (mountedRef.current) {
          mutationObserver.observe(document.body, { 
            childList: true, 
            subtree: true, 
            attributes: true 
          });
        }
      }, 100);

      // Render loop with grain composition
      let lastT = performance.now();
      let frame = 0;
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
        
        // Compose VANTA background with grain texture
        if (compositeCtx && vantaCanvas) {
          compositeCtx.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
          // Draw grain background first
          compositeCtx.drawImage(grainCanvas, 0, 0);
          // Blend VANTA on top with multiply mode for natural mixing
          compositeCtx.globalCompositeOperation = 'multiply';
          compositeCtx.drawImage(vantaCanvas, 0, 0);
          compositeCtx.globalCompositeOperation = 'source-over';
        }
        
        srcTex.needsUpdate = true;
        for (let i = 0; i < 12; i++) { trail[i].dx *= CONFIG.smudge.decay; trail[i].dy *= CONFIG.smudge.decay; }
        applyTrail();
        (mat.uniforms.time.value as number) += dt;
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);

      // Expose tiny runtime API (optional)
      window.liquid = window.liquid || {};
      window.liquid.set = (partial: Partial<LiquidConfig>) => {
        if (!partial) return;
        if (partial.smudge?.radius !== undefined) (mat.uniforms.radius.value as number) = partial.smudge.radius;
        if (partial.smudge?.gain   !== undefined) (mat.uniforms.gain.value as number)   = partial.smudge.gain;
        if (partial.smudge?.clamp  !== undefined) (mat.uniforms.clampMax.value as number) = partial.smudge.clamp;
        if (partial.ripples?.amp   !== undefined) (mat.uniforms.rippleAmp.value as number) = partial.ripples.amp;
        if (partial.ripples?.speed !== undefined) (mat.uniforms.rippleSpeed.value as number) = partial.ripples.speed;
        if (partial.ripples?.width !== undefined) (mat.uniforms.rippleWidth.value as number) = partial.ripples.width;
        if (partial.ripples?.freq  !== undefined) (mat.uniforms.rippleFreq.value as number) = partial.ripples.freq;
        if (partial.ripples?.decay !== undefined) (mat.uniforms.rippleDecay.value as number) = partial.ripples.decay;
      };

      // Cleanup function for React unmount with aggressive resource cleanup
      const cleanupFn = () => {
        mountedRef.current = false;
        cancelAnimationFrame(frame);
        
        // Remove all event listeners
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('resize', onResize);
        mutationObserver.disconnect();
        
        // Aggressive WebGL cleanup
        try { 
          // Clear all uniforms and textures
          if (mat.uniforms.tSrc.value) {
            (mat.uniforms.tSrc.value as typeof srcTex).dispose();
          }
          mat.dispose();
          quad.geometry.dispose();
          scene.remove(quad);
          
          // Force context loss and dispose renderer
          const gl = renderer.getContext();
          if (gl && gl.getExtension) {
            const loseContext = gl.getExtension('WEBGL_lose_context');
            if (loseContext) loseContext.loseContext();
          }
          renderer.forceContextLoss();
          renderer.dispose(); 
        } catch (e) {
          console.warn('WebGL cleanup warning:', e);
        }
        
        // Aggressive VANTA cleanup
        try { 
          if (vanta?.renderer?.domElement) {
            vanta.renderer.domElement.remove();
          }
          vanta?.destroy?.(); 
        } catch (e) {
          console.warn('VANTA cleanup warning:', e);
        }
        
        // Clear canvas references
        grainCanvas.remove();
        compositeCanvas.remove();
        
        // Clear references
        vanta = null;
        
        // Force garbage collection hint (if available)
        if (window.gc) {
          setTimeout(() => window.gc?.(), 100);
        }
      };
      
      return cleanupFn;
    };

    // Add timeout to prevent hanging
    Promise.race([
      init(),
      new Promise<() => void>((_, reject) => 
        setTimeout(() => reject(new Error('Initialization timeout')), 10000)
      )
    ])
      .then((cleanupFn) => { 
        console.log('[LiquidBackground] Initialization complete');
        if (mountedRef.current) {
          cleanupRef.current = cleanupFn; 
        } else {
          // Component was unmounted during init, cleanup immediately
          cleanupFn();
        }
      })
      .catch((e) => {
        console.error('[LiquidBackground] init error', e);
        // Continue anyway - page shouldn't be stuck
      });

    return () => { 
      mountedRef.current = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isClient, isLight]); // eslint-disable-line react-hooks/exhaustive-deps

  // Don't render anything on server or in dark mode (after all hooks)
  if (!isClient || !isLight) {
    return null;
  }

  // TEMPORARY: Disable the component to prevent freezing
  console.log('[LiquidBackground] Component disabled for debugging');
  return null;

  return (
    <div 
      className={className} 
      style={{ 
        position: 'absolute',
        inset: 0, // top: 0, right: 0, bottom: 0, left: 0
        width: '100%',
        height: '100%', // Will match parent container's full document height
        zIndex: 0,
        pointerEvents: 'none',
        backgroundColor: '#FDFCF5', // Solid fallback
        isolation: 'isolate', // Creates stacking context
        ...style 
      }}
    >
      <div ref={bgRef} style={{ 
        position: 'absolute', 
        inset: 0,
        width: '100%', 
        height: '100%'
      }} />
      <canvas ref={fxRef} style={{ 
        position: 'absolute', 
        inset: 0,
        width: '100%', 
        height: '100%', 
        display: 'block',
        pointerEvents: 'none' // Let clicks pass through, use window listeners
      }} />
    </div>
  );
}