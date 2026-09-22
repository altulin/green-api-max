import { ChatWindow } from './components/ChatWindow/ChatWindow'
import { LoginForm } from './components/LoginForm/LoginForm'
import { Sidebar } from './components/Sidebar/Sidebar'
import { useNotifications } from './hooks/useNotifications'
import { useAppSelector } from './store'
import styles from './App.module.scss'

function App() {
  const credentials = useAppSelector((state) => state.auth.credentials)

  // цикл опроса живёт, пока пользователь внутри приложения
  useNotifications()

  if (credentials === null) {
    return <LoginForm />
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <ChatWindow />
    </div>
  )
}

export default App
