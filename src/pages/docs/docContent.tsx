import { Link } from 'react-router-dom'
import { AlertTriangle, Info, CheckCircle, Lightbulb } from 'lucide-react'
import CodeBlock from '../../components/CodeBlock'

// Callout component for tips, warnings, info
const Callout = ({ 
  type = 'info', 
  title, 
  children 
}: { 
  type?: 'info' | 'warning' | 'success' | 'tip'
  title?: string
  children: React.ReactNode 
}) => {
  const styles = {
    info: { bg: 'bg-ocean-500/10', border: 'border-ocean-500/30', icon: Info, iconColor: 'text-ocean-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle, iconColor: 'text-amber-400' },
    success: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle, iconColor: 'text-green-400' },
    tip: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: Lightbulb, iconColor: 'text-purple-400' },
  }
  const style = styles[type]
  const Icon = style.icon

  return (
    <div className={`my-6 p-4 rounded-xl ${style.bg} border ${style.border}`}>
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
        <div>
          {title && <p className="font-semibold text-white mb-1">{title}</p>}
          <div className="text-gray-300 text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}

export const docContent: Record<string, { title: string; description?: string; content: React.ReactNode }> = {
  'getting-started': {
    title: 'Getting Started',
    description: 'Learn the basics of BluePLM and get up and running in minutes.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Welcome to BluePLM! This guide will help you get up and running in minutes.
          Whether you're an individual maker or part of a large engineering team, 
          BluePLM provides the tools you need to manage your product data effectively.
        </p>
        
        <h2 id="what-is-blueplm">What is BluePLM?</h2>
        <p>
          BluePLM is an <strong>open-source Product Lifecycle Management (PLM)</strong> system 
          designed for engineering teams. It provides version control, check-in/check-out workflows, 
          engineering change management, and integrations with CAD tools like SolidWorks.
        </p>
        <p>
          Unlike traditional PLM systems that cost tens of thousands of dollars per year, 
          BluePLM is <strong>completely free</strong> and can be self-hosted on your own infrastructure 
          using <a href="https://supabase.com" target="_blank" rel="noopener" className="text-ocean-400 hover:text-ocean-300">Supabase</a>.
        </p>
        
        <h2 id="key-features">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          {[
            { title: 'Check In / Check Out', desc: 'Exclusive file locking prevents conflicts' },
            { title: 'Version Control', desc: 'Full history with one-click rollback' },
            { title: 'File States', desc: 'WIP → In Review → Released → Obsolete' },
            { title: 'Real-time Sync', desc: 'Instant updates across all clients' },
            { title: 'ECO Management', desc: 'Engineering Change Orders with workflows' },
            { title: 'SolidWorks Integration', desc: 'Native add-in with thumbnails' },
          ].map((f) => (
            <div key={f.title} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-semibold text-white text-sm mb-1">{f.title}</h4>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
        
        <h2 id="quick-start">Quick Start</h2>
        <ol>
          <li><strong>Download</strong> BluePLM from the <Link to="/downloads" className="text-ocean-400 hover:text-ocean-300">downloads page</Link></li>
          <li><strong>Install</strong> and launch the application</li>
          <li><strong>Enter</strong> your organization's Supabase URL and anon key</li>
          <li><strong>Sign in</strong> with Google OAuth</li>
          <li><strong>Connect</strong> to a vault from Settings → Organization</li>
        </ol>
        
        <Callout type="tip" title="First time setting up?">
          If you're an admin setting up BluePLM for your organization, check out our 
          detailed <Link to="/docs/first-setup" className="text-ocean-400 hover:text-ocean-300 font-medium">First-Time Setup Guide</Link>.
        </Callout>
      </div>
    ),
  },

  'installation': {
    title: 'Installation',
    description: 'System requirements and installation instructions for all platforms.',
    content: (
      <div className="doc-content">
        <p className="lead">
          BluePLM is available for Windows, macOS, and Linux. Follow these steps to install 
          it on your preferred platform.
        </p>
        
        <h2 id="system-requirements">System Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {[
            { platform: 'Windows', reqs: ['Windows 10 or later', '64-bit processor', '4 GB RAM minimum', '500 MB disk space'] },
            { platform: 'macOS', reqs: ['macOS 10.15 (Catalina)+', 'Apple Silicon or Intel', '4 GB RAM minimum', '500 MB disk space'] },
            { platform: 'Linux', reqs: ['Ubuntu 20.04+ / Debian 11+', '64-bit processor', '4 GB RAM minimum', '500 MB disk space'] },
          ].map((p) => (
            <div key={p.platform} className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
              <h3 className="font-bold text-white mb-3">{p.platform}</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                {p.reqs.map((req) => (
                  <li key={req} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 mt-1.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <h2 id="download-install">Download & Install</h2>
        <h3>Windows</h3>
        <ol>
          <li>Download the <code>.exe</code> installer from the <Link to="/downloads" className="text-ocean-400 hover:text-ocean-300">downloads page</Link></li>
          <li>Run the installer and follow the prompts</li>
          <li>BluePLM will be available in your Start Menu</li>
        </ol>

        <h3>macOS</h3>
        <ol>
          <li>Download the <code>.dmg</code> file</li>
          <li>Open the DMG and drag BluePLM to your Applications folder</li>
          <li>On first launch, right-click and select "Open" to bypass Gatekeeper</li>
        </ol>

        <h3>Linux</h3>
        <ol>
          <li>Download the <code>.AppImage</code> file</li>
          <li>Make it executable: <code>chmod +x BluePLM-*.AppImage</code></li>
          <li>Run: <code>./BluePLM-*.AppImage</code></li>
        </ol>

        <CodeBlock 
          language="bash"
          filename="Terminal"
          code={`# Make AppImage executable and run
chmod +x BluePLM-1.0.0.AppImage
./BluePLM-1.0.0.AppImage`}
        />
        
        <h2 id="file-storage">File Storage Locations</h2>
        <p>BluePLM stores vault files in the following default locations:</p>
        <div className="my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Platform</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Default Path</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-white/10 hover:bg-white/5">
                <td className="py-3 px-4">Windows</td>
                <td className="py-3 px-4 font-mono text-sm text-ocean-400">C:\BluePLM\{'{vault-name}'}</td>
              </tr>
              <tr className="border-b border-white/10 hover:bg-white/5">
                <td className="py-3 px-4">macOS</td>
                <td className="py-3 px-4 font-mono text-sm text-ocean-400">~/Documents/BluePLM/{'{vault-name}'}</td>
              </tr>
              <tr className="border-b border-white/10 hover:bg-white/5">
                <td className="py-3 px-4">Linux</td>
                <td className="py-3 px-4 font-mono text-sm text-ocean-400">~/BluePLM/{'{vault-name}'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="info">
          You can customize the storage location in Settings → Storage after connecting to your organization.
        </Callout>
      </div>
    ),
  },

  'first-setup': {
    title: 'First-Time Setup',
    description: 'Complete guide for administrators setting up BluePLM for their organization.',
    content: (
      <div className="doc-content">
        <p className="lead">
          This guide walks you through setting up BluePLM for your organization, 
          including creating a Supabase project and configuring authentication.
        </p>

        <Callout type="warning" title="Admin Required">
          This guide is for organization administrators. If you're joining an existing 
          organization, ask your admin for the connection details.
        </Callout>

        <h2 id="create-supabase">Step 1: Create a Supabase Project</h2>
        <ol>
          <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener" className="text-ocean-400 hover:text-ocean-300">supabase.com</a> and sign up or log in</li>
          <li>Click <strong>"New Project"</strong></li>
          <li>Choose a name (e.g., "my-company-plm")</li>
          <li>Set a strong database password (save this!)</li>
          <li>Select your preferred region</li>
          <li>Click <strong>"Create new project"</strong></li>
        </ol>

        <h2 id="run-migrations">Step 2: Run Database Migrations</h2>
        <p>
          BluePLM requires specific database tables and functions. You can set these up 
          automatically using our migration scripts.
        </p>
        <ol>
          <li>In your Supabase dashboard, go to <strong>SQL Editor</strong></li>
          <li>Copy and paste the migration SQL from the BluePLM repository</li>
          <li>Click <strong>"Run"</strong> to execute</li>
        </ol>

        <CodeBlock 
          language="bash"
          filename="Terminal"
          code={`# Clone the repository and run migrations
git clone https://github.com/bluerobotics/bluePLM.git
cd bluePLM/supabase
# Copy SQL files to Supabase SQL Editor`}
        />

        <h2 id="configure-auth">Step 3: Configure Authentication</h2>
        <p>BluePLM uses Google OAuth for authentication:</p>
        <ol>
          <li>Go to <strong>Authentication → Providers</strong> in Supabase</li>
          <li>Enable <strong>Google</strong></li>
          <li>Add your Google OAuth credentials (from Google Cloud Console)</li>
          <li>Add your app URL to the allowed redirect URLs</li>
        </ol>

        <h2 id="get-credentials">Step 4: Get Your Credentials</h2>
        <p>You'll need two pieces of information to connect BluePLM:</p>
        <ol>
          <li><strong>Project URL:</strong> Found in Settings → API</li>
          <li><strong>Anon Key:</strong> Found in Settings → API</li>
        </ol>
        
        <Callout type="success" title="You're Ready!">
          Share your Project URL and Anon Key with your team members. They can enter 
          these in BluePLM's connection screen to join your organization.
        </Callout>
      </div>
    ),
  },

  'connecting': {
    title: 'Connecting to Your Organization',
    description: 'How to connect BluePLM to your organization\'s Supabase instance.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Once your admin has set up the Supabase backend, connecting is simple.
        </p>

        <h2 id="connect-steps">Connection Steps</h2>
        <ol>
          <li>Launch BluePLM</li>
          <li>On the connection screen, enter:
            <ul>
              <li><strong>Supabase URL:</strong> Your organization's project URL</li>
              <li><strong>Anon Key:</strong> The public anon key</li>
            </ul>
          </li>
          <li>Click <strong>"Connect"</strong></li>
          <li>Sign in with Google when prompted</li>
        </ol>

        <Callout type="info">
          Your connection settings are saved locally. You won't need to enter them again 
          unless you want to switch organizations.
        </Callout>

        <h2 id="troubleshooting">Troubleshooting</h2>
        <h3>Connection Failed</h3>
        <ul>
          <li>Double-check the URL and key for typos</li>
          <li>Ensure your internet connection is stable</li>
          <li>Verify the Supabase project is active (not paused)</li>
        </ul>

        <h3>Google Sign-In Not Working</h3>
        <ul>
          <li>Ask your admin if Google OAuth is configured</li>
          <li>Try clearing your browser cache</li>
          <li>Check if your Google account is allowed by the organization</li>
        </ul>
      </div>
    ),
  },

  'quick-tour': {
    title: 'Quick Tour',
    description: 'A visual tour of BluePLM\'s interface and core concepts.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Let's take a quick tour of BluePLM's interface so you know where everything is.
        </p>

        <h2 id="main-layout">Main Layout</h2>
        <p>BluePLM's interface is divided into several key areas:</p>
        <ul>
          <li><strong>Sidebar (Left):</strong> Navigation between vaults, ECOs, and settings</li>
          <li><strong>File Browser (Center):</strong> Your vault's folder structure</li>
          <li><strong>Properties Panel (Right):</strong> Details about the selected file</li>
          <li><strong>Status Bar (Bottom):</strong> Sync status and notifications</li>
        </ul>

        <h2 id="key-concepts">Key Concepts</h2>
        <h3>Vaults</h3>
        <p>
          A vault is like a project folder. Each vault has its own files, permissions, 
          and sync settings. You can be a member of multiple vaults.
        </p>

        <h3>File States</h3>
        <p>Every file has a state that indicates its lifecycle stage:</p>
        <div className="flex flex-wrap gap-2 my-4">
          {[
            { name: 'WIP', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
            { name: 'In Review', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
            { name: 'Released', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
            { name: 'Obsolete', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
          ].map((s) => (
            <span key={s.name} className={`px-3 py-1 rounded-full text-sm border ${s.color}`}>
              {s.name}
            </span>
          ))}
        </div>

        <h3>Check In / Check Out</h3>
        <p>
          To edit a file, you must first <strong>check it out</strong>. This locks the file 
          so others can't edit it simultaneously. When you're done, <strong>check it in</strong> 
          to save your changes and release the lock.
        </p>
      </div>
    ),
  },

  'check-in-out': {
    title: 'Check In / Check Out',
    description: 'Learn how file locking works in BluePLM.',
    content: (
      <div className="doc-content">
        <p className="lead">
          BluePLM uses a check-in/check-out system to prevent conflicts when multiple 
          people work on the same files.
        </p>

        <h2 id="how-it-works">How It Works</h2>
        <ol>
          <li><strong>Check Out:</strong> Locks the file for editing. Only you can modify it.</li>
          <li><strong>Edit:</strong> Make your changes locally.</li>
          <li><strong>Check In:</strong> Uploads your changes and releases the lock.</li>
        </ol>

        <Callout type="info">
          When a file is checked out by someone else, you can still view it but cannot edit it.
        </Callout>

        <h2 id="checking-out">Checking Out Files</h2>
        <p>To check out a file:</p>
        <ol>
          <li>Select the file in the file browser</li>
          <li>Click the <strong>"Check Out"</strong> button in the toolbar, or</li>
          <li>Right-click and select <strong>"Check Out"</strong></li>
        </ol>
        <p>
          The file icon will show a lock indicator, and the file will be downloaded 
          to your local vault folder for editing.
        </p>

        <h2 id="checking-in">Checking In Files</h2>
        <p>When you're ready to save your changes:</p>
        <ol>
          <li>Select the checked-out file</li>
          <li>Click <strong>"Check In"</strong></li>
          <li>Enter a comment describing your changes</li>
          <li>Click <strong>"Submit"</strong></li>
        </ol>

        <CodeBlock
          language="plaintext"
          filename="Check-in Comment Example"
          code={`Updated mounting bracket dimensions per ECO-0042
- Changed hole diameter from 6mm to 8mm  
- Added chamfer to leading edge`}
        />

        <h2 id="undo-checkout">Undoing a Checkout</h2>
        <p>
          If you need to discard your changes and release the lock, right-click the 
          file and select <strong>"Undo Checkout"</strong>. This will restore the 
          previous version.
        </p>
      </div>
    ),
  },

  'version-control': {
    title: 'Version Control',
    description: 'Understand versioning, history, and rollback in BluePLM.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Every check-in creates a new version, giving you complete history and the 
          ability to roll back to any previous state.
        </p>

        <h2 id="viewing-history">Viewing History</h2>
        <p>To see a file's version history:</p>
        <ol>
          <li>Select the file</li>
          <li>Click the <strong>"History"</strong> tab in the properties panel</li>
          <li>You'll see all versions with dates, authors, and comments</li>
        </ol>

        <h2 id="comparing-versions">Comparing Versions</h2>
        <p>
          Select two versions and click <strong>"Compare"</strong> to see what changed. 
          For supported file types (like text files), you'll see a diff view.
        </p>

        <h2 id="rollback">Rolling Back</h2>
        <p>To restore a previous version:</p>
        <ol>
          <li>Check out the file</li>
          <li>Go to History and find the version you want</li>
          <li>Click <strong>"Restore This Version"</strong></li>
          <li>Check in with a comment explaining the rollback</li>
        </ol>

        <Callout type="warning">
          Rolling back creates a new version with the old content—it doesn't delete 
          the versions in between. Your full history is always preserved.
        </Callout>
      </div>
    ),
  },

  'file-states': {
    title: 'File State Management',
    description: 'Learn about file lifecycle states and transitions.',
    content: (
      <div className="doc-content">
        <p className="lead">
          File states help you track where each file is in its lifecycle, from initial 
          design through release to obsolescence.
        </p>

        <h2 id="states">Available States</h2>
        <div className="space-y-4 my-6">
          {[
            { name: 'WIP', full: 'Work In Progress', color: 'bg-yellow-500', desc: 'File is being actively worked on. Not ready for review.' },
            { name: 'In Review', full: 'In Review', color: 'bg-blue-500', desc: 'File is ready for review. Awaiting approval before release.' },
            { name: 'Released', full: 'Released', color: 'bg-green-500', desc: 'File is approved for production use. Should not be modified without an ECO.' },
            { name: 'Obsolete', full: 'Obsolete', color: 'bg-gray-500', desc: 'File is no longer valid. Replaced by a newer version or discontinued.' },
          ].map((s) => (
            <div key={s.name} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className={`w-3 h-3 rounded-full ${s.color} mt-1.5 flex-shrink-0`} />
              <div>
                <h4 className="font-semibold text-white">{s.full}</h4>
                <p className="text-gray-400 text-sm mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 id="changing-states">Changing States</h2>
        <p>To change a file's state:</p>
        <ol>
          <li>Select the file (must not be checked out)</li>
          <li>Click <strong>"Change State"</strong> in the toolbar</li>
          <li>Select the new state from the dropdown</li>
          <li>Add a comment if required</li>
        </ol>

        <Callout type="info">
          State changes may require approval depending on your organization's workflow 
          configuration. For example, moving to "Released" might require a review.
        </Callout>
      </div>
    ),
  },

  'multi-vault': {
    title: 'Multi-Vault Support',
    description: 'Organize your work across multiple vaults.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Vaults let you organize files by project, department, or any structure that 
          fits your workflow. Each vault has independent permissions and settings.
        </p>

        <h2 id="switching-vaults">Switching Vaults</h2>
        <p>
          Use the vault selector in the sidebar to switch between vaults. Your 
          current vault is shown at the top of the file browser.
        </p>

        <h2 id="vault-permissions">Vault Permissions</h2>
        <p>Each vault can have its own permission settings:</p>
        <ul>
          <li><strong>Admin:</strong> Full control, can manage members and settings</li>
          <li><strong>Editor:</strong> Can check out, edit, and check in files</li>
          <li><strong>Viewer:</strong> Can view and download files, but not edit</li>
        </ul>

        <h2 id="creating-vaults">Creating a New Vault</h2>
        <p>Organization admins can create new vaults:</p>
        <ol>
          <li>Go to <strong>Settings → Organization → Vaults</strong></li>
          <li>Click <strong>"Create Vault"</strong></li>
          <li>Enter a name and optional description</li>
          <li>Set initial permissions</li>
        </ol>
      </div>
    ),
  },

  'trash-recovery': {
    title: 'Trash & Recovery',
    description: 'How deleted files work and how to recover them.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Deleted files aren't gone forever. BluePLM uses soft delete, so you can 
          always recover accidentally deleted items.
        </p>

        <h2 id="deleting-files">Deleting Files</h2>
        <ol>
          <li>Select the file(s) you want to delete</li>
          <li>Press <kbd>Delete</kbd> or right-click → <strong>"Delete"</strong></li>
          <li>Confirm the deletion</li>
        </ol>
        <p>Files are moved to the Trash and remain there for 30 days.</p>

        <h2 id="recovering-files">Recovering Files</h2>
        <ol>
          <li>Click <strong>"Trash"</strong> in the sidebar</li>
          <li>Find the file you want to restore</li>
          <li>Right-click and select <strong>"Restore"</strong></li>
        </ol>
        <p>The file will be restored to its original location.</p>

        <Callout type="warning">
          Files in trash for more than 30 days are permanently deleted. Make sure to 
          restore important files before this window closes.
        </Callout>
      </div>
    ),
  },

  'solidworks': {
    title: 'SolidWorks Add-in',
    description: 'Native SolidWorks integration for seamless PLM workflows.',
    content: (
      <div className="doc-content">
        <p className="lead">
          The BluePLM SolidWorks add-in provides native integration directly in the 
          SolidWorks interface, including automatic thumbnail generation and BOM extraction.
        </p>

        <h2 id="installation">Installing the Add-in</h2>
        <ol>
          <li>Close SolidWorks completely</li>
          <li>Download the add-in installer from the <Link to="/downloads" className="text-ocean-400 hover:text-ocean-300">downloads page</Link></li>
          <li>Run the installer as Administrator</li>
          <li>Launch SolidWorks</li>
        </ol>
        <p>
          You'll see a new <strong>"BluePLM"</strong> tab in the SolidWorks Command Manager.
        </p>

        <h2 id="features">Features</h2>
        <ul>
          <li><strong>Check In/Out from SolidWorks:</strong> No need to switch apps</li>
          <li><strong>Automatic Thumbnails:</strong> Preview images generated on check-in</li>
          <li><strong>BOM Extraction:</strong> Bill of materials synced automatically</li>
          <li><strong>Reference Tracking:</strong> Assembly references are tracked</li>
        </ul>

        <h2 id="usage">Basic Usage</h2>
        <p>With a file open in SolidWorks:</p>
        <ol>
          <li>Click the <strong>BluePLM</strong> tab</li>
          <li>Click <strong>"Check Out"</strong> to start editing</li>
          <li>Make your changes</li>
          <li>Click <strong>"Check In"</strong> to save</li>
        </ol>

        <Callout type="tip">
          Enable "Auto-checkout on open" in the add-in settings to automatically check 
          out files when you open them for editing.
        </Callout>
      </div>
    ),
  },

  'google-drive': {
    title: 'Google Drive Integration',
    description: 'View and edit Google Docs, Sheets, and Slides inline.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Connect your Google Drive to view and edit Google Workspace files directly 
          within BluePLM.
        </p>

        <h2 id="connecting">Connecting Google Drive</h2>
        <ol>
          <li>Go to <strong>Settings → Integrations</strong></li>
          <li>Click <strong>"Connect Google Drive"</strong></li>
          <li>Sign in with your Google account</li>
          <li>Grant the requested permissions</li>
        </ol>

        <h2 id="browsing">Browsing Drive Files</h2>
        <p>
          Once connected, you can browse your Google Drive files in a special 
          <strong>"Google Drive"</strong> section in the sidebar. Files from Drive 
          can be linked to vault items.
        </p>

        <h2 id="editing">Editing Google Files</h2>
        <p>
          Click on a Google Doc, Sheet, or Slide to open it in an embedded editor. 
          Changes are saved automatically to Google Drive.
        </p>
      </div>
    ),
  },

  'odoo': {
    title: 'Odoo ERP Integration',
    description: 'Sync suppliers, products, and BOMs with Odoo.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Connect BluePLM to Odoo to sync product data, suppliers, and bills of materials.
        </p>

        <h2 id="setup">Setting Up Odoo Integration</h2>
        <ol>
          <li>Go to <strong>Settings → Integrations → Odoo</strong></li>
          <li>Enter your Odoo server URL</li>
          <li>Add your API key (generated in Odoo settings)</li>
          <li>Click <strong>"Connect"</strong></li>
        </ol>

        <h2 id="sync">What Gets Synced</h2>
        <ul>
          <li><strong>Products:</strong> Part numbers, descriptions, and attributes</li>
          <li><strong>Suppliers:</strong> Vendor information and lead times</li>
          <li><strong>BOMs:</strong> Bill of materials from assembly files</li>
        </ul>
      </div>
    ),
  },

  'webhooks': {
    title: 'Webhooks',
    description: 'Integrate BluePLM with external services via webhooks.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Webhooks let you trigger external actions when events happen in BluePLM.
        </p>

        <h2 id="creating">Creating a Webhook</h2>
        <ol>
          <li>Go to <strong>Settings → Integrations → Webhooks</strong></li>
          <li>Click <strong>"Add Webhook"</strong></li>
          <li>Enter the endpoint URL</li>
          <li>Select the events to trigger on</li>
          <li>Click <strong>"Save"</strong></li>
        </ol>

        <h2 id="events">Available Events</h2>
        <ul>
          <li><code>file.checked_in</code> — File was checked in</li>
          <li><code>file.checked_out</code> — File was checked out</li>
          <li><code>file.state_changed</code> — File state changed</li>
          <li><code>eco.created</code> — ECO was created</li>
          <li><code>eco.approved</code> — ECO was approved</li>
        </ul>

        <h2 id="payload">Payload Format</h2>
        <CodeBlock
          language="json"
          filename="Webhook Payload"
          code={`{
  "event": "file.checked_in",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "file_id": "abc123",
    "file_name": "bracket.sldprt",
    "user": "john@example.com",
    "version": 3,
    "comment": "Updated dimensions"
  }
}`}
        />
      </div>
    ),
  },

  'api-overview': {
    title: 'API Overview',
    description: 'Introduction to the BluePLM REST API.',
    content: (
      <div className="doc-content">
        <p className="lead">
          BluePLM provides a REST API for programmatic access to all functionality. 
          Use it to build integrations, automate workflows, or create custom tools.
        </p>

        <h2 id="base-url">Base URL</h2>
        <CodeBlock
          language="plaintext"
          code="https://your-project.supabase.co/functions/v1/api"
        />

        <h2 id="quick-example">Quick Example</h2>
        <CodeBlock
          language="bash"
          filename="Terminal"
          code={`curl -X GET \\
  'https://your-project.supabase.co/functions/v1/api/files' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'`}
        />

        <h2 id="response-format">Response Format</h2>
        <p>All responses are JSON and follow this structure:</p>
        <CodeBlock
          language="json"
          code={`{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20
  }
}`}
        />
      </div>
    ),
  },

  'authentication': {
    title: 'API Authentication',
    description: 'How to authenticate with the BluePLM API.',
    content: (
      <div className="doc-content">
        <p className="lead">
          The BluePLM API uses Bearer token authentication. You can generate API keys 
          from your account settings.
        </p>

        <h2 id="generating-keys">Generating API Keys</h2>
        <ol>
          <li>Go to <strong>Settings → Account → API Keys</strong></li>
          <li>Click <strong>"Generate New Key"</strong></li>
          <li>Give the key a descriptive name</li>
          <li>Copy and save the key (it won't be shown again)</li>
        </ol>

        <Callout type="warning" title="Keep Your Keys Secret">
          API keys grant full access to your account. Never share them or commit them 
          to version control.
        </Callout>

        <h2 id="using-keys">Using API Keys</h2>
        <p>Include your API key in the Authorization header:</p>
        <CodeBlock
          language="bash"
          code={`curl -H 'Authorization: Bearer sk_live_xxxxxxxxxxxxx' \\
  https://your-project.supabase.co/functions/v1/api/files`}
        />
      </div>
    ),
  },

  'endpoints': {
    title: 'API Endpoints Reference',
    description: 'Complete reference of all available API endpoints.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Complete reference for all BluePLM API endpoints.
        </p>

        <h2 id="files">Files</h2>
        <div className="space-y-4 my-6">
          {[
            { method: 'GET', path: '/files', desc: 'List all files' },
            { method: 'GET', path: '/files/:id', desc: 'Get file details' },
            { method: 'POST', path: '/files/:id/checkout', desc: 'Check out a file' },
            { method: 'POST', path: '/files/:id/checkin', desc: 'Check in a file' },
            { method: 'DELETE', path: '/files/:id', desc: 'Delete a file' },
          ].map((e) => (
            <div key={e.path + e.method} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                e.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                e.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                'bg-red-500/20 text-red-400'
              }`}>{e.method}</span>
              <code className="text-ocean-400 font-mono text-sm">{e.path}</code>
              <span className="text-gray-400 text-sm ml-auto">{e.desc}</span>
            </div>
          ))}
        </div>

        <h2 id="ecos">ECOs</h2>
        <div className="space-y-4 my-6">
          {[
            { method: 'GET', path: '/ecos', desc: 'List all ECOs' },
            { method: 'GET', path: '/ecos/:id', desc: 'Get ECO details' },
            { method: 'POST', path: '/ecos', desc: 'Create an ECO' },
            { method: 'POST', path: '/ecos/:id/approve', desc: 'Approve an ECO' },
          ].map((e) => (
            <div key={e.path + e.method} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                e.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>{e.method}</span>
              <code className="text-ocean-400 font-mono text-sm">{e.path}</code>
              <span className="text-gray-400 text-sm ml-auto">{e.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  'webhooks-api': {
    title: 'Webhooks API',
    description: 'Manage webhooks programmatically via the API.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Create and manage webhook subscriptions through the API.
        </p>

        <h2 id="create-webhook">Create Webhook</h2>
        <CodeBlock
          language="bash"
          code={`curl -X POST \\
  'https://your-project.supabase.co/functions/v1/api/webhooks' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "url": "https://your-server.com/webhook",
    "events": ["file.checked_in", "eco.created"]
  }'`}
        />

        <h2 id="list-webhooks">List Webhooks</h2>
        <CodeBlock
          language="bash"
          code={`curl -X GET \\
  'https://your-project.supabase.co/functions/v1/api/webhooks' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`}
        />

        <h2 id="delete-webhook">Delete Webhook</h2>
        <CodeBlock
          language="bash"
          code={`curl -X DELETE \\
  'https://your-project.supabase.co/functions/v1/api/webhooks/:id' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`}
        />
      </div>
    ),
  },

  'creating-ecos': {
    title: 'Creating ECOs',
    description: 'Learn how to create and manage Engineering Change Orders.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Engineering Change Orders (ECOs) formalize the process of making changes to 
          released files, ensuring proper review and approval.
        </p>

        <h2 id="what-is-eco">What is an ECO?</h2>
        <p>
          An ECO is a formal request to change one or more files. It includes the reason 
          for the change, the files affected, and tracks the approval workflow.
        </p>

        <h2 id="creating">Creating an ECO</h2>
        <ol>
          <li>Click <strong>"New ECO"</strong> in the sidebar</li>
          <li>Fill in the ECO form:
            <ul>
              <li><strong>Title:</strong> Brief description of the change</li>
              <li><strong>Priority:</strong> Critical, High, Medium, or Low</li>
              <li><strong>Description:</strong> Detailed explanation</li>
              <li><strong>Affected Files:</strong> Select the files to change</li>
            </ul>
          </li>
          <li>Click <strong>"Create ECO"</strong></li>
        </ol>

        <h2 id="working-on-eco">Working on an ECO</h2>
        <p>
          Once created, you can check out the affected files and make changes. All 
          changes are tracked as part of the ECO until it's approved and closed.
        </p>
      </div>
    ),
  },

  'workflow-builder': {
    title: 'Visual Workflow Builder',
    description: 'Configure custom approval workflows for your organization.',
    content: (
      <div className="doc-content">
        <p className="lead">
          The visual workflow builder lets you define custom state transitions and 
          approval requirements for your organization.
        </p>

        <h2 id="accessing">Accessing the Workflow Builder</h2>
        <ol>
          <li>Go to <strong>Settings → Organization → Workflows</strong></li>
          <li>Click on a workflow to edit, or create a new one</li>
        </ol>

        <h2 id="building">Building a Workflow</h2>
        <p>
          Drag states onto the canvas and connect them with transitions. Each transition 
          can have conditions and required approvals.
        </p>

        <h2 id="conditions">Transition Conditions</h2>
        <ul>
          <li><strong>Required Reviews:</strong> Number of approvals needed</li>
          <li><strong>Required Roles:</strong> Which roles can approve</li>
          <li><strong>Auto-transition:</strong> Transition automatically when conditions are met</li>
        </ul>
      </div>
    ),
  },

  'approval-gates': {
    title: 'Approval Gates',
    description: 'Set up required approvals before state transitions.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Approval gates ensure that files can only progress to certain states after 
          receiving the required approvals.
        </p>

        <h2 id="how-gates-work">How Gates Work</h2>
        <p>
          When you try to transition a file to a state with an approval gate, BluePLM 
          checks if all required approvals have been given. If not, the transition is blocked.
        </p>

        <h2 id="configuring">Configuring Gates</h2>
        <ol>
          <li>Open the Workflow Builder</li>
          <li>Select a transition arrow</li>
          <li>In the properties panel, add approval requirements</li>
          <li>Save the workflow</li>
        </ol>

        <h2 id="approving">Approving Files</h2>
        <p>
          Files pending your approval appear in the <strong>"My Reviews"</strong> section. 
          Click on a file to review it and add your approval.
        </p>
      </div>
    ),
  },

  'eco-tracking': {
    title: 'ECO Tracking & Reporting',
    description: 'Track ECO progress and generate reports.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Monitor ECO status, track metrics, and generate reports for management review.
        </p>

        <h2 id="dashboard">ECO Dashboard</h2>
        <p>
          The ECO dashboard shows all active ECOs with their current status:
        </p>
        <ul>
          <li><strong>Draft:</strong> ECO is being prepared</li>
          <li><strong>In Review:</strong> Waiting for approvals</li>
          <li><strong>Approved:</strong> Ready for implementation</li>
          <li><strong>Closed:</strong> Changes have been implemented</li>
        </ul>

        <h2 id="metrics">Key Metrics</h2>
        <ul>
          <li>Average time to approval</li>
          <li>ECOs by priority</li>
          <li>ECOs by department</li>
          <li>Approval bottlenecks</li>
        </ul>
      </div>
    ),
  },

  'real-time-sync': {
    title: 'Real-Time Sync',
    description: 'How BluePLM keeps everyone in sync instantly.',
    content: (
      <div className="doc-content">
        <p className="lead">
          BluePLM uses real-time synchronization to ensure all team members see the 
          latest changes instantly.
        </p>

        <h2 id="how-sync-works">How Sync Works</h2>
        <p>
          When you check in a file, other users see the update within seconds. No 
          need to manually refresh or poll for changes.
        </p>

        <h2 id="what-syncs">What Gets Synced</h2>
        <ul>
          <li>File check-in/check-out status</li>
          <li>File state changes</li>
          <li>New files and folders</li>
          <li>Deletions and moves</li>
          <li>ECO updates</li>
          <li>Comments and reviews</li>
        </ul>

        <h2 id="offline">Working Offline</h2>
        <p>
          If you lose connection, BluePLM continues working with your local cache. 
          Changes sync automatically when you reconnect.
        </p>
      </div>
    ),
  },

  'reviews': {
    title: 'Reviews & Approvals',
    description: 'Request and manage file reviews.',
    content: (
      <div className="doc-content">
        <p className="lead">
          The review system lets you request feedback and formal approvals from team members.
        </p>

        <h2 id="requesting">Requesting a Review</h2>
        <ol>
          <li>Select the file</li>
          <li>Click <strong>"Request Review"</strong></li>
          <li>Choose the reviewer(s)</li>
          <li>Add optional notes and due date</li>
          <li>Click <strong>"Send"</strong></li>
        </ol>

        <h2 id="reviewing">Reviewing Files</h2>
        <p>
          Pending reviews appear in your <strong>"My Reviews"</strong> inbox. For each review:
        </p>
        <ul>
          <li><strong>Approve:</strong> File is ready for the next state</li>
          <li><strong>Request Changes:</strong> File needs modifications</li>
          <li><strong>Comment:</strong> Add feedback without approving/rejecting</li>
        </ul>
      </div>
    ),
  },

  'notifications': {
    title: 'Notifications',
    description: 'Configure how and when you receive notifications.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Stay informed about important events without being overwhelmed.
        </p>

        <h2 id="notification-types">Notification Types</h2>
        <ul>
          <li>Review requests</li>
          <li>Approvals and rejections</li>
          <li>ECO updates</li>
          <li>Comments on watched files</li>
          <li>Check-out conflicts</li>
        </ul>

        <h2 id="settings">Notification Settings</h2>
        <p>
          Go to <strong>Settings → Notifications</strong> to customize:
        </p>
        <ul>
          <li>Which events trigger notifications</li>
          <li>In-app vs. email notifications</li>
          <li>Digest frequency (immediate, daily, weekly)</li>
        </ul>
      </div>
    ),
  },

  'file-watching': {
    title: 'Watching Files',
    description: 'Get notified when specific files change.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Watch files or folders to get notified whenever they're modified.
        </p>

        <h2 id="watching">How to Watch</h2>
        <ol>
          <li>Right-click on a file or folder</li>
          <li>Select <strong>"Watch"</strong></li>
        </ol>
        <p>You'll now receive notifications when that item changes.</p>

        <h2 id="unwatching">Unwatching</h2>
        <p>
          To stop watching, right-click and select <strong>"Unwatch"</strong>, or go to 
          <strong>Settings → Watched Items</strong> to manage all your watches.
        </p>
      </div>
    ),
  },

  'user-management': {
    title: 'User Management',
    description: 'Add, remove, and manage users in your organization.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Manage who has access to your BluePLM organization and their permissions.
        </p>

        <h2 id="inviting">Inviting Users</h2>
        <ol>
          <li>Go to <strong>Settings → Organization → Members</strong></li>
          <li>Click <strong>"Invite User"</strong></li>
          <li>Enter their email address</li>
          <li>Select their role (Admin, Editor, Viewer)</li>
          <li>Click <strong>"Send Invite"</strong></li>
        </ol>

        <h2 id="roles">User Roles</h2>
        <ul>
          <li><strong>Admin:</strong> Full access, can manage users and settings</li>
          <li><strong>Editor:</strong> Can check out and edit files</li>
          <li><strong>Viewer:</strong> Read-only access</li>
        </ul>

        <h2 id="removing">Removing Users</h2>
        <p>
          To remove a user, find them in the Members list and click the <strong>"Remove"</strong> button.
          Their checked-out files will be released.
        </p>
      </div>
    ),
  },

  'org-settings': {
    title: 'Organization Settings',
    description: 'Configure your organization\'s BluePLM instance.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Customize BluePLM for your organization's needs.
        </p>

        <h2 id="general">General Settings</h2>
        <ul>
          <li><strong>Organization Name:</strong> Displayed throughout the app</li>
          <li><strong>Logo:</strong> Custom logo for branding</li>
          <li><strong>Default Timezone:</strong> For timestamps and scheduling</li>
        </ul>

        <h2 id="security">Security Settings</h2>
        <ul>
          <li><strong>Allowed Domains:</strong> Restrict sign-up to specific email domains</li>
          <li><strong>Session Timeout:</strong> How long until users are logged out</li>
          <li><strong>Two-Factor Auth:</strong> Require 2FA for all users</li>
        </ul>
      </div>
    ),
  },

  'vault-permissions': {
    title: 'Vault Permissions',
    description: 'Configure who can access what in each vault.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Fine-grained permission control lets you decide exactly who can do what in each vault.
        </p>

        <h2 id="permission-levels">Permission Levels</h2>
        <ul>
          <li><strong>None:</strong> No access, vault is hidden</li>
          <li><strong>Viewer:</strong> Can browse and download</li>
          <li><strong>Editor:</strong> Can check out and edit</li>
          <li><strong>Admin:</strong> Can manage vault settings and members</li>
        </ul>

        <h2 id="configuring">Configuring Permissions</h2>
        <ol>
          <li>Go to <strong>Settings → Organization → Vaults</strong></li>
          <li>Select the vault</li>
          <li>Click the <strong>"Permissions"</strong> tab</li>
          <li>Add users or groups and set their permission level</li>
        </ol>
      </div>
    ),
  },

  'backups': {
    title: 'Backup Configuration',
    description: 'Set up automatic backups for your data.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Protect your data with automatic backups.
        </p>

        <h2 id="supabase-backups">Supabase Backups</h2>
        <p>
          Supabase automatically backs up your database daily. Check your Supabase 
          dashboard for backup settings and restoration options.
        </p>

        <h2 id="file-backups">File Backups</h2>
        <p>
          BluePLM integrates with <strong>Restic</strong> for encrypted, deduplicated 
          file backups. Configure your backup destination in Settings → Backups.
        </p>

        <h2 id="destinations">Supported Destinations</h2>
        <ul>
          <li>Local drive or network share</li>
          <li>Amazon S3</li>
          <li>Google Cloud Storage</li>
          <li>Backblaze B2</li>
          <li>Any S3-compatible storage</li>
        </ul>
      </div>
    ),
  },

  'cli-overview': {
    title: 'CLI Overview',
    description: 'Introduction to the BluePLM command-line interface.',
    content: (
      <div className="doc-content">
        <p className="lead">
          The BluePLM CLI lets you interact with BluePLM from the command line, 
          perfect for automation and scripting.
        </p>

        <h2 id="installation">Installation</h2>
        <CodeBlock
          language="bash"
          filename="Terminal"
          code={`npm install -g blueplm-cli`}
        />

        <h2 id="configuration">Configuration</h2>
        <CodeBlock
          language="bash"
          filename="Terminal"
          code={`# Configure your connection
blueplm config set url https://your-project.supabase.co
blueplm config set key YOUR_API_KEY

# Verify configuration
blueplm config list`}
        />

        <h2 id="basic-usage">Basic Usage</h2>
        <CodeBlock
          language="bash"
          filename="Terminal"
          code={`# List files in a vault
blueplm files list --vault my-vault

# Check out a file
blueplm checkout path/to/file.sldprt

# Check in with a comment
blueplm checkin path/to/file.sldprt -m "Updated dimensions"`}
        />
      </div>
    ),
  },

  'cli-commands': {
    title: 'CLI Commands Reference',
    description: 'Complete reference of all CLI commands.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Complete reference for all BluePLM CLI commands.
        </p>

        <h2 id="file-commands">File Commands</h2>
        <CodeBlock
          language="bash"
          code={`blueplm files list [--vault NAME]     # List files
blueplm files get <path>               # Download file
blueplm checkout <path>                # Check out file
blueplm checkin <path> -m "message"    # Check in file
blueplm undo-checkout <path>           # Undo checkout`}
        />

        <h2 id="eco-commands">ECO Commands</h2>
        <CodeBlock
          language="bash"
          code={`blueplm eco list                       # List ECOs
blueplm eco create -t "Title" -d "Description"
blueplm eco approve <eco-id>           # Approve ECO
blueplm eco close <eco-id>             # Close ECO`}
        />

        <h2 id="vault-commands">Vault Commands</h2>
        <CodeBlock
          language="bash"
          code={`blueplm vault list                     # List vaults
blueplm vault create <name>            # Create vault
blueplm vault sync                     # Sync current vault`}
        />
      </div>
    ),
  },

  'cli-scripting': {
    title: 'CLI Scripting & Automation',
    description: 'Automate workflows with CLI scripts.',
    content: (
      <div className="doc-content">
        <p className="lead">
          Use the CLI in scripts to automate repetitive tasks and integrate with CI/CD pipelines.
        </p>

        <h2 id="batch-operations">Batch Operations</h2>
        <CodeBlock
          language="bash"
          filename="batch-checkin.sh"
          code={`#!/bin/bash
# Check in all modified files

for file in $(blueplm status --modified); do
  blueplm checkin "$file" -m "Batch update: $(date)"
done`}
        />

        <h2 id="ci-integration">CI/CD Integration</h2>
        <CodeBlock
          language="yaml"
          filename=".github/workflows/release.yml"
          code={`name: Release to PLM
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure BluePLM
        run: |
          npm install -g blueplm-cli
          blueplm config set url \${{ secrets.BLUEPLM_URL }}
          blueplm config set key \${{ secrets.BLUEPLM_KEY }}
      
      - name: Release files
        run: |
          blueplm files state --set released --path ./release/`}
        />

        <h2 id="json-output">JSON Output</h2>
        <p>Add <code>--json</code> to any command for machine-readable output:</p>
        <CodeBlock
          language="bash"
          code={`blueplm files list --json | jq '.[] | select(.state == "released")'`}
        />
      </div>
    ),
  },
}

export default docContent

