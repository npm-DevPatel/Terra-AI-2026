import { useState, useRef, useEffect } from 'react'
import StatusBadge from '../shared/StatusBadge'
import { formatCoordinate } from '../../utils/formatters'
import { sendChatMessage } from '../../services/apiService'
import microphoneIcon from '../../assets/microphone.png'

export default function AIChatPanel({ siteRisk, loading, onQuery }) {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: 'Welcome to Terra AI Risk Analyst. Drop a pin on the map or type a question to assess any site in Nairobi.',
    },
  ])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || chatLoading) return

    const userMessage = input.trim()
    setMessages(prev => [...prev, { type: 'user', text: userMessage }])
    setInput('')
    setChatLoading(true)

    // Show thinking indicator
    setMessages(prev => [
      ...prev,
      { type: 'ai', text: '🤖 Thinking...', loading: true },
    ])

    try {
      // Call the backend AI chat endpoint
      const lat = siteRisk?.site?.lat || null
      const lng = siteRisk?.site?.lng || null
      const data = await sendChatMessage(userMessage, lat, lng)

      // Remove thinking indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.loading || m.text !== '🤖 Thinking...')
        return [
          ...filtered,
          {
            type: 'ai',
            text: data.response,
            report: data.site_context || null,
          },
        ]
      })
    } catch (error) {
      console.warn('[Terra AI] Chat API failed, using local fallback:', error.message)
      // Fallback to local responses
      setMessages(prev => {
        const filtered = prev.filter(m => !m.loading || m.text !== '🤖 Thinking...')
        return [
          ...filtered,
          {
            type: 'ai',
            text: _localChatFallback(userMessage, siteRisk),
          },
        ]
      })
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="absolute top-4 right-4 z-10 w-96 h-[calc(100%-80px)] flex flex-col bg-white text-text-secondary shadow-xl rounded-2xl border border-border-default animate-slide-in-right overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-default bg-bg-surface/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-teal-light border border-accent-teal/30 flex items-center justify-center shadow-sm">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <div className="text-[15px] font-bold text-text-primary tracking-tight">AI Risk Analyst</div>
            <div className="text-[11px] font-medium text-accent-teal">Powered by Terra AI</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-transparent">
        {messages.map((msg, i) => (
          <div key={i} className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3.5 py-2.5 text-sm ${
                msg.type === 'user'
                  ? 'bg-accent-teal-light text-text-primary rounded-[12px_12px_4px_12px]'
                  : 'bg-bg-elevated text-text-secondary rounded-[12px_12px_12px_4px]'
              } ${msg.loading ? 'animate-pulse' : 'animate-fade-in'}`}
            >
              <p className="text-[13px] leading-relaxed font-medium">{msg.text}</p>
              {msg.report && (
                <div className="mt-3 p-3 rounded-lg bg-bg-surface border border-border-default space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Risk Assessment</span>
                    <StatusBadge level={msg.report.risk_level} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-text-muted">Distance</span>
                      <div className="text-text-primary font-mono font-semibold">{msg.report.distance_from_river_m}m</div>
                    </div>
                    <div>
                      <span className="text-text-muted">River</span>
                      <div className="text-text-primary font-medium">{msg.report.nearest_river}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Buffer</span>
                      <div className={`font-semibold ${msg.report.inside_buffer ? 'text-risk-high' : 'text-accent-green'}`}>
                        {msg.report.inside_buffer ? 'Inside' : 'Outside'}
                      </div>
                    </div>
                    <div>
                      <span className="text-text-muted">Flood Zone</span>
                      <div className="text-text-primary text-[10px] font-medium">{msg.report.flood_zone}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border-default">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Recommendation</span>
                    <p className="text-[11px] text-accent-teal mt-0.5">{msg.report.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border-default/80 bg-bg-surface/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Is this site safe to build on?"
            className="flex-1 bg-bg-surface/80 border border-border-strong/50 rounded-xl px-4 py-3 text-[13px] text-text-primary placeholder-text-ghost focus:outline-none focus:ring-2 focus:ring-accent-teal/20 focus:border-accent-teal transition-all shadow-sm"
            id="ai-chat-input"
            disabled={chatLoading}
          />
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border-default/80 bg-bg-surface hover:bg-bg-elevated transition-colors"
            aria-label="Voice input (coming soon)"
          >
            <img src={microphoneIcon} alt="Microphone" className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={chatLoading}
            className="px-4 py-3 bg-accent-teal text-white rounded-xl hover:bg-teal-600 hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center shadow-accent-teal/20 shadow-sm"
          >
            <svg className="w-5 h-5 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

/**
 * Local fallback chat when backend is unreachable
 */
function _localChatFallback(message, siteRisk) {
  const msg = message.toLowerCase()

  if (siteRisk) {
    if (msg.includes('safe') || msg.includes('build') || msg.includes('risk')) {
      return siteRisk.inside_buffer
        ? `Based on my analysis, this site is NOT safe to build on. It is ${siteRisk.distance_from_river_m}m from ${siteRisk.nearest_river}, inside the legally protected 30-metre riparian buffer. Risk level: ${siteRisk.risk_level}.`
        : `This site is ${siteRisk.distance_from_river_m}m from ${siteRisk.nearest_river}. ${siteRisk.risk_level === 'LOW' ? 'It is clear for construction with standard approvals.' : 'Moderate risk — proceed with caution.'}`
    }
  }

  if (msg.includes('safe') || msg.includes('build') || msg.includes('risk')) {
    return 'Please drop a pin on the map to assess a specific location. Click anywhere on the map to place a marker, and I\'ll analyze the site risk for that exact position.'
  }

  return 'I can help you assess site risk for any location in Nairobi. Try asking "Is this site safe to build on?" after dropping a pin on the map, or ask about riparian buffer regulations.'
}
