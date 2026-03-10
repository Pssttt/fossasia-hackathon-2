const toggle = document.getElementById('toggle')
const statusEl = document.querySelector('#status span')

// Load saved state
chrome.storage.local.get('enabled', (data) => {
  toggle.checked = data.enabled !== false
})

// Save on toggle
toggle.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: toggle.checked })
})

// Check backend health
fetch('http://localhost:8000/health')
  .then((res) => res.json())
  .then((data) => {
    if (data.status === 'ok') {
      statusEl.textContent = 'connected'
      statusEl.style.color = '#22c55e'
    }
  })
  .catch(() => {
    statusEl.textContent = 'offline — start backend'
    statusEl.style.color = '#ef4444'
  })
