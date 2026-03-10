function formatType(type) {
  return type
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}

export default function ShieldBadge({ entities }) {
  const types = [...new Set(entities.map((e) => formatType(e.type)))]
  return (
    <span className="shield-badge">
      🔒 Redacted: {types.join(', ')}
    </span>
  )
}
