import { useState } from 'react'
import { supabase } from '../lib/supabase'

const EMOJIS = ['🏖','🏕️','✈️','🏔️','🎡','🏄','⛷️','🚣','🎣','🌊','🍕','🎸','🌴','🏟️','🎆','🚗','🛶','🧗','🎭','🍸']

export default function ProposeTrip({ userName, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    emoji: '🏖️',
    title: '',
    description: '',
    cost: '',
    duration: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Please add a title.'); return }
    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('trips').insert({
      emoji: form.emoji,
      title: form.title.trim(),
      description: form.description.trim(),
      cost: form.cost.trim(),
      duration: form.duration.trim(),
      proposed_by: userName,
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    onSuccess()
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <button
        onClick={onCancel}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
      >
        ← Back
      </button>

      <h2 className="serif" style={{ fontSize: 28, letterSpacing: '-0.5px', marginBottom: 4 }}>Propose a trip</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: '2rem' }}>
        Share the idea — your friends will tell you if they're in.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        <div>
          <label style={labelStyle}>Pick an emoji</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EMOJIS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => set('emoji', e)}
                style={{
                  width: 40,
                  height: 40,
                  fontSize: 20,
                  border: form.emoji === e ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 8,
                  background: form.emoji === e ? 'var(--accent-light)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.1s',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Trip name *</label>
          <input
            type="text"
            placeholder="e.g. Big Bear cabin weekend"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            placeholder="What's the vibe? What will you do?"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Estimated cost per person</label>
            <input
              type="text"
              placeholder="e.g. ~$150"
              value={form.cost}
              onChange={e => set('cost', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
            />
          </div>
          <div>
            <label style={labelStyle}>Duration</label>
            <input
              type="text"
              placeholder="e.g. Weekend (Fri–Sun)"
              value={form.duration}
              onChange={e => set('duration', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
            />
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--no)', fontSize: 13 }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 24px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Posting...' : 'Post trip →'}
          </button>
        </div>
      </form>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--text-muted)',
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  border: '1.5px solid var(--border-strong)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-card)',
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 0.15s',
}
