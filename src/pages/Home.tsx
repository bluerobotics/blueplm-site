import { Link } from 'react-router-dom'
import { 
  Lock, History, GitBranch, Users, FolderSync, Trash2, 
  FileCheck, Workflow, Bell, Shield, Search,
  Download, ArrowRight, Star, ChevronRight, Play,
  Globe, Building2, Package, AlertCircle, FileWarning,
  HardDrive, MessageSquare, Webhook, Receipt,
  Layers, Eye, Send, Heart
} from 'lucide-react'

const features = [
  // Core PLM Features - Working
  { icon: Lock, title: 'Check In / Check Out', description: 'Exclusive file locking with multi-machine tracking.', inProgress: false },
  { icon: History, title: 'Version Control', description: 'Full history with one-click rollback.', inProgress: false },
  { icon: GitBranch, title: 'File States', description: 'WIP → In Review → Released → Obsolete.', inProgress: false },
  { icon: Users, title: 'Real-time Sync', description: 'Instant updates across all clients.', inProgress: false },
  { icon: FolderSync, title: 'Multi-vault', description: 'Organize by project with per-vault permissions.', inProgress: false },
  { icon: Trash2, title: 'Trash & Recovery', description: 'Soft delete with full restore capability.', inProgress: false },
  
  // Engineering Change Management
  { icon: FileCheck, title: 'Engineering Change Orders', description: 'Create ECOs with full traceability and linked files.', inProgress: true },
  { icon: AlertCircle, title: 'Engineering Change Requests', description: 'Track issues and change requests linked to ECOs.', inProgress: true },
  { icon: FileWarning, title: 'Deviations', description: 'Material, dimension, and process deviations with approvals.', inProgress: true },
  
  // Workflows & Reviews
  { icon: Workflow, title: 'Visual Workflow Builder', description: 'Drag-and-drop workflow designer with approval gates.', inProgress: true },
  { icon: Eye, title: 'Reviews & Approvals', description: 'Request reviews, approve/reject files with comments.', inProgress: true },
  { icon: Bell, title: 'Notifications', description: 'Real-time notification badges and alerts.', inProgress: true },
  
  // Supply Chain
  { icon: Globe, title: 'Supplier Portal', description: 'Manage suppliers, track approvals, sync from Odoo.', inProgress: true },
  { icon: Receipt, title: 'Request for Quotes', description: 'Create RFQs, generate PDFs, send to suppliers.', inProgress: true },
  { icon: Building2, title: 'Supplier Management', description: 'Supplier database with approval workflows and ERP sync.', inProgress: true },
  
  // Data Management
  { icon: Layers, title: 'BOM Management', description: 'Extract and sync bill of materials from SolidWorks.', inProgress: true },
  { icon: Search, title: 'Advanced Search', description: 'Full-text search across all files and metadata.', inProgress: true },
  { icon: Shield, title: 'Role-based Permissions', description: 'Granular access control per vault and user.', inProgress: true },
  
  // Operations
  { icon: HardDrive, title: 'Automated Backups', description: 'Scheduled encrypted backups with restic.', inProgress: true },
  { icon: Send, title: 'STEP & PDF Export', description: 'Batch export release files from SolidWorks.', inProgress: true },
  { icon: Package, title: 'Product Catalog', description: 'Track product lifecycle and configurations.', inProgress: true },
  
  // Integrations (shown as features)
  { icon: MessageSquare, title: 'Slack Notifications', description: 'Get notified in Slack for reviews and changes.', inProgress: true },
  { icon: Webhook, title: 'Webhooks', description: 'Custom integrations via webhook events.', inProgress: true },
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
              <span className="text-gray-300">Open Source · Self-Hosted · MIT License</span>
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
              Version control, ECOs, RFQs, supplier portal, workflows, reviews, 
              deviations, SolidWorks integration, ERP sync, and so much more.
            </p>
            <p className="text-base text-gray-500 max-w-xl mx-auto mb-4 animate-slide-up delay-200">
              Enterprise PLM costs <span className="line-through text-gray-600">$10,000+/year</span>. 
              BluePLM is <span className="text-green-400 font-semibold">free forever</span>.
            </p>

            {/* Blue Robotics story */}
            <p className="text-sm text-gray-500 max-w-lg mx-auto mb-6 animate-slide-up delay-200 italic text-center">
              "We got tired of paying for expensive PLM/PDM software programmed in the 90s. 
              So we're building BluePLM to manage our own 400+ products. 
              We love it—and we think you will too."
              <span className="not-italic text-gray-600"> — Eldin</span>
            </p>

            {/* Made with love */}
            <div className="flex flex-col items-center gap-1 text-base text-gray-400 mb-10 animate-slide-up delay-200">
              <div className="inline-flex items-center gap-2">
                <span>Made with</span>
                <Heart className="w-5 h-5 text-blue-400 fill-blue-400" />
                <span>by</span>
                <a 
                  href="https://bluerobotics.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gray-300 transition-colors"
                >
                  <img 
                    src="https://raw.githubusercontent.com/bluerobotics/bluePLM/main/assets/blue-robotics-white-name-logo.png" 
                    alt="Blue Robotics" 
                    className="h-9 opacity-80 hover:opacity-100 transition-opacity inline"
                    loading="eager"
                  />
                </a>
              </div>
              <span className="text-sm text-gray-500">and contributors worldwide</span>
            </div>

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
                loading="eager"
                decoding="async"
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
              Features & Roadmap
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Core PLM is ready today. We're actively building change management, 
              supply chain, and integration features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-4 rounded-xl glass-light hover:bg-white/5 transition-all duration-300 relative"
              >
                {feature.inProgress && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Soon
                  </span>
                )}
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ocean-500/20 to-brand-600/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-4.5 h-4.5 text-ocean-400" />
                </div>
                <h3 className="font-display font-semibold text-white text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  )
}
