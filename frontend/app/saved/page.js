'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const MOODS = {
  adventure: { emoji: '⛰️', color: '#f97316' },
  relaxing:  { emoji: '🌿', color: '#22c55e' },
  romantic:  { emoji: '🌅', color: '#ec4899' },
  foodie:    { emoji: '🍜', color: '#eab308' },
  social:    { emoji: '🎉', color: '#a855f7' },
  culture:   { emoji: '🏛️', color: '#3b82f6' },
  shopping:  { emoji: '🛍️', color: '#f43f5e' },
  fitness:   { emoji: '💪', color: '#ef4444' },
  coffee:    { emoji: '☕', color: '#d97706' },
}

export default function Saved() {
  const router = useRouter()
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [removingId, setRemovingId] = useState(null) // ✅ tracks which card is being removed

  useEffect(() => { fetchSaved() }, [])

  async function fetchSaved() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saved`)
      const data = await res.json()
      // ✅ safety check — make sure data is an array
      setPlaces(Array.isArray(data) ? data : [])
    } catch {
      setPlaces([])
    } finally {
      setLoading(false)
    }
  }

  async function unsave(osmId) {
    setRemovingId(osmId) // ✅ show removing state
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saved/${osmId}`, { method: 'DELETE' })
      // ✅ small delay so user sees the heart change before card disappears
      setTimeout(() => {
        setPlaces(prev => prev.filter(p => p.osm_id !== osmId))
        setRemovingId(null)
      }, 300)
    } catch {
      setRemovingId(null)
    }
  }

  const moods = ['all', ...new Set(places.map(p => p.mood))]
  const filtered = filter === 'all' ? places : places.filter(p => p.mood === filter)

  return (
    <main style={{ minHeight: '100vh', background: '#050508' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-8px); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-out { animation: fadeOut 0.3s ease both; }
        .place-card:hover { transform: translateY(-2px); }
        .heart-btn:hover { transform: scale(1.2); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '460px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'var(--font-clash)',
            fontSize: '36px', fontWeight: '700',
            background: 'linear-gradient(135deg, #ec4899, #fff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Saved Places ❤️
          </h1>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
            {places.length} places saved
          </p>
        </div>

        {/* Mood filter */}
        {places.length > 0 && (
          <div style={{
            display: 'flex', gap: '8px', overflowX: 'auto',
            paddingBottom: '8px', marginBottom: '20px', scrollbarWidth: 'none',
          }}>
            {moods.map(m => {
              const moodInfo = MOODS[m]
              const isActive = filter === m
              return (
                <button key={m} onClick={() => setFilter(m)} style={{
                  padding: '6px 16px', borderRadius: '20px', flexShrink: 0,
                  fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isActive ? (moodInfo?.color || '#fff') : 'rgba(255,255,255,0.08)',
                  background: isActive ? `${moodInfo?.color || '#fff'}18` : 'rgba(255,255,255,0.03)',
                  color: isActive ? (moodInfo?.color || '#fff') : '#6b7280',
                  transition: 'all 0.2s',
                }}>
                  {moodInfo?.emoji || '🌟'} {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              )
            })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{
              width: '36px', height: '36px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTop: '3px solid #ec4899',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto',
            }} />
          </div>
        )}

        {/* Empty state */}
        {!loading && places.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤍</div>
            <p style={{ color: '#6b7280', fontSize: '15px', fontWeight: '500' }}>No saved places yet</p>
            <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '6px' }}>Explore and save places you love!</p>
            <button onClick={() => router.push('/')} style={{
              marginTop: '20px', padding: '12px 24px',
              borderRadius: '14px', fontSize: '14px', fontWeight: '600',
              background: 'rgba(236,72,153,0.2)',
              border: '1px solid rgba(236,72,153,0.3)',
              color: '#ec4899', cursor: 'pointer',
            }}>
              Start Exploring →
            </button>
          </div>
        )}

        {/* Places list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((place, i) => {
            const moodInfo = MOODS[place.mood] || { emoji: '📍', color: '#22c55e' }
            const isRemoving = removingId === place.osm_id
            return (
              <div
                key={place._id || place.osm_id}
                className={`place-card ${isRemoving ? 'fade-out' : ''}`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px', padding: '16px',
                  display: 'flex', gap: '12px', alignItems: 'center',
                  transition: 'all 0.25s',
                  animation: isRemoving ? 'fadeOut 0.3s ease both' : `fadeUp 0.4s ${i * 0.06}s ease both`,
                  opacity: isRemoving ? 0.5 : 1,
                }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0,
                  background: `${moodInfo.color}18`,
                  border: `1px solid ${moodInfo.color}25`,
                }}>
                  {moodInfo.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#f3f4f6', fontWeight: '600', fontSize: '14px' }}>{place.name}</p>
                  <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px', textTransform: 'capitalize' }}>
                    {place.category} · {place.mood}
                  </p>
                  {place.address && (
                    <p style={{ color: '#4b5563', fontSize: '11px', marginTop: '3px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      📍 {place.address}
                    </p>
                  )}
                </div>
                {/* ✅ Heart shows 🤍 while removing, ❤️ otherwise */}
                <button
                  className="heart-btn"
                  onClick={() => unsave(place.osm_id)}
                  style={{
                    fontSize: '20px', background: 'none', border: 'none',
                    cursor: 'pointer', transition: 'transform 0.2s', flexShrink: 0,
                  }}>
                  {isRemoving ? '🤍' : '❤️'}
                </button>
              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}