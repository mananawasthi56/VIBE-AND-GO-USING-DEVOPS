'use client'

export default function MapView({ places, lat, lon, color }) {

  function openInGoogleMaps(placeLat, placeLon, placeName) {
    const url = `https://www.google.com/maps/search/?api=1&query=${placeLat},${placeLon}`
    window.open(url, '_blank')
  }

  function openDirections(placeLat, placeLon) {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${placeLat},${placeLon}`
    window.open(url, '_blank')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
      {places.map((place, index) => (
        <div key={index} style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}>
          {/* Place info */}
          <div>
            <p style={{ color: '#fff', fontWeight: '700', fontSize: '14px', margin: 0 }}>{place.name}</p>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>{place.category}</p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => openInGoogleMaps(place.lat, place.lon, place.name)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}>
              📍 View
            </button>

            <button
              onClick={() => openDirections(place.lat, place.lon)}
              style={{
                background: color,
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}>
              🗺️ Directions
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}