import { useState } from 'react'

export default function UserSetup({ onSave }) {
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) return
    onSave(trimmed)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg)',
    }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <h1 className="serif" style={{ fontSize: 42, marginBottom: 8, letterSpacing: '-1px' }}>
          trip board
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 2.5 + 'rem', fontSize: 16 }}>
          Propose trips. See who's in.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            placeholder="What's your name?"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            style={{
              padding: '14px 16px',
              fontSize: 16,
              border: '1.5px solid var(--border-strong)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-card)',
              color: 'var(--text)',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
          />
          <button
            type="submit"
            disabled={name.trim().length < 2}
            style={{
              padding: '14px',
              background: name.trim().length >= 2 ? 'var(--accent)' : 'var(--bg-subtle)',
              color: name.trim().length >= 2 ? '#fff' : 'var(--text-faint)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 15,
              fontWeight: 500,
              transition: 'all 0.15s',
              cursor: name.trim().length >= 2 ? 'pointer' : 'not-allowed',
            }}
          >
            Let's go →
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: 12, color: 'var(--text-faint)' }}>
          No account needed — just a name so friends know who you are.
        </p>
      </div>
    </div>
  )
}
