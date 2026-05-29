/**
 * Background Service Worker
 * 
 * Handles:
 * - API authentication and requests to NVIDIA NIM
 * - Message passing with content scripts
 * - CORS handling for API calls
 */

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHAT_QUERY') {
    handleChatQuery(message.payload)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }))
    
    // Keep channel open for async response
    return true
  }
})

/**
 * Handle chat query from content script
 */
async function handleChatQuery(payload: { query: string; dataset: any }) {
  // Retrieve API key from storage
  const result = await chrome.storage.local.get('nvidia_api_key')
  const apiKey = result.nvidia_api_key
  
  if (!apiKey) {
    throw new Error('API key not configured')
  }
  
  // TODO: Implement NVIDIA NIM API call
  // This will be implemented in a later task
  
  return { message: 'Chat query received' }
}
