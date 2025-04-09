// import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'

// Components
import Navbar from './components/Navbar'
import ProtectedRoute from './components/Containers/ProtectedRoute'

// Pages
import Research from './pages/Research'
import CaseList from './pages/CaseList'
import CaseDetail from './pages/CaseDetail'
import ClientChatSession from './pages/ClientChatSession'
import Login from './pages/Auth/Login'

// Context
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes that require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/research" element={<Research />} />
              <Route path="/case" element={<CaseList />} />
              <Route path="/case/:caseId" element={<CaseDetail />} />
              <Route path="/chat/:sessionId" element={<ClientChatSession />} />
              <Route path="/settings" element={<div>Settings Page</div>} />
            </Route>
          </Route>
          
          {/* Redirect to login if not authenticated, otherwise to research */}
          <Route path="*" element={<Navigate to="/research" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

// Layout for protected routes that includes the Navbar
const ProtectedLayout = () => (
  <div className="w-full">
    <Navbar />
    <div className="ml-56">
      <Outlet />
    </div>
  </div>
)

export default App
