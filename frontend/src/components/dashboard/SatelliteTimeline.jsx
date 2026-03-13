import { useState, useRef, useCallback, useEffect } from 'react'
import Panel from '../shared/Panel'

const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026]

// Simulated encroachment count progression per year
const ENCROACHMENT_COUNTS = {
  2020: 0, 2021: 1, 2022: 2, 2023: 3, 2024: 5, 2025: 7, 2026: 8,
}

export default function SatelliteTimeline({ onYearChange, selectedYear: controlledYear }) {
  const [internalYear, setInternalYear] = useState(2026)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef(null)

  const selectedYear = controlledYear || internalYear

  const handleYearChange = useCallback((year) => {
    setInternalYear(year)
    onYearChange?.(year)
  }, [onYearChange])

  // Timelapse play/pause
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    let currentIdx = years.indexOf(selectedYear)

    timerRef.current = setInterval(() => {
      currentIdx++
      if (currentIdx >= years.length) {
        currentIdx = 0
      }
      handleYearChange(years[currentIdx])

      // Stop at end
      if (currentIdx === years.length - 1) {
        setIsPlaying(false)
      }
    }, 1200)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, selectedYear, handleYearChange])

  const togglePlay = () => {
    if (!isPlaying && selectedYear === 2026) {
      // Reset to beginning when starting from end
      handleYearChange(2020)
    }
    setIsPlaying(!isPlaying)
  }

  const prevCount = ENCROACHMENT_COUNTS[selectedYear - 1] || 0
  const currentCount = ENCROACHMENT_COUNTS[selectedYear] || 0
  const delta = currentCount - prevCount

  return (
    <Panel className="absolute bottom-4 left-4 right-4 z-10 px-6 py-4 shadow-2xl">
      <div className="flex items-center gap-6">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-11 h-11 rounded-2xl bg-accent-teal text-white shadow-lg shadow-accent-teal/20 flex items-center justify-center hover:bg-teal-600 hover:scale-105 active:scale-95 transition-all duration-300 group"
          title={isPlaying ? 'Pause timelapse' : 'Play timelapse'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1.5" />
              <rect x="14" y="4" width="4" height="16" rx="1.5" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Label and Progress */}
        <div className="flex flex-col gap-1 flex-shrink-0 min-w-[100px]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-accent-teal animate-pulse' : 'bg-text-ghost'}`} />
            <span className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">
              {isPlaying ? 'Timelapse' : 'History'}
            </span>
          </div>
          <div className="text-[22px] font-black font-mono text-accent-teal leading-none tracking-tighter">
            {selectedYear}
          </div>
        </div>

        {/* Timeline Track */}
        <div className="flex-1 relative pt-2">
          <input
            type="range"
            min={2020}
            max={2026}
            step={1}
            value={selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="timeline-slider w-full cursor-pointer"
          />
          <div className="flex justify-between mt-3 px-0.5">
            {years.map(year => (
              <button
                key={year}
                className={`flex flex-col items-center gap-1.5 transition-all duration-300 group ${
                  year === selectedYear ? 'scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                onClick={() => handleYearChange(year)}
              >
                <div className={`w-1 h-3 rounded-full transition-all ${
                  year === selectedYear ? 'bg-accent-teal h-4 shadow-[0_0_8px_rgba(13,148,136,0.6)]' : 'bg-border-strong group-hover:bg-accent-teal/50'
                }`} />
                <span className={`text-[10px] font-bold font-mono transition-colors ${
                  year === selectedYear ? 'text-accent-teal' : 'text-text-muted'
                }`}>
                  {year}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Selection + Delta */}
        <div className="flex-shrink-0 bg-bg-sunken/40 px-4 py-2 rounded-xl border border-border-default/30 min-w-[120px]">
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Detected Sites</div>
          <div className="flex items-end gap-2 leading-none">
            <div className="text-xl font-black font-mono text-text-primary">{currentCount}</div>
            {delta > 0 ? (
              <span className="text-[11px] font-bold text-risk-high pb-0.5 animate-bounce">
                ↑ {delta} NEW
              </span>
            ) : (
              <span className="text-[11px] font-bold text-text-ghost pb-0.5">STABLE</span>
            )}
          </div>
        </div>
      </div>
    </Panel>
  )
}
