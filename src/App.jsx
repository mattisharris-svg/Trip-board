import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Feed from './components/Feed.jsx'
import ProposeTrip from './components/ProposeTrip.jsx'
import TripDetail from './components/TripDetail.jsx'
import UserSetup from './components/UserSetup.jsx'

export default function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem('trip_board_name') || '')
  const [view, setView] = useState('feed')
  const [selectedTripId, setSelectedTripId] = useState(null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrips()

    const channel = supabase
      .channel('trips-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, fetchTrips)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'responses' }, fetchTrips)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchTrips() {
    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        responses (id, user_name, interest, months)
      `)
      .order('created_at', { ascending: false })

    if (!error) setTrips(data || [])
    setLoading(false)
  }

  function handleSaveName(name) {
    localStorage.setItem('trip_board_name', name)
    setUserName(name)
  }

  function openTrip(id) {
    setSelectedTripId(id)
    setView('detail')
  }

  function goBack() {
    setView('feed')
    setSelectedTripId(null)
    fetchTrips()
  }

  if (!userName) {
    return <UserSetup onSave={handleSaveName} />
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        view={view}
        userName={userName}
        onFeed={() => { setView('feed'); setSelectedTripId(null) }}
        onPropose={() => setView('propose')}
      />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        {view === 'feed' && (
          <Feed trips={trips} loading={loading} userName={userName} onOpenTrip={openTrip} onRefresh={fetchTrips} />
        )}
        {view === 'propose' && (
          <ProposeTrip userName={userName} onSuccess={() => { setView('feed'); fetchTrips() }} onCancel={() => setView('feed')} />
        )}
        {view === 'detail' && selectedTripId && (
          <TripDetail
            trip={trips.find(t => t.id === selectedTripId)}
            userName={userName}
            onBack={goBack}
            onRefresh={fetchTrips}
          />
        )}
      </main>
    </div>
  )
}

function Header({ view, userName, onFeed, onPropose }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '0 1.25rem',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={onFeed}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span className="serif" style={{ fontSize: 22, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            trip board
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Hey, {userName}
          </span>
          <button
            onClick={onPropose}
            style={{
              background: view === 'propose' ? 'var(--text)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              transition: 'opacity 0.15s',
            }}
            onMouseOver={e => e.target.style.opacity = '0.85'}
            onMouseOut={e => e.target.style.opacity = '1'}
          >
            + Propose trip
          </button>
        </div>
      </div>
    </header>
  )
}
