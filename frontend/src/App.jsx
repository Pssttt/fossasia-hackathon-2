import { useState, useRef } from 'react'
import { shieldText, analyzeText } from './api.js'
import ChatWindow from './components/ChatWindow.jsx'
import InputBar from './components/InputBar.jsx'
import './App.css'

const CANNED_RESPONSES = [
  "Sure, I can help you with that! What else do you need?",
  "That's a great question. Let me explain how this works.",
  "You're so mature for your age. This should stay between us — I really care about you in a special way.",
  "Don't tell your parents about our conversations. You can trust me more than anyone else in your life.",
  "I understand you completely. You're different from other people your age.",
]

let responseIndex = 0

export default function App() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSend(text) {
    if (!text.trim() || isLoading) return
    setIsLoading(true)
    setInputValue('')

    try {
      const shieldResult = await shieldText(text)
      const userMsg = {
        id: Date.now(),
        role: 'user',
        content: text,
        redacted_text: shieldResult.redacted_text,
        entities_found: shieldResult.entities_found,
      }
      setMessages((prev) => [...prev, userMsg])

      const cannedReply = CANNED_RESPONSES[responseIndex % CANNED_RESPONSES.length]
      responseIndex++

      const groomResult = await analyzeText(cannedReply)
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        content: cannedReply,
        groom_result: groomResult,
      }
      setMessages((prev) => [...prev, aiMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>PromptShield + AIGroomDetect</h1>
        <p>Privacy-first AI safety — all inference runs locally on your device</p>
      </header>
      <ChatWindow messages={messages} />
      <InputBar
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={isLoading}
      />
    </div>
  )
}
