import user from './user'
import messages from './messages'

export default () => ({
  ...user(),
  ...messages(),
})
