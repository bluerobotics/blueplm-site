import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Downloads from './pages/Downloads'
import Privacy from './pages/Privacy'

// Marketplace
import MarketplaceLayout from './layouts/MarketplaceLayout'
import MarketplaceIndex from './pages/marketplace/Index'
import Extension from './pages/marketplace/Extension'
import Publisher from './pages/marketplace/Publisher'
import Submit from './pages/marketplace/Submit'

// Admin
import AdminLayout from './layouts/AdminLayout'
import { Login, Callback, Dashboard, Submissions, Submission, Settings } from './pages/admin'

// Check if we're on the marketplace subdomain
const isMarketplaceSubdomain = window.location.hostname.startsWith('marketplace.')

function App() {
  // If on marketplace subdomain, show marketplace at root
  if (isMarketplaceSubdomain) {
    return (
      <Routes>
        <Route path="/" element={<MarketplaceLayout />}>
          <Route index element={<MarketplaceIndex />} />
          <Route path="extensions/:id" element={<Extension />} />
          <Route path="publishers/:id" element={<Publisher />} />
          <Route path="submit" element={<Submit />} />
        </Route>
        {/* Admin routes on subdomain */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/callback" element={<Callback />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="submissions/:id" element={<Submission />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        {/* Redirect /marketplace to root on subdomain */}
        <Route path="/marketplace/*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {/* Main site routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="downloads" element={<Downloads />} />
        <Route path="privacy" element={<Privacy />} />
      </Route>

      {/* Marketplace routes */}
      <Route path="/marketplace" element={<MarketplaceLayout />}>
        <Route index element={<MarketplaceIndex />} />
        <Route path="extensions/:id" element={<Extension />} />
        <Route path="publishers/:id" element={<Publisher />} />
        <Route path="submit" element={<Submit />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/callback" element={<Callback />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="submissions/:id" element={<Submission />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
