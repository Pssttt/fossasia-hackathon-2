const toggle = document.getElementById('toggle')
const statusEl = document.querySelector('#status span')
const passwordInput = document.getElementById('password-input')
const passwordSave = document.getElementById('password-save')
const passwordSaved = document.getElementById('password-saved')

// Load saved state
chrome.storage.local.get(['enabled', 'parentalPassword'], (data) => {
  toggle.checked = data.enabled !== false
  if (data.parentalPassword) passwordInput.placeholder = '••••••••'
})

// Save on toggle
toggle.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: toggle.checked })
})

// Save password
passwordSave.addEventListener('click', () => {
  const pwd = passwordInput.value.trim()
  if (!pwd) return
  chrome.storage.local.set({ parentalPassword: pwd }, () => {
    passwordInput.value = ''
    passwordInput.placeholder = '••••••••'
    passwordSaved.style.display = 'block'
    setTimeout(() => { passwordSaved.style.display = 'none' }, 2000)
  })
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
