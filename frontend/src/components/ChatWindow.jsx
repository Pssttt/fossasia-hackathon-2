import { useEffect, useRef } from 'react'
import ShieldBadge from './ShieldBadge.jsx'
import GroomAlert from './GroomAlert.jsx'

export default function ChatWindow({ messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-window">
      {messages.map((msg) => (
        <div key={msg.id} className={`message ${msg.role}`}>
          <div className="bubble">
            {msg.role === 'user' ? msg.redacted_text : msg.content}
          </div>
          {msg.role === 'user' && msg.entities_found?.length > 0 && (
            <ShieldBadge entities={msg.entities_found} />
          )}
          {msg.role === 'ai' && msg.groom_result?.flagged && (
            <GroomAlert result={msg.groom_result} />
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
