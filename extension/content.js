let enabled = true

chrome.storage.local.get('enabled', (data) => {
  if (data.enabled !== undefined) enabled = data.enabled
})

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) enabled = changes.enabled.newValue
})

// ── Selectors for supported sites ──────────────────────────────────────────

function getInputSelector() {
  const host = location.hostname
  if (host.includes('chatgpt.com') || host.includes('openai.com')) {
    return '#prompt-textarea'
  }
  if (host.includes('gemini.google.com')) {
    return '.ql-editor'
  }
  return null
}

function getResponseSelector() {
  const host = location.hostname
  if (host.includes('chatgpt.com') || host.includes('openai.com')) {
    return '[data-message-author-role="assistant"] .markdown'
  }
  if (host.includes('gemini.google.com')) {
    return 'message-content .markdown'
  }
  return null
}

// ── PII Redaction ───────────────────────────────────────────────────────────

async function shieldText(text) {
  try {
    const res = await fetch('http://localhost:8000/shield', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    return await res.json()
  } catch {
    return null
  }
}

async function analyzeText(text) {
  try {
    const res = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    return await res.json()
  } catch {
    return null
  }
}

// ── Input interception ──────────────────────────────────────────────────────

function submitChat() {
  const btn =
    document.querySelector('[data-testid="send-button"]') ||
    document.querySelector('button[aria-label="Send message"]') ||
    document.querySelector('form button[type="submit"]')
  if (btn) {
    btn.click()
  }
}

function interceptInput(inputEl) {
  if (inputEl._shieldAttached) return
  inputEl._shieldAttached = true

  inputEl.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter' || e.shiftKey || !enabled) return

    const text = inputEl.innerText || inputEl.value
    if (!text.trim()) return

    // Prevent SYNCHRONOUSLY before any await so ChatGPT can't send yet
    e.preventDefault()
    e.stopImmediatePropagation()

    const result = await shieldText(text)

    if (result && result.entities_found.length > 0) {
      // Update input with redacted text
      if (inputEl.isContentEditable) {
        inputEl.innerText = result.redacted_text
        // Trigger React's onChange by dispatching an input event
        inputEl.dispatchEvent(new Event('input', { bubbles: true }))
        // Move cursor to end
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(inputEl)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
      } else {
        inputEl.value = result.redacted_text
        inputEl.dispatchEvent(new Event('input', { bubbles: true }))
      }
      showShieldToast(result.entities_found)
    }

    // Submit with either redacted or original text
    setTimeout(() => submitChat(), 50)
  }, true)
}

// ── Response monitoring ─────────────────────────────────────────────────────

const analyzedNodes = new WeakSet()

async function checkResponse(el) {
  if (analyzedNodes.has(el)) return
  analyzedNodes.add(el)

  const text = el.innerText?.trim()
  if (!text || text.length < 20) return

  const result = await analyzeText(text)
  if (result?.flagged) {
    showGroomBanner(el, result)
  }
}

// ── Toast / Banner UI ───────────────────────────────────────────────────────

function showShieldToast(entities) {
  const existing = document.getElementById('ps-toast')
  if (existing) existing.remove()

  const types = [...new Set(entities.map((e) =>
    e.type.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ')
  ))]

  const toast = document.createElement('div')
  toast.id = 'ps-toast'
  toast.style.cssText = `
    position: fixed; bottom: 80px; right: 20px; z-index: 99999;
    background: #1e293b; color: white; padding: 10px 16px;
    border-radius: 8px; font-size: 13px; font-family: sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex; align-items: center; gap: 8px;
  `
  toast.innerHTML = `🔒 <strong>PromptShield:</strong> Redacted ${types.join(', ')}`
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 4000)
}

function showGroomBanner(el, result) {
  const existing = el.parentNode.querySelector('.ps-groom-banner')
  if (existing) return

  const confidence = Math.round(result.score * 100)
  const banner = document.createElement('div')
  banner.className = 'ps-groom-banner'
  banner.style.cssText = `
    background: #fee2e2; border: 1px solid #ef4444; color: #991b1b;
    padding: 8px 12px; border-radius: 8px; font-size: 13px;
    font-family: sans-serif; margin-top: 8px;
  `
  banner.innerHTML = `⚠️ <strong>AIGroomDetect:</strong> ${result.reason} (${confidence}% confidence)`
  el.parentNode.insertBefore(banner, el.nextSibling)
}

// ── MutationObserver ────────────────────────────────────────────────────────

const observer = new MutationObserver(() => {
  if (!enabled) return

  const inputSel = getInputSelector()
  if (inputSel) {
    const inputEl = document.querySelector(inputSel)
    if (inputEl) interceptInput(inputEl)
  }

  const respSel = getResponseSelector()
  if (respSel) {
    document.querySelectorAll(respSel).forEach((el) => {
      checkResponse(el)
    })
  }
})

observer.observe(document.body, { childList: true, subtree: true })
