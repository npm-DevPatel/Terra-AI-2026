import { useState, useRef, useCallback, useEffect } from 'react'
import GlassPanel from '../shared/GlassPanel'

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
    <GlassPanel dark className="absolute bottom-4 left-4 right-4 z-10 px-6 py-3">
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center hover:bg-accent-cyan/25 transition-all duration-200 group"
          title={isPlaying ? 'Pause timelapse' : 'Play timelapse'}
        >
          {isPlaying ? (
            <svg className="w-3.5 h-3.5 text-accent-cyan" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-accent-cyan ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isPlaying ? 'Timelapse' : 'Timeline'}
          </span>
        </div>

        {/* Timeline Track */}
        <div className="flex-1 relative">
          <input
            type="range"
            min={2020}
            max={2026}
            step={1}
            value={selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="timeline-slider w-full"
          />
          <div className="flex justify-between mt-1 px-0.5">
            {years.map(year => (
              <span
                key={year}
                className={`text-[10px] font-mono cursor-pointer transition-colors ${
                  year === selectedYear ? 'text-accent-cyan font-bold' : year <= selectedYear ? 'text-slate-500' : 'text-slate-700'
                }`}
                onClick={() => handleYearChange(year)}
              >
                {year}
              </span>
            ))}
          </div>
        </div>

        {/* Current Selection + Delta */}
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold font-mono text-accent-cyan glow-text-cyan">{selectedYear}</div>
          <div className="flex items-center gap-1 justify-end">
            <div className="text-[10px] text-slate-500">
              {currentCount} enc.
            </div>
            {delta > 0 && (
              <span className="text-[9px] font-mono text-threat-red bg-threat-red/10 px-1 rounded">
                +{delta}
              </span>
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}
