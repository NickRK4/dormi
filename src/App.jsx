import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './components/Login'
import UserType from './components/UserType'
import Questions from './components/Questions'
import AdditionalRent from './components/AdditionalRent'
import AdditionalSublease from './components/AdditionalSublease'
import Matches from './components/Matches'
import Chat from './components/Chat'
import ChatList from './components/ChatList'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/user-type" element={
            <PrivateRoute>
              <UserType />
            </PrivateRoute>
          } />
          <Route path="/questions" element={
            <PrivateRoute>
              <Questions />
            </PrivateRoute>
          } />
          <Route path="/additional-rent" element={
            <PrivateRoute>
              <AdditionalRent />
            </PrivateRoute>
          } />
          <Route path="/additional-sublease" element={
            <PrivateRoute>
              <AdditionalSublease />
            </PrivateRoute>
          } />
          <Route path="/matches" element={
            <PrivateRoute>
              <Matches />
            </PrivateRoute>
          } />
          <Route path="/chat/:matchId" element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
          <Route path="/chats" element={
            <PrivateRoute>
              <ChatList />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
