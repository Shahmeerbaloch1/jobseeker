import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/UserContext'
import { SocketProvider } from './context/SocketContext'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <Toaster position="top-center" />
        <div className="min-h-screen bg-[#f3f2ef] text-gray-900 font-sans">
          <AppRoutes />
        </div>
      </SocketProvider>
    </UserProvider>
  )
}

export default App
