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
    <GlassPanel className="w-full overflow-hidden shadow-xl border-border-default/80">
      <div className="px-5 py-4 border-b border-border-default/80 flex items-center justify-between bg-bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-accent-teal-light border border-accent-teal/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 5.25v14.25a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-text-primary uppercase tracking-widest">Temporal Analysis</span>
        </div>
        <div className="flex gap-5 text-[11px] font-bold">
          <span className="text-text-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-border-strong" />
            JAN 2024
          </span>
          <span className="text-accent-teal flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
            MAR 2026
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative h-80 cursor-ew-resize select-none comparison-slider"
        onMouseDown={handleMouseDown}
      >
        {/* Before (2024) */}
        <div className="absolute inset-0 bg-bg-base before">
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#F0F4F2]">
            {/* Simulated satellite view - before */}
            <div className="absolute inset-0" style={{
              background: `
                radial-gradient(circle at 30% 40%, #D4E2D9 0%, transparent 60%),
                radial-gradient(circle at 70% 60%, #E8F0ED 0%, transparent 40%),
                linear-gradient(135deg, #F7F9F8 0%, #DCE5E0 100%)
              `,
            }}>
              {/* River line (Natural) */}
              <div className="absolute top-[38%] left-0 right-0 h-4 bg-accent-teal/10 blur-xl transform rotate-2" />
              <div className="absolute top-[40%] left-0 right-0 h-1.5 bg-accent-teal/20 transform rotate-2" />
            </div>
            <div className="relative z-10 text-[10px] font-bold text-text-primary bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/50 shadow-sm uppercase tracking-wider">
              Pristine Riparian Zone — Jan 2024
            </div>
          </div>
        </div>

        {/* After (2026) — clipped by slider */}
        <div
          className="absolute inset-0 bg-bg-base after"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#F0F4F2]">
            {/* Simulated satellite view - after (with encroachments) */}
            <div className="absolute inset-0" style={{
              background: `
                radial-gradient(circle at 30% 40%, rgba(34, 139, 34, 0.1) 0%, transparent 60%),
                radial-gradient(circle at 70% 60%, rgba(220, 38, 38, 0.05) 0%, transparent 40%),
                linear-gradient(135deg, #F7F9F8 0%, #DCE5E0 100%)
              `,
            }}>
              {/* River line */}
              <div className="absolute top-[38%] left-0 right-0 h-4 bg-accent-teal/10 blur-xl transform rotate-2" />
              <div className="absolute top-[40%] left-0 right-0 h-1.5 bg-accent-teal/20 transform rotate-2" />
              
              {/* Encroachment indicators - More subtle & premium */}
              <div className="absolute top-[32%] left-[30%] w-10 h-7 bg-risk-high/10 border border-risk-high/40 rounded-lg shadow-[0_0_12px_rgba(220,38,38,0.1)] group transition-all" />
              <div className="absolute top-[35%] left-[45%] w-12 h-8 bg-risk-high/10 border border-risk-high/40 rounded-lg shadow-[0_0_12px_rgba(220,38,38,0.1)]" />
              <div className="absolute top-[30%] left-[65%] w-9 h-6 bg-risk-medium/10 border border-risk-medium/40 rounded-lg shadow-[0_0_12px_rgba(217,119,6,0.1)]" />
            </div>
            <div className="relative z-10 text-[10px] font-bold text-risk-high bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-risk-high/20 shadow-sm uppercase tracking-wider">
              Multiple Encroachments — Mar 2026
            </div>
          </div>
        </div>

        {/* Slider Handle */}
        <div
          className="slider-handle group"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-accent-teal shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}
