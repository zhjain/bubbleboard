import chat from './chat'
import whiteboard from './whiteboard/whiteboard'
import channel_store from './channel_store'

document.addEventListener('alpine:init', () => {
  Alpine.store('channel', channel_store)

  Alpine.data('chat', chat)

  Alpine.data('whiteboard', whiteboard)
})
