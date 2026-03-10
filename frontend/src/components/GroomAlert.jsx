export default function GroomAlert({ result }) {
  const confidence = Math.round(result.score * 100)
  return (
    <div className="groom-alert">
      ⚠️ Warning: {result.reason} ({confidence}% confidence)
    </div>
  )
}
