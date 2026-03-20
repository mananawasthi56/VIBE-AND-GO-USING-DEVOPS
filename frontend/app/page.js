'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const GradientTitle = dynamic(() => import('@/components/GradientTitle'), { ssr: false })

const MOODS = [
  { id: 'adventure', emoji: '⛰️', label: 'Adventure',  sub: 'Explore & thrill',  color: '#f97316', glow: 'rgba(249,115,22,0.4)' },
  { id: 'relaxing',  emoji: '🌿', label: 'Relaxing',   sub: 'Calm & peaceful',   color: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
  { id: 'romantic',  emoji: '🌅', label: 'Romantic',   sub: 'Date night magic',  color: '#ec4899', glow: 'rgba(236,72,153,0.4)' },
  { id: 'foodie',    emoji: '🍜', label: 'Foodie',     sub: 'Eat & explore',     color: '#eab308', glow: 'rgba(234,179,8,0.4)' },
  { id: 'social',    emoji: '🎉', label: 'Social',     sub: 'Meet & vibe',       color: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
  { id: 'culture',   emoji: '🏛️', label: 'Culture',    sub: 'Art & history',     color: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
  { id: 'shopping',  emoji: '🛍️', label: 'Shopping',   sub: 'Browse & buy',      color: '#f43f5e', glow: 'rgba(244,63,94,0.4)' },
  { id: 'fitness',   emoji: '💪', label: 'Fitness',    sub: 'Move & sweat',      color: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
  { id: 'coffee',    emoji: '☕', label: 'Coffee',     sub: 'Sip & work',        color: '#d97706', glow: 'rgba(217,119,6,0.4)' },
]

const BUDGETS = [
  { id: 'free',   label: 'Free',  emoji: '🆓' },
  { id: 'low',    label: '₹',     emoji: '💸' },
  { id: 'medium', label: '₹₹',   emoji: '💰' },
  { id: 'high',   label: '₹₹₹',  emoji: '🤑' },
]

export default function Home() {
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState(null)
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [location, setLocation] = useState(null)
  const [cityName, setCityName] = useState('Detecting location...')
  const [loading, setLoading] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [weather, setWeather] = useState(null)
  const [activeTab, setActiveTab] = useState('mood')
  const [manualMode, setManualMode] = useState(false)
  const [manualCity, setManualCity] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState([])
  const canvasRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
    })))

    if (!navigator.geolocation) {
      setCityName('Location unavailable')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setLocation({ lat: latitude, lon: longitude })
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const city = data.address.city || data.address.town || data.address.village || 'Your location'
          setCityName(city)
        } catch { setCityName('Location detected') }
        try {
          const wRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/weather?lat=${latitude}&lon=${longitude}`)
          const wData = await wRes.json()
          setWeather(wData.weather)
        } catch {}
      },
      () => {
        setLocation({ lat: 30.9010, lon: 75.8573 })
        setCityName('Ludhiana, Punjab')
      }
    )
  }, [])

  const handleManualLocation = async () => {
    if (!manualCity.trim()) return
    setManualLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualCity)}&format=json&limit=1`
      )
      const data = await res.json()
      if (data.length === 0) { alert('City not found!'); return }
      const { lat, lon, display_name } = data[0]
      setLocation({ lat: parseFloat(lat), lon: parseFloat(lon) })
      setCityName(display_name.split(',').slice(0, 2).join(','))
      setManualMode(false)
      setManualCity('')
    } catch { alert('Could not find location!') }
    finally { setManualLoading(false) }
  }

  const handleRandomVibe = () => {
    const random = MOODS[Math.floor(Math.random() * MOODS.length)]
    setSelectedMood(random.id)
  }

  const handleAISearch = async () => {
    if (!aiText.trim() || !location) return
    setAiLoading(true)
    setAiResult(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiText, lat: location.lat, lon: location.lon }),
      })
      const data = await res.json()
      setAiResult(data.suggestion)
      setSelectedMood(data.suggestion.mood)
    } catch { alert('AI error. Try again!') }
    finally { setAiLoading(false) }
  }

  const handleSearch = () => {
    if (!selectedMood || !location) return
    setLoading(true)
    const params = new URLSearchParams({
      mood: selectedMood,
      lat: location.lat,
      lon: location.lon,
      ...(selectedBudget && { budget: selectedBudget }),
    })
    router.push(`/results?${params.toString()}`)
  }

  const selectedMoodData = MOODS.find(m => m.id === selectedMood)

  if (!mounted) {
    return (
      <main style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
      </main>
    )
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050508',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Animated background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: selectedMoodData
            ? `radial-gradient(circle, ${selectedMoodData.glow} 0%, transparent 70%)`
            : 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
          transition: 'background 1s ease',
          animation: 'float1 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: selectedMoodData
            ? `radial-gradient(circle, ${selectedMoodData.glow} 0%, transparent 70%)`
            : 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
          transition: 'background 1s ease',
          animation: 'float2 15s ease-in-out infinite',
        }} />
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: '50%',
            background: selectedMoodData ? selectedMoodData.color : '#22c55e',
            opacity: 0.3,
            animation: `particle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
            transition: 'background 1s ease',
          }} />
        ))}
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 40px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, -30px) scale(1.05); }
        }
        @keyframes particle {
          0% { transform: translate(0, 0); opacity: 0.2; }
          100% { transform: translate(20px, -30px); opacity: 0.5; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.3); }
          50% { box-shadow: 0 0 40px rgba(34,197,94,0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.6s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.6s 0.4s ease both; }
        .fade-up-5 { animation: fadeUp 0.6s 0.5s ease both; }
        .mood-btn:hover { transform: translateY(-4px) scale(1.05) !important; }
        .mood-btn:active { transform: scale(0.97) !important; }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '460px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-block',
            fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#6b7280', marginBottom: '12px',
            padding: '4px 12px', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', background: 'rgba(255,255,255,0.03)',
          }}>
            Mood-based discovery
          </div>

          {/* ✅ Fixed — dynamic import with ssr:false prevents gradient block */}
          <GradientTitle
            gradient={selectedMoodData
              ? `linear-gradient(135deg, ${selectedMoodData.color}, #fff)`
              : 'linear-gradient(135deg, #fff, #6b7280)'
            }
          >
            Vibe & Go
          </GradientTitle>

          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Find the perfect place for your mood
          </p>
        </div>

        {/* Weather Banner */}
        {weather && (
          <div className="fade-up-1" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '12px 16px', marginBottom: '16px',
          }}>
            <span style={{ fontSize: '24px' }}>{weather.emoji}</span>
            <p style={{ color: '#d1d5db', fontSize: '13px' }}>{weather.suggestion}</p>
          </div>
        )}

        {/* Location Bar */}
        <div className="fade-up-2" style={{ marginBottom: '24px' }}>
          {!manualMode ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '12px 16px',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px rgba(34,197,94,0.8)',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }} />
              <span style={{ color: '#d1d5db', fontSize: '14px', flex: 1 }}>{cityName}</span>
              <button onClick={() => setManualMode(true)} style={{
                fontSize: '12px', color: '#6b7280',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '4px 10px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                ✏️ Change
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualLocation()}
                  placeholder="Enter city e.g. Delhi, Mumbai..."
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '14px', padding: '12px 16px',
                    color: '#fff', fontSize: '14px', outline: 'none',
                  }}
                />
                <button onClick={handleManualLocation} disabled={manualLoading} style={{
                  padding: '12px 18px', borderRadius: '14px',
                  background: 'rgba(34,197,94,0.2)',
                  border: '1px solid rgba(34,197,94,0.4)',
                  color: '#22c55e', fontSize: '14px', cursor: 'pointer',
                  fontWeight: '600', transition: 'all 0.2s',
                }}>
                  {manualLoading ? '...' : '📍'}
                </button>
              </div>
              <button onClick={() => setManualMode(false)} style={{
                fontSize: '12px', color: '#4b5563', marginTop: '8px',
                background: 'none', border: 'none', cursor: 'pointer',
              }}>
                ← Use current location
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="fade-up-3" style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '4px', marginBottom: '20px',
        }}>
          {[
            { id: 'mood', label: '😊 Pick Mood' },
            { id: 'ai',   label: '🤖 AI Vibe'  },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '10px', borderRadius: '12px',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              transition: 'all 0.2s', border: 'none',
              background: activeTab === tab.id
                ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#6b7280',
              boxShadow: activeTab === tab.id
                ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mood Tab */}
        {activeTab === 'mood' && (
          <div className="fade-up-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Choose your mood
              </p>
              <button onClick={handleRandomVibe} style={{
                fontSize: '12px', padding: '6px 12px',
                borderRadius: '10px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#9ca3af', transition: 'all 0.2s',
              }}>
                🎲 Random Vibe
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {MOODS.map((mood, i) => (
                <button key={mood.id} onClick={() => setSelectedMood(mood.id)}
                  className="mood-btn"
                  style={{
                    borderRadius: '20px', padding: '16px 8px', textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    border: selectedMood === mood.id
                      ? `1.5px solid ${mood.color}`
                      : '1px solid rgba(255,255,255,0.07)',
                    background: selectedMood === mood.id
                      ? `linear-gradient(135deg, ${mood.color}25, ${mood.color}10)`
                      : 'rgba(255,255,255,0.03)',
                    boxShadow: selectedMood === mood.id
                      ? `0 8px 32px ${mood.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
                      : 'none',
                    animation: `fadeUp 0.5s ${i * 0.05}s ease both`,
                  }}>
                  <span style={{ fontSize: '26px', display: 'block', marginBottom: '6px' }}>{mood.emoji}</span>
                  <span style={{
                    color: selectedMood === mood.id ? mood.color : '#e5e7eb',
                    fontSize: '12px', fontWeight: '600', display: 'block',
                  }}>
                    {mood.label}
                  </span>
                  <span style={{ color: '#4b5563', fontSize: '10px', display: 'block', marginTop: '2px' }}>
                    {mood.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div className="fade-up-3" style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Tell AI how you feel
            </p>
            <div style={{ position: 'relative' }}>
              <textarea
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="e.g. I want somewhere quiet with good coffee and good vibes..."
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px', padding: '16px',
                  color: '#fff', fontSize: '14px',
                  resize: 'none', outline: 'none',
                  lineHeight: '1.6', fontFamily: 'var(--font-satoshi)',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                }}
                rows={3}
              />
            </div>
            <button onClick={handleAISearch} disabled={!aiText.trim() || aiLoading} style={{
              width: '100%', marginTop: '10px', padding: '14px',
              borderRadius: '14px', fontSize: '14px', fontWeight: '600',
              cursor: aiText.trim() ? 'pointer' : 'not-allowed',
              border: 'none', transition: 'all 0.3s',
              background: aiText.trim()
                ? 'linear-gradient(135deg, #a855f7, #3b82f6)'
                : 'rgba(255,255,255,0.05)',
              color: aiText.trim() ? '#fff' : '#4b5563',
              boxShadow: aiText.trim() ? '0 4px 24px rgba(168,85,247,0.4)' : 'none',
            }}>
              {aiLoading ? '🤖 AI is thinking...' : '✨ Get AI Suggestion'}
            </button>

            {aiResult && (
              <div style={{
                marginTop: '16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '16px',
                animation: 'fadeUp 0.4s ease both',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '28px' }}>{aiResult.emoji}</span>
                  <div>
                    <p style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: '500' }}>{aiResult.reason}</p>
                    {aiResult.timeNote && (
                      <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{aiResult.timeNote}</p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {aiResult.vibes?.map(v => (
                    <span key={v} style={{
                      fontSize: '11px', padding: '3px 10px',
                      borderRadius: '20px',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      {v}
                    </span>
                  ))}
                </div>
                <p style={{ color: '#22c55e', fontSize: '12px', marginTop: '10px' }}>
                  ✅ Mood set to: <strong>{aiResult.mood}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Budget Filter */}
        <div className="fade-up-4" style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Budget (optional)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {BUDGETS.map(b => (
              <button key={b.id} onClick={() => setSelectedBudget(selectedBudget === b.id ? null : b.id)} style={{
                padding: '10px 4px', borderRadius: '14px',
                textAlign: 'center', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
                borderColor: selectedBudget === b.id ? '#22c55e' : 'rgba(255,255,255,0.08)',
                background: selectedBudget === b.id ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                color: selectedBudget === b.id ? '#22c55e' : '#6b7280',
                boxShadow: selectedBudget === b.id ? '0 4px 16px rgba(34,197,94,0.2)' : 'none',
              }}>
                <div style={{ fontSize: '16px', marginBottom: '2px' }}>{b.emoji}</div>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <div className="fade-up-5">
          <button onClick={handleSearch}
            disabled={!selectedMood || !location || loading}
            style={{
              width: '100%', padding: '16px',
              borderRadius: '20px', fontSize: '15px', fontWeight: '700',
              cursor: selectedMood ? 'pointer' : 'not-allowed',
              border: 'none', transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              background: selectedMoodData
                ? `linear-gradient(135deg, ${selectedMoodData.color}, ${selectedMoodData.color}aa)`
                : 'rgba(255,255,255,0.05)',
              color: selectedMood ? '#fff' : '#4b5563',
              boxShadow: selectedMoodData
                ? `0 8px 32px ${selectedMoodData.glow}`
                : 'none',
              transform: selectedMood ? 'scale(1)' : 'scale(0.98)',
              letterSpacing: '0.02em',
            }}>
            {loading
              ? '✨ Finding your vibe...'
              : selectedMoodData
                ? `${selectedMoodData.emoji} Find ${selectedMoodData.label} spots near me →`
                : 'Select a mood to continue'}
          </button>
        </div>

      </div>
    </main>
  )
}
