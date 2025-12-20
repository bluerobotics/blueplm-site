import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Downloads from './pages/Downloads'
import Donate from './pages/Donate'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="downloads" element={<Downloads />} />
        <Route path="donate" element={<Donate />} />
      </Route>
    </Routes>
  )
}

export default App
