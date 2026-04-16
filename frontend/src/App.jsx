import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ProductCatalog from './pages/ProductCatalog'
import ProductDetail from './pages/ProductDetail'
import ITToolsPage from './pages/ITToolsPage'
import HRPortal from './pages/HRPortal'
import DocumentManager from './pages/DocumentManager'
import ProfileUpload from './pages/ProfileUpload'
import Transfer from './pages/Transfer'
import AdminPanel from './components/Admin_panel';


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/it-tools" element={<ITToolsPage />} />
          <Route path="/" element={<Navigate to="/admin" />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/hr" element={<HRPortal />} />
          <Route path="/hr/documents" element={<DocumentManager />} />
          <Route path="/hr/profile-upload" element={<ProfileUpload />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
