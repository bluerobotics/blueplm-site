import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import DonationBar from './DonationBar'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 animated-gradient" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      </div>
      
      <DonationBar current={0} goal={1000} />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

