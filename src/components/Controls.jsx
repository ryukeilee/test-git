export default function Controls({ mode, difficulty, onModeChange, onDifficultyChange, disabled }) {
  return (
    <div style={{
      display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center',
      padding: '12px 0', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {['pvp', 'pve'].map(m => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            disabled={disabled}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: 6,
              background: mode === m ? '#2c3e50' : '#ddd',
              color: mode === m ? '#fff' : '#333',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: mode === m ? 600 : 400,
            }}
          >
            {m === 'pvp' ? '双人对战' : '人机对战'}
          </button>
        ))}
      </div>

      {mode === 'pve' && (
        <select
          value={difficulty}
          onChange={e => onDifficultyChange(e.target.value)}
          disabled={disabled}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 14,
            background: '#fff',
          }}
        >
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      )}
    </div>
  );
}
