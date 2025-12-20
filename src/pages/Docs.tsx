import { useState, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  BookOpen, Users, Folder, 
  GitBranch, Cog, Database, Shield, Terminal,
  ChevronRight, ChevronLeft, ExternalLink, Search, Menu, X, 
  Hash, ArrowUp
} from 'lucide-react'
import { docContent } from './docs/docContent'

const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    items: [
      { id: 'getting-started', title: 'Introduction' },
      { id: 'installation', title: 'Installation' },
      { id: 'first-setup', title: 'First-Time Setup' },
      { id: 'connecting', title: 'Connecting to Org' },
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
      { id: 'file-states', title: 'File States' },
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
      { id: 'workflow-builder', title: 'Workflow Builder' },
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

// Flatten all items for navigation
const allDocItems = docSections.flatMap(section => section.items)

export default function Docs() {
  const { section } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  
  const currentSection = section || 'getting-started'
  const content = docContent[currentSection] || docContent['getting-started']

  // Find current index for prev/next navigation
  const currentIndex = allDocItems.findIndex(item => item.id === currentSection)
  const prevItem = currentIndex > 0 ? allDocItems[currentIndex - 1] : null
  const nextItem = currentIndex < allDocItems.length - 1 ? allDocItems[currentIndex + 1] : null

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return docSections
    
    const query = searchQuery.toLowerCase()
    return docSections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        section.title.toLowerCase().includes(query)
      )
    })).filter(section => section.items.length > 0)
  }, [searchQuery])

  // Handle search keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredSections.length > 0 && filteredSections[0].items.length > 0) {
      navigate(`/docs/${filteredSections[0].items[0].id}`)
      setSearchQuery('')
      setSidebarOpen(false)
    }
  }

  // Track scroll position for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-ocean-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-brand-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="flex gap-8">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-ocean-500 to-brand-600 text-white shadow-2xl glow transition-transform hover:scale-105 active:scale-95"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Sidebar */}
          <aside className={`
            fixed lg:sticky top-0 lg:top-20 left-0 z-40 
            h-screen lg:h-[calc(100vh-5rem)] w-80 lg:w-72
            bg-[#0a0f1a]/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none
            transform transition-transform duration-300 ease-out lg:transform-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto scrollbar-thin border-r border-white/5 lg:border-none
          `}>
            <div className="p-6 lg:p-0 lg:pr-4">
              {/* Search */}
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-ocean-500/50 focus:bg-white/[0.07] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* No results message */}
              {searchQuery && filteredSections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No results for "{searchQuery}"</p>
                </div>
              )}

              {/* Navigation */}
              <nav className="space-y-6">
                {filteredSections.map((navSection) => (
                  <div key={navSection.id}>
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                      <navSection.icon className="w-4 h-4" />
                      {navSection.title}
                    </div>
                    <ul className="space-y-0.5">
                      {navSection.items.map((item) => {
                        const isActive = currentSection === item.id
                        return (
                          <li key={item.id}>
                            <Link
                              to={`/docs/${item.id}`}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                                group flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200
                                ${isActive
                                  ? 'bg-gradient-to-r from-ocean-500/20 to-ocean-500/5 text-ocean-400 font-medium border-l-2 border-ocean-500'
                                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                                }
                              `}
                            >
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-ocean-400" />}
                              {item.title}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </nav>

              {/* External links */}
              <div className="mt-10 pt-6 border-t border-white/10 space-y-1">
                <a
                  href="https://github.com/bluerobotics/bluePLM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                </a>
                <a
                  href="https://github.com/bluerobotics/bluePLM/blob/main/CHANGELOG.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <span>Changelog</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                </a>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 lg:pl-4">
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <Link 
                  to="/docs" 
                  className="hover:text-ocean-400 transition-colors flex items-center gap-1"
                >
                  <BookOpen className="w-4 h-4" />
                  Docs
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-600" />
                <span className="text-gray-300 font-medium">{content.title}</span>
              </nav>

              {/* Header */}
              <header className="mb-10">
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                  {content.title}
                </h1>
                {content.description && (
                  <p className="text-lg text-gray-400 leading-relaxed">
                    {content.description}
                  </p>
                )}
              </header>
              
              {/* Content with enhanced prose styling */}
              <article className="prose-custom">
                {content.content}
              </article>

              {/* Next/Prev navigation */}
              <nav className="mt-20 pt-10 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  {prevItem ? (
                    <Link
                      to={`/docs/${prevItem.id}`}
                      className="group p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-ocean-500/30 hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Previous
                      </div>
                      <div className="text-white font-medium group-hover:text-ocean-400 transition-colors">
                        {prevItem.title}
                      </div>
                    </Link>
                  ) : <div />}
                  
                  {nextItem && (
                    <Link
                      to={`/docs/${nextItem.id}`}
                      className="group p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-ocean-500/30 hover:bg-white/[0.04] transition-all text-right"
                    >
                      <div className="flex items-center justify-end gap-2 text-sm text-gray-500 mb-2">
                        Next
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="text-white font-medium group-hover:text-ocean-400 transition-colors">
                        {nextItem.title}
                      </div>
                    </Link>
                  )}
                </div>
              </nav>

              {/* Edit on GitHub link */}
              <div className="mt-10 flex justify-center">
                <a
                  href={`https://github.com/bluerobotics/bluePLM/edit/main/docs/${currentSection}.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ocean-400 transition-colors"
                >
                  <Hash className="w-4 h-4" />
                  Edit this page on GitHub
                </a>
              </div>
            </div>
          </main>

          {/* Table of Contents (desktop only) */}
          <aside className="hidden xl:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                On This Page
              </h4>
              <div className="text-sm text-gray-500 space-y-2">
                <p className="italic">Scroll to see headings</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Back to top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 p-3 rounded-xl bg-white/10 border border-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-all z-40"
          title="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
