import { useState, useRef, useCallback } from 'react'
import GlassPanel from '../shared/GlassPanel'

export default function ComparisonSlider() {
  const [position, setPosition] = useState(50)
  const containerRef = useRef(null)
  const isDragging = useRef(false)

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const handleMouseDown = (e) => {
    isDragging.current = true
    handleMove(e.clientX)
    const onMove = (e) => isDragging.current && handleMove(e.clientX)
    const onUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <GlassPanel dark className="w-full overflow-hidden">
      <div className="px-4 py-3 border-b border-terra-border/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 5.25v14.25a1.5 1.5 0 001.5 1.5z" />
          </svg>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Satellite Comparison</span>
        </div>
        <div className="flex gap-4 text-[10px] font-mono">
          <span className="text-slate-500">Before: <span className="text-slate-300">Jan 2024</span></span>
          <span className="text-slate-500">After: <span className="text-accent-cyan">Mar 2026</span></span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-72 cursor-ew-resize select-none"
        onMouseDown={handleMouseDown}
      >
        {/* Before (2024) */}
        <div className="absolute inset-0 bg-terra-secondary">
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            {/* Simulated satellite view - before */}
            <div className="absolute inset-0" style={{
              background: `
                radial-gradient(ellipse at 30% 40%, rgba(34, 139, 34, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 60% 60%, rgba(34, 139, 34, 0.25) 0%, transparent 40%),
                radial-gradient(ellipse at 50% 50%, rgba(0, 100, 0, 0.2) 0%, transparent 60%),
                linear-gradient(180deg, #1a2332 0%, #0f1923 100%)
              `,
            }}>
              {/* River line */}
              <div className="absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent transform rotate-3" />
              <div className="absolute top-[35%] left-0 right-0 h-8 bg-gradient-to-r from-transparent via-teal-500/10 to-transparent transform rotate-3" />
            </div>
            <span className="relative z-10 text-xs font-mono text-slate-500 bg-terra-void/80 px-2 py-1 rounded">2024 — Clear vegetation</span>
          </div>
        </div>

        {/* After (2026) — clipped by slider */}
        <div
          className="absolute inset-0 bg-terra-secondary"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            {/* Simulated satellite view - after (with encroachments) */}
            <div className="absolute inset-0" style={{
              background: `
                radial-gradient(ellipse at 30% 40%, rgba(34, 139, 34, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 60% 60%, rgba(139, 69, 19, 0.2) 0%, transparent 40%),
                radial-gradient(ellipse at 50% 50%, rgba(100, 80, 60, 0.15) 0%, transparent 60%),
                linear-gradient(180deg, #1a2332 0%, #0f1923 100%)
              `,
            }}>
              {/* River line */}
              <div className="absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent transform rotate-3" />
              {/* Encroachment indicators */}
              <div className="absolute top-[28%] left-[25%] w-6 h-6 bg-red-500/30 border border-red-500/50 rounded-sm animate-pulse" />
              <div className="absolute top-[30%] left-[40%] w-8 h-5 bg-red-500/30 border border-red-500/50 rounded-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-[35%] left-[55%] w-5 h-7 bg-red-500/30 border border-red-500/50 rounded-sm animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-[32%] left-[70%] w-7 h-5 bg-orange-500/30 border border-orange-500/50 rounded-sm animate-pulse" style={{ animationDelay: '0.3s' }} />
              <div className="absolute top-[25%] left-[60%] w-4 h-4 bg-red-500/30 border border-red-500/50 rounded-sm animate-pulse" style={{ animationDelay: '0.7s' }} />
            </div>
            <span className="relative z-10 text-xs font-mono text-threat-red bg-terra-void/80 px-2 py-1 rounded">2026 — New construction detected</span>
          </div>
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 z-10"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-1 h-full bg-accent-cyan shadow-[0_0_12px_rgba(0,229,255,0.5)]" />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-terra-primary border-2 border-accent-cyan flex items-center justify-center shadow-[0_0_16px_rgba(0,229,255,0.4)]">
            <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[10px] font-mono text-slate-400 bg-terra-void/80 px-2 py-1 rounded-full border border-terra-border/20">BEFORE</span>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] font-mono text-accent-cyan bg-terra-void/80 px-2 py-1 rounded-full border border-accent-cyan/20">AFTER</span>
        </div>
      </div>
    </GlassPanel>
  )
}
