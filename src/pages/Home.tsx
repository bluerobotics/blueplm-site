import { Link } from 'react-router-dom'
import { 
  Lock, History, GitBranch, Users, FolderSync, Trash2, 
  FileCheck, Workflow, Cog, Database, Cloud,
  Download, ArrowRight, Star, Building2, ChevronRight, Play
} from 'lucide-react'

const features = [
  { icon: Lock, title: 'Check In / Check Out', description: 'Exclusive file locking with multi-machine tracking.' },
  { icon: History, title: 'Version Control', description: 'Full history with one-click rollback.' },
  { icon: GitBranch, title: 'File States', description: 'WIP → In Review → Released → Obsolete.' },
  { icon: Users, title: 'Real-time Sync', description: 'Instant updates across all clients.' },
  { icon: FolderSync, title: 'Multi-vault', description: 'Organize by project with per-vault permissions.' },
  { icon: Trash2, title: 'Trash & Recovery', description: 'Soft delete with full restore capability.' },
]

const integrations = [
  { icon: Cog, title: 'SolidWorks', description: 'Native add-in with thumbnails and BOM extraction.' },
  { icon: Cloud, title: 'Google Drive', description: 'Browse and edit Docs, Sheets, Slides inline.' },
  { icon: Database, title: 'REST API', description: 'Fastify server with Swagger docs and webhooks.' },
  { icon: Building2, title: 'Odoo ERP', description: 'Sync suppliers and products automatically.' },
]

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm mb-8 animate-fade-in">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-300">Open Source · MIT License</span>
              <a
                href="https://github.com/bluerobotics/bluePLM"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ocean-400 hover:text-ocean-300 font-medium flex items-center gap-1"
              >
                Star on GitHub
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
              <span className="text-white">Open-source </span>
              <span className="text-gradient">Product Lifecycle Management</span>
              <span className="text-white"> for everyone who builds.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4 animate-slide-up delay-100">
              Version control, check-in/check-out, ECOs, workflows, reviews, 
              real-time collaboration, SolidWorks integration, and more.
            </p>
            <p className="text-base text-gray-500 max-w-xl mx-auto mb-10 animate-slide-up delay-200">
              Enterprise PLM costs <span className="line-through text-gray-600">$10,000+/year</span>. 
              BluePLM is <span className="text-green-400 font-semibold">free forever</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
              <Link
                to="/downloads"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-ocean-500 to-brand-600 text-white hover:from-ocean-400 hover:to-brand-500 transition-all duration-300 glow"
              >
                <Download className="w-5 h-5" />
                Download
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://github.com/bluerobotics/bluePLM"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-medium glass hover:bg-white/10 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                GitHub
              </a>
            </div>
          </div>

          {/* Screenshot */}
          <div className="mt-16 relative animate-slide-up delay-300">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl glow">
              <img
                src="https://raw.githubusercontent.com/bluerobotics/bluePLM/main/assets/screenshot.png"
                alt="BluePLM Screenshot"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
              Core Features
            </h2>
            <p className="text-gray-400">
              Enterprise-grade PLM for teams of all sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-5 rounded-xl glass-light hover:bg-white/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ocean-500/20 to-brand-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5 text-ocean-400" />
                </div>
                <h3 className="font-display font-semibold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ECO Section */}
      <section className="relative py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
                <FileCheck className="w-4 h-4" />
                ECO Management
              </div>
              <h2 className="font-display text-3xl font-bold text-white mb-4">
                Engineering Change Orders
              </h2>
              <p className="text-gray-400 mb-6">
                Create ECOs with full traceability. Visual workflow builder with 
                approval gates before releases.
              </p>
              <ul className="space-y-2 text-sm">
                {['ECO creation with priority levels', 'Visual workflow builder', 'Review requests with due dates', 'Notification badges'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="p-6 rounded-xl glass">
                <div className="flex items-center gap-3 mb-5">
                  <Workflow className="w-6 h-6 text-ocean-400" />
                  <span className="font-semibold text-white">Workflow Builder</span>
                </div>
                <div className="space-y-2">
                  {[
                    { state: 'WIP', color: 'bg-yellow-500' },
                    { state: 'In Review', color: 'bg-blue-500' },
                    { state: 'Released', color: 'bg-green-500' },
                    { state: 'Obsolete', color: 'bg-gray-500' },
                  ].map((item, i) => (
                    <div key={item.state} className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <div className="flex-1 h-9 rounded-lg bg-white/5 flex items-center px-3 text-sm text-gray-300">
                        {item.state}
                      </div>
                      {i < 3 && <ArrowRight className="w-4 h-4 text-gray-600" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="relative py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-3">
              Integrations
            </h2>
            <p className="text-gray-400">
              Connect with the tools you already use.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {integrations.map((integration) => (
              <div
                key={integration.title}
                className="group p-5 rounded-xl glass-light hover:bg-white/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ocean-500/20 to-brand-600/20 flex items-center justify-center mb-3">
                  <integration.icon className="w-5 h-5 text-ocean-400" />
                </div>
                <h3 className="font-display font-semibold text-white mb-1">
                  {integration.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {integration.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 rounded-2xl glass relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-ocean-500/10 to-brand-600/10" />
            <div className="relative">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to get started?
              </h2>
              <p className="text-gray-400 mb-6">
                Free, open-source, and self-hosted.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/downloads"
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-ocean-500 to-brand-600 text-white hover:from-ocean-400 hover:to-brand-500 transition-all duration-300 glow"
                >
                  <Download className="w-5 h-5" />
                  Download BluePLM
                </Link>
                <a
                  href="https://discuss.bluerobotics.com/c/blueplm/40"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Join the Forum
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
