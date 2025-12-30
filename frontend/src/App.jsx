import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/UserContext'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <UserProvider>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-[#f3f2ef] text-gray-900 font-sans">
        <AppRoutes />
      </div>
    </UserProvider>
  )
}

export default App
