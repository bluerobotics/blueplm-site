import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  BookOpen, Users, Folder, 
  GitBranch, Cog, Database, Shield, Terminal,
  ChevronRight, ExternalLink, Search, Menu, X
} from 'lucide-react'

const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    items: [
      { id: 'installation', title: 'Installation' },
      { id: 'first-setup', title: 'First-Time Setup' },
      { id: 'connecting', title: 'Connecting to Your Organization' },
      { id: 'quick-tour', title: 'Quick Tour' },
    ],
  },
  {
    id: 'core-features',
    title: 'Core Features',
    icon: Folder,
    items: [
      { id: 'check-in-out', title: 'Check In / Check Out' },
      { id: 'version-control', title: 'Version Control' },
      { id: 'file-states', title: 'File State Management' },
      { id: 'multi-vault', title: 'Multi-Vault Support' },
      { id: 'trash-recovery', title: 'Trash & Recovery' },
    ],
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    icon: Users,
    items: [
      { id: 'real-time-sync', title: 'Real-Time Sync' },
      { id: 'reviews', title: 'Reviews & Approvals' },
      { id: 'notifications', title: 'Notifications' },
      { id: 'file-watching', title: 'Watching Files' },
    ],
  },
  {
    id: 'eco-management',
    title: 'ECO Management',
    icon: GitBranch,
    items: [
      { id: 'creating-ecos', title: 'Creating ECOs' },
      { id: 'workflow-builder', title: 'Visual Workflow Builder' },
      { id: 'approval-gates', title: 'Approval Gates' },
      { id: 'eco-tracking', title: 'Tracking & Reporting' },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Cog,
    items: [
      { id: 'solidworks', title: 'SolidWorks Add-in' },
      { id: 'google-drive', title: 'Google Drive' },
      { id: 'odoo', title: 'Odoo ERP' },
      { id: 'webhooks', title: 'Webhooks' },
    ],
  },
  {
    id: 'api',
    title: 'REST API',
    icon: Database,
    items: [
      { id: 'api-overview', title: 'API Overview' },
      { id: 'authentication', title: 'Authentication' },
      { id: 'endpoints', title: 'Endpoints Reference' },
      { id: 'webhooks-api', title: 'Webhooks API' },
    ],
  },
  {
    id: 'admin',
    title: 'Administration',
    icon: Shield,
    items: [
      { id: 'user-management', title: 'User Management' },
      { id: 'org-settings', title: 'Organization Settings' },
      { id: 'vault-permissions', title: 'Vault Permissions' },
      { id: 'backups', title: 'Backup Configuration' },
    ],
  },
  {
    id: 'cli',
    title: 'CLI Reference',
    icon: Terminal,
    items: [
      { id: 'cli-overview', title: 'CLI Overview' },
      { id: 'cli-commands', title: 'Commands Reference' },
      { id: 'cli-scripting', title: 'Scripting & Automation' },
    ],
  },
]

