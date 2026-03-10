const SERVER_URL = 'http://localhost:8000/check'
const MAX_CONCURRENT = 4

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type !== 'IMAGES_FOUND') return
  handleImages(message.images, sender.tab.id)
})

async function handleImages(images, tabId) {
  // Process in batches to limit concurrency
  const safetyMap = {}
  for (let i = 0; i < images.length; i += MAX_CONCURRENT) {
    const batch = images.slice(i, i + MAX_CONCURRENT)
    const results = await Promise.allSettled(batch.map((img) => postImage(img)))
    results.forEach((result, idx) => {
      const img = batch[idx]
      safetyMap[img.src] = result.status === 'fulfilled'
        ? (result.value?.safe_for_children ?? true)
        : true // default safe on error
    })
  }

  chrome.tabs.sendMessage(tabId, { type: 'APPLY_BLUR', safetyMap }, () => {
    if (chrome.runtime.lastError) {
      // Tab was closed or content script not ready — ignore
    }
  })
}

async function postImage(img) {
  const formData = new FormData()

  if (img.dataUrl) {
    const byteStr = atob(img.dataUrl.split(',')[1])
    const mime = img.dataUrl.match(/:(.*?);/)[1]
    const buf = new Uint8Array(byteStr.length)
    for (let i = 0; i < byteStr.length; i++) buf[i] = byteStr.charCodeAt(i)
    formData.append('file', new Blob([buf], { type: mime }), img.filename)
  } else {
    return { safe_for_children: true } // can't read cross-origin image, skip
  }

  const res = await fetch(SERVER_URL, { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
