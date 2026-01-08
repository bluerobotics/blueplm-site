import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Downloads from './pages/Downloads'
import Privacy from './pages/Privacy'

// Extensions
import ExtensionsLayout from './layouts/MarketplaceLayout'
import ExtensionsIndex from './pages/marketplace/Index'
import Extension from './pages/marketplace/Extension'
import Publisher from './pages/marketplace/Publisher'
import Submit from './pages/marketplace/Submit'

// Admin
import AdminLayout from './layouts/AdminLayout'
import { Login, Callback, Dashboard, Submissions, Submission, Settings } from './pages/admin'

// Check if we're on the extensions subdomain
const isExtensionsSubdomain = window.location.hostname.startsWith('extensions.') || window.location.hostname.startsWith('marketplace.')

function App() {
  // If on extensions subdomain, show extensions at root
  if (isExtensionsSubdomain) {
    return (
      <Routes>
        <Route path="/" element={<ExtensionsLayout />}>
          <Route index element={<ExtensionsIndex />} />
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

      {/* Extensions routes (also accessible at /marketplace for backward compat) */}
      <Route path="/marketplace" element={<ExtensionsLayout />}>
        <Route index element={<ExtensionsIndex />} />
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
