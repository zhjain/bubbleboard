import { Presence } from 'phoenix'

export default () => ({
  messages: [],
  input: '',
  presences: {},
  online_count: 0,
  loaded: false,
  showChat: true,

  init() {
    const presence = new Presence(this.$store.channel.chan)

    presence.onSync(() => {
      const presences = presence.list((id, presence) => ({
        id,
        user: presence.metas[0].user,
        onlineAt: presence.metas[0].online_at,
      }))
      console.log('当前在线用户:', presences)
      this.online_count = presences.length
      this.presences = presences
    })

    this.$store.channel.chan.on('message:new', (payload) => {
      console.log('New message received:', payload)
      this.addMessage(payload)
    })

    this.$store.channel.chan.on('message:history', (payload) => {
      console.log('Message history received:', payload)
      this.messages = payload.messages.reverse()
      this.$nextTick(() => {
        const container = this.$refs.messageContainer
        if (!container) return
        container.scrollTop = container.scrollHeight
        this.loaded = true
      })
    })
  },

  handleSubmit(event) {
    event.preventDefault()
    let messageInput = this.input.trim()
    if (messageInput) {
      this.$store.channel.chan
        .push('message:new', { body: messageInput })
        .receive('ok', (resp) => console.log('Message sent successfully', resp))
        .receive('error', (resp) => console.log('Failed to send message', resp))
      this.input = ''
    }
  },

  scrollToBottom() {
    this.$nextTick(() => {
      const container = this.$refs.messageContainer
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      })
    })
  },

  addMessage(message) {
    this.messages.push(message)

    const container = this.$refs.messageContainer
    const isAtBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 50
    if (isAtBottom) {
      this.scrollToBottom()
    } else {
      // 可选：显示新消息提醒
    }
  },
})
