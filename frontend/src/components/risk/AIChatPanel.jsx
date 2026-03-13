import { useState, useRef, useEffect } from 'react'
import GlassPanel from '../shared/GlassPanel'
import StatusBadge from '../shared/StatusBadge'
import { formatCoordinate } from '../../utils/formatters'

export default function AIChatPanel({ siteRisk, loading, onQuery }) {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: 'Welcome to Terra AI Risk Analyst. Drop a pin on the map or type a question to assess any site in Nairobi.',
    },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (siteRisk && !loading) {
      const coord = formatCoordinate(siteRisk.site.lat, siteRisk.site.lng)
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          text: siteRisk.ai_narrative,
          report: siteRisk,
        },
      ])
    }
  }, [siteRisk, loading])

  useEffect(() => {
    if (loading) {
      setMessages(prev => [
        ...prev,
        { type: 'ai', text: '🛰 Analyzing satellite imagery and riparian data...', loading: true },
      ])
    }
  }, [loading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages(prev => [...prev, { type: 'user', text: input }])

    if (input.toLowerCase().includes('safe') || input.toLowerCase().includes('build') || input.toLowerCase().includes('risk')) {
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          text: 'Please drop a pin on the map to assess a specific location. Click anywhere on the map to place a marker, and I\'ll analyze the site risk for that exact position.',
        },
      ])
    } else {
      setMessages(prev => [
        ...prev,
        {
          type: 'ai',
          text: 'I can help you assess site risk for any location in Nairobi. Try asking "Is this site safe to build on?" after dropping a pin on the map, or ask about riparian buffer regulations.',
        },
      ])
    }

    setInput('')
  }

  return (
    <GlassPanel dark className="absolute top-4 right-4 z-10 w-96 h-[calc(100%-80px)] flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="px-4 py-3 border-b border-terra-border/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-teal/20 border border-accent-cyan/30 flex items-center justify-center">
            <span className="text-sm">🤖</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">AI Risk Analyst</div>
            <div className="text-[10px] text-accent-teal">Powered by Terra AI</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                msg.type === 'user'
                  ? 'bg-accent-cyan/15 text-slate-200 border border-accent-cyan/20'
                  : 'bg-terra-void/60 text-slate-300 border border-terra-border/10'
              } ${msg.loading ? 'animate-pulse' : 'animate-fade-in'}`}
            >
              <p className="text-[13px] leading-relaxed">{msg.text}</p>
              {msg.report && (
                <div className="mt-3 p-3 rounded-lg bg-terra-primary/80 border border-terra-border/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Risk Assessment</span>
                    <StatusBadge level={msg.report.risk_level} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Distance</span>
                      <div className="text-slate-200 font-mono">{msg.report.distance_from_river_m}m</div>
                    </div>
                    <div>
                      <span className="text-slate-500">River</span>
                      <div className="text-slate-200">{msg.report.nearest_river}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Buffer</span>
                      <div className={msg.report.inside_buffer ? 'text-threat-red' : 'text-status-safe'}>
                        {msg.report.inside_buffer ? 'Inside' : 'Outside'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Flood Zone</span>
                      <div className="text-slate-200 text-[10px]">{msg.report.flood_zone}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-terra-border/10">
                    <span className="text-[10px] text-slate-500">Recommendation</span>
                    <p className="text-[11px] text-accent-cyan mt-0.5">{msg.report.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-terra-border/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Is this site safe to build on?"
            className="flex-1 bg-terra-void/60 border border-terra-border/20 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent-cyan/40 transition-colors"
            id="ai-chat-input"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-accent-cyan/15 border border-accent-cyan/30 rounded-lg text-accent-cyan hover:bg-accent-cyan/25 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    </GlassPanel>
  )
}
