export default function InputBar({ value, onChange, onSend, disabled }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend(value)
    }
  }

  return (
    <div className="input-bar">
      <input
        type="text"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button onClick={() => onSend(value)} disabled={disabled}>
        Send
      </button>
    </div>
  )
}
