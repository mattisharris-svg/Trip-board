import { useState } from 'react'
import { supabase } from '../lib/supabase'

const INTEREST_LABELS = { yes: 'In', maybe: 'Maybe', no: 'Out' }
const INTEREST_COLORS = {
  yes: { color: 'var(--yes)', bg: 'var(--yes-bg)' },
  maybe: { color: 'var(--maybe)', bg: 'var(--maybe-bg)' },
  no: { color: 'var(--no)', bg: 'var(--no-bg)' },
}

export default function Feed({ trips, loading, userName, onOpenTrip, onRefresh }) {
  if (loading) {
    return (
      <div style={{ paddingTop: '4rem', textAlign: 'center', color: 'var(--text-faint)', fontSize: 14 }}>
        Loading trips...
      </div>
    )
  }

  if (!trips.length) {
    return (
      <div style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
        <p className="serif" style={{ fontSize: 22, marginBottom: 8 }}>No trips yet</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Be the first to propose something.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 className="serif" style={{ fontSize: 28, letterSpacing: '-0.5px' }}>What's being planned</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
          {trips.length} trip{trips.length !== 1 ? 's' : ''} proposed
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {trips.map(trip => (
          <TripCard
            key={trip.id}
            trip={trip}
            userName={userName}
            onOpen={() => onOpenTrip(trip.id)}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  )
}

function TripCard({ trip, userName, onOpen, onRefresh }) {
  const responses = trip.responses || []
  const myResponse = responses.find(r => r.user_name === userName)
  const yes = responses.filter(r => r.interest === 'yes').length
  const maybe = responses.filter(r => r.interest === 'maybe').length
  const total = responses.length

  async function quickRespond(interest, e) {
    e.stopPropagation()
    if (myResponse) {
      await supabase.from('responses').update({ interest }).eq('id', myResponse.id)
    } else {
      await supabase.from('responses').insert({ trip_id: trip.id, user_name: userName, interest, months: [] })
    }
    onRefresh()
  }

  return (
    <div
      onClick={onOpen}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        boxShadow: 'var(--shadow)',
      }}
      onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
      onMouseOut={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>{trip.emoji}</span>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
              {trip.title}
            </h3>
          </div>
          {trip.description && (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
              {trip.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-faint)' }}>
            {trip.cost && <span>💰 {trip.cost}</span>}
            {trip.duration && <span>📅 {trip.duration}</span>}
            <span>by {trip.proposed_by}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
          {total > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
              <strong style={{ color: 'var(--yes)' }}>{yes} in</strong>
              {maybe > 0 && <span> · <strong style={{ color: 'var(--maybe)' }}>{maybe} maybe</strong></span>}
              <div style={{ color: 'var(--text-faint)' }}>{total} response{total !== 1 ? 's' : ''}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
            {['yes', 'maybe', 'no'].map(val => {
              const active = myResponse?.interest === val
              const { color, bg } = INTEREST_COLORS[val]
              return (
                <button
                  key={val}
                  onClick={e => quickRespond(val, e)}
                  style={{
                    padding: '5px 10px',
                    fontSize: 12,
                    fontWeight: 500,
                    border: active ? `1.5px solid ${color}` : '1px solid var(--border)',
                    borderRadius: 20,
                    background: active ? bg : 'transparent',
                    color: active ? color : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  {INTEREST_LABELS[val]}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
