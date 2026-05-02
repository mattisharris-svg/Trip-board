import { useState } from 'react'
import { supabase } from '../lib/supabase'

const MONTHS = ['June', 'July', 'August', 'September', 'October']
const INTEREST_CONFIG = {
  yes:   { label: 'I\'m in!',    color: 'var(--yes)',   bg: 'var(--yes-bg)',   emoji: '✓' },
  maybe: { label: 'Maybe',       color: 'var(--maybe)', bg: 'var(--maybe-bg)', emoji: '~' },
  no:    { label: 'Not for me',  color: 'var(--no)',    bg: 'var(--no-bg)',    emoji: '✕' },
}

export default function TripDetail({ trip, userName, onBack, onRefresh }) {
  if (!trip) return null

  const responses = trip.responses || []
  const myResponse = responses.find(r => r.user_name === userName)

  const [interest, setInterest] = useState(myResponse?.interest || null)
  const [months, setMonths] = useState(myResponse?.months || [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleMonth(m) {
    setMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  async function saveResponse() {
    if (!interest) return
    setSaving(true)
    if (myResponse) {
      await supabase.from('responses').update({ interest, months }).eq('id', myResponse.id)
    } else {
      await supabase.from('responses').insert({ trip_id: trip.id, user_name: userName, interest, months })
    }
    setSaving(false)
    setSaved(true)
    onRefresh()
    setTimeout(() => setSaved(false), 2500)
  }

  const yes = responses.filter(r => r.interest === 'yes')
  const maybe = responses.filter(r => r.interest === 'maybe')
  const no = responses.filter(r => r.interest === 'no')
  const total = responses.length

  const monthCounts = {}
  responses.forEach(r => (r.months || []).forEach(m => { monthCounts[m] = (monthCounts[m] || 0) + 1 }))
  const topMonths = MONTHS.filter(m => monthCounts[m]).sort((a, b) => (monthCounts[b] || 0) - (monthCounts[a] || 0))

  return (
    <div>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
      >
        ← All trips
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>{trip.emoji}</div>
        <h1 className="serif" style={{ fontSize: 32, letterSpacing: '-0.5px', marginBottom: 6 }}>{trip.title}</h1>
        {trip.description && (
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>{trip.description}</p>
        )}
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-faint)' }}>
          {trip.cost && <span>💰 {trip.cost}</span>}
          {trip.duration && <span>📅 {trip.duration}</span>}
          <span>Proposed by {trip.proposed_by}</span>
        </div>
      </div>

      {total > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: '2rem',
        }}>
          {[
            { label: 'In', count: yes.length, color: 'var(--yes)', bg: 'var(--yes-bg)' },
            { label: 'Maybe', count: maybe.length, color: 'var(--maybe)', bg: 'var(--maybe-bg)' },
            { label: 'Out', count: no.length, color: 'var(--no)', bg: 'var(--no-bg)' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg,
              borderRadius: 'var(--radius)',
              padding: '1rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 12, color: s.color, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow)',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: '1rem' }}>
          {myResponse ? 'Update your response' : 'Are you in?'}
        </h3>

        <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
          {Object.entries(INTEREST_CONFIG).map(([val, cfg]) => (
            <button
              key={val}
              onClick={() => setInterest(val)}
              style={{
                flex: 1,
                padding: '10px 8px',
                fontSize: 13,
                fontWeight: 500,
                border: interest === val ? `2px solid ${cfg.color}` : '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: interest === val ? cfg.bg : 'transparent',
                color: interest === val ? cfg.color : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500 }}>
            Which months work for you?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MONTHS.map(m => (
              <button
                key={m}
                onClick={() => toggleMonth(m)}
                style={{
                  padding: '6px 14px',
                  fontSize: 13,
                  border: months.includes(m) ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 20,
                  background: months.includes(m) ? 'var(--accent-light)' : 'transparent',
                  color: months.includes(m) ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: months.includes(m) ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={saveResponse}
            disabled={!interest || saving}
            style={{
              padding: '10px 20px',
              background: interest && !saving ? 'var(--accent)' : 'var(--bg-subtle)',
              color: interest && !saving ? '#fff' : 'var(--text-faint)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              cursor: interest && !saving ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            {saving ? 'Saving...' : myResponse ? 'Update' : 'Submit response'}
          </button>
          {saved && (
            <span style={{ fontSize: 13, color: 'var(--yes)', fontWeight: 500 }}>
              ✓ Saved!
            </span>
          )}
        </div>
      </div>

      {topMonths.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 