const docContent: Record<string, { title: string; content: React.ReactNode }> = {
  'getting-started': {
    title: 'Getting Started',
    content: (
      <div className="prose prose-invert max-w-none">
        <p className="lead text-xl text-gray-300">
          Welcome to BluePLM! This guide will help you get up and running in minutes.
        </p>
        
        <h2>What is BluePLM?</h2>
        <p>
          BluePLM is an open-source Product Lifecycle Management (PLM) system designed for 
          engineering teams. It provides version control, check-in/check-out workflows, 
          engineering change management, and integrations with CAD tools like SolidWorks.
        </p>
        
        <h2>Key Features</h2>
        <ul>
          <li><strong>Check In / Check Out</strong> - Exclusive file locking prevents conflicts</li>
          <li><strong>Version Control</strong> - Full history with rollback capabilities</li>
          <li><strong>File States</strong> - WIP → In Review → Released → Obsolete</li>
          <li><strong>Real-time Collaboration</strong> - Instant sync across all clients</li>
          <li><strong>ECO Management</strong> - Engineering Change Orders with workflows</li>
          <li><strong>SolidWorks Integration</strong> - Native add-in with thumbnails</li>
        </ul>
        
        <h2>Quick Start</h2>
        <ol>
          <li><strong>Download</strong> BluePLM from the <Link to="/downloads" className="text-ocean-400 hover:text-ocean-300">downloads page</Link></li>
          <li><strong>Install</strong> and launch the application</li>
          <li><strong>Enter</strong> your organization's Supabase URL and anon key</li>
          <li><strong>Sign in</strong> with Google OAuth</li>
          <li><strong>Connect</strong> to a vault from Settings → Organization</li>
        </ol>
        
        <div className="not-prose my-8 p-6 rounded-xl bg-ocean-500/10 border border-ocean-500/20">
          <h3 className="text-lg font-semibold text-white mb-2">Need help setting up Supabase?</h3>
          <p className="text-gray-400 mb-4">
            If you're an admin setting up BluePLM for your organization, check out our 
            detailed setup guide.
          </p>
          <Link 
            to="/docs/first-setup" 
            className="inline-flex items-center gap-2 text-ocean-400 hover:text-ocean-300 font-medium"
          >
            Admin Setup Guide
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    ),
  },
  'installation': {
    title: 'Installation',
    content: (
      <div className="prose prose-invert max-w-none">
        <p className="lead text-xl text-gray-300">
          BluePLM is available for Windows, macOS, and Linux.
        </p>
        
        <h2>System Requirements</h2>
        <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {[
            { platform: 'Windows', reqs: ['Windows 10+', '64-bit', '4 GB RAM', '500 MB disk'] },
            { platform: 'macOS', reqs: ['macOS 10.15+', 'Apple Silicon or Intel', '4 GB RAM', '500 MB disk'] },
            { platform: 'Linux', reqs: ['Ubuntu 20.04+', '64-bit', '4 GB RAM', '500 MB disk'] },
          ].map((p) => (
            <div key={p.platform} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-2">{p.platform}</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                {p.reqs.map((req) => (
                  <li key={req}>• {req}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <h2>Download & Install</h2>
        <ol>
          <li>Visit the <Link to="/downloads" className="text-ocean-400 hover:text-ocean-300">downloads page</Link></li>
          <li>Select your platform (Windows, macOS, or Linux)</li>
          <li>Run the installer:
            <ul>
              <li><strong>Windows:</strong> Run the .exe installer</li>
              <li><strong>macOS:</strong> Open the .dmg and drag to Applications</li>
              <li><strong>Linux:</strong> Make the .AppImage executable and run</li>
            </ul>
          </li>
        </ol>
        
        <h2>File Storage Locations</h2>
        <div className="not-prose my-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-gray-400 font-medium">Platform</th>
                <th className="text-left py-2 text-gray-400 font-medium">Path</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-white/10">
                <td className="py-2">Windows</td>
                <td className="py-2 font-mono text-sm">C:\BluePLM\{'{vault-name}'}</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">macOS</td>
                <td className="py-2 font-mono text-sm">~/Documents/BluePLM/{'{vault-name}'}</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">Linux</td>
                <td className="py-2 font-mono text-sm">~/BluePLM/{'{vault-name}'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
}

export default function Docs() {
  const { section } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const currentSection = section || 'getting-started'
  const content = docContent[currentSection] || docContent['getting-started']

  return (
    <div className="relative min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed bottom-4 right-4 z-50 p-4 rounded-full bg-gradient-to-r from-ocean-500 to-brand-600 text-white shadow-lg glow"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Sidebar */}
          <aside className={`
            fixed lg:sticky top-20 left-0 z-40 h-[calc(100vh-5rem)] w-72 
            bg-[#0a0f1a] lg:bg-transparent
            transform transition-transform duration-300 lg:transform-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto scrollbar-thin
          `}>
            <div className="p-4 lg:p-0">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-ocean-500"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-6">
                {docSections.map((section) => (
                  <div key={section.id}>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-2">
                      <section.icon className="w-4 h-4" />
                      {section.title}
                    </div>
                    <ul className="space-y-1 ml-6">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <Link
                            to={`/docs/${item.id}`}
                            onClick={() => setSidebarOpen(false)}
                            className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              currentSection === item.id
                                ? 'bg-ocean-500/20 text-ocean-400'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>

              {/* External links */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <a
                  href="https://github.com/bluerobotics/bluePLM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  GitHub Repository
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://github.com/bluerobotics/bluePLM/blob/main/CHANGELOG.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Changelog
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-300">{content.title}</span>
              </div>

              {/* Content */}
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-8">
                {content.title}
              </h1>
              
              {content.content}

              {/* Next/Prev navigation */}
              <div className="mt-16 pt-8 border-t border-white/10 flex justify-between">
                <Link
                  to="/docs/getting-started"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Previous
                </Link>
                <Link
                  to="/docs/installation"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

