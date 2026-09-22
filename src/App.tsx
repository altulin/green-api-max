import { ChatWindow } from './components/ChatWindow/ChatWindow'
import { LoginForm } from './components/LoginForm/LoginForm'
import { Sidebar } from './components/Sidebar/Sidebar'
import { useNotifications } from './hooks/useNotifications'
import { useAppSelector } from './store'
import styles from './App.module.scss'

function App() {
  const credentials = useAppSelector((state) => state.auth.credentials)
  const activeChatId = useAppSelector((state) => state.chats.activeChatId)

  // цикл опроса живёт, пока пользователь внутри приложения
  useNotifications()

  if (credentials === null) {
    return <LoginForm />
  }

  // на узком экране показываем что-то одно: список чатов или переписку
  return (
    <div
      className={`${styles.layout} ${activeChatId === null ? '' : styles.chatOpen}`}
    >
      <Sidebar />
      <ChatWindow />
    </div>
  )
}

export default App
