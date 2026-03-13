import { useState } from 'react'
import GlassPanel from '../shared/GlassPanel'

const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026]

export default function SatelliteTimeline() {
  const [selectedYear, setSelectedYear] = useState(2026)

  return (
    <GlassPanel dark className="absolute bottom-4 left-4 right-4 z-10 px-6 py-3">
      <div className="flex items-center gap-4">
        {/* Label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Satellite Timeline</span>
        </div>

        {/* Timeline Track */}
        <div className="flex-1 relative">
          <input
            type="range"
            min={2020}
            max={2026}
            step={1}
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="timeline-slider w-full"
          />
          <div className="flex justify-between mt-1 px-0.5">
            {years.map(year => (
              <span
                key={year}
                className={`text-[10px] font-mono cursor-pointer transition-colors ${
                  year === selectedYear ? 'text-accent-cyan font-bold' : 'text-slate-600'
                }`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </span>
            ))}
          </div>
        </div>

        {/* Current Selection */}
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold font-mono text-accent-cyan glow-text-cyan">{selectedYear}</div>
          <div className="text-[10px] text-slate-500">Imagery Period</div>
        </div>
      </div>
    </GlassPanel>
  )
}
