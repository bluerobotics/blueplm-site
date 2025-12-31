import { Shield, Mail, Building2, Database, Lock, Globe, ShieldCheck } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="relative">
      {/* Header */}
      <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-500/20 to-brand-600/20 mb-6">
              <Shield className="w-8 h-8 text-ocean-400" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-400">
              Last updated: December 30, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert prose-gray max-w-none">
            
            {/* Intro */}
            <div className="glass-light rounded-2xl p-6 sm:p-8 mb-8">
              <p className="text-gray-300 text-lg leading-relaxed m-0">
                BluePLM is open-source product lifecycle management software. This privacy policy explains 
                how data is handled when you use BluePLM. Because BluePLM is self-hosted, your organization 
                controls where your data is stored.
              </p>
            </div>

            {/* Self-Hosted Notice */}
            <div className="glass-light rounded-2xl p-6 sm:p-8 mb-8 border border-ocean-500/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-ocean-500/20 flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-ocean-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-white mt-0 mb-2">
                    Self-Hosted Software
                  </h2>
                  <p className="text-gray-400 m-0">
                    BluePLM is self-hosted software. Each organization sets up their own database 
                    (typically using <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-ocean-400 hover:text-ocean-300">Supabase</a>). 
                    Your files, user data, and all PLM information are stored in your organization's own 
                    database instance — not on BluePLM servers. Blue Robotics (the creators of BluePLM) 
                    does not have access to your organization's data.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Collection */}
            <div className="glass-light rounded-2xl p-6 sm:p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="font-display text-xl font-semibold text-white m-0">
                  What Data is Collected
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-2">Authentication Data</h3>
                  <p className="text-gray-400 m-0">
                    When you sign in (via Google, email, or phone), BluePLM stores basic account 
                    information in your organization's database:
                  </p>
                  <ul className="text-gray-400 mt-2 mb-0">
                    <li>Email address</li>
                    <li>Display name (if provided)</li>
                    <li>Profile picture URL (if using Google sign-in)</li>
                    <li>Phone number (if using phone authentication)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">PLM Data</h3>
                  <p className="text-gray-400 m-0">
                    All product lifecycle data you create is stored in your organization's database:
                  </p>
                  <ul className="text-gray-400 mt-2 mb-0">
                    <li>Files and file versions</li>
                    <li>File metadata (names, descriptions, custom properties)</li>
                    <li>Workflow states and history</li>
                    <li>Comments and reviews</li>
                    <li>Team and permission settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">Optional Analytics</h3>
                  <p className="text-gray-400 m-0">
                    During initial setup, you may opt-in to anonymous usage analytics. This helps 
                    improve BluePLM but is completely optional. If enabled, only anonymous usage 
                    patterns are collected — never file contents or personal information.
                  </p>
                </div>
              </div>
            </div>

            {/* How Data is Used */}
            <div className="glass-light rounded-2xl p-6 sm:p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="font-display text-xl font-semibold text-white m-0">
                  How Data is Used
                </h2>
              </div>
              
              <p className="text-gray-400">
                Your data is used solely to provide BluePLM functionality:
              </p>
              <ul className="text-gray-400">
                <li><strong className="text-gray-300">Authentication:</strong> To identify you and manage access permissions</li>
                <li><strong className="text-gray-300">File Management:</strong> To store, version, and retrieve your engineering files</li>
                <li><strong className="text-gray-300">Collaboration:</strong> To enable check-in/check-out, reviews, and team workflows</li>
                <li><strong className="text-gray-300">Notifications:</strong> To alert you about file changes, review requests, etc.</li>
              </ul>
              <p className="text-gray-400 mb-0">
                Your data is never sold, shared with third parties for marketing, or used for advertising.
              </p>
            </div>

            {/* Data Storage */}
            <div className="glass-light rounded-2xl p-6 sm:p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="font-display text-xl font-semibold text-white m-0">
                  Where Data is Stored
                </h2>
              </div>
              
              <p className="text-gray-400">
                Because BluePLM is self-hosted, your organization chooses where data is stored:
              </p>
              <ul className="text-gray-400">
                <li><strong className="text-gray-300">Database:</strong> Typically Supabase (PostgreSQL), hosted in a region you select</li>
                <li><strong className="text-gray-300">File Storage:</strong> Supabase Storage or your configured storage provider</li>
                <li><strong className="text-gray-300">Local Cache:</strong> Working files are cached locally on each user's computer</li>
              </ul>
              <p className="text-gray-400 mb-0">
                Your organization's Supabase project settings determine data residency, backups, 
                and retention policies.
              </p>
            </div>

            {/* Data Security */}
            <div className="glass-light rounded-2xl p-6 sm:p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="font-display text-xl font-semibold text-white m-0">
                  Data Security & Integrity
                </h2>
              </div>
              
              <p className="text-gray-400 mb-4">
                BluePLM implements multiple layers of security to protect your data:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-2">Encryption</h3>
                  <ul className="text-gray-400 mt-2 mb-0">
                    <li><strong className="text-gray-300">In Transit:</strong> All data transmitted between BluePLM and your database uses TLS/HTTPS encryption</li>
                    <li><strong className="text-gray-300">At Rest:</strong> Supabase encrypts all data at rest using AES-256 encryption</li>
                    <li><strong className="text-gray-300">Backups:</strong> Optional encrypted backups using restic with AES-256-CTR</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">Authentication & Access Control</h3>
                  <ul className="text-gray-400 mt-2 mb-0">
                    <li><strong className="text-gray-300">Secure Auth:</strong> Industry-standard OAuth 2.0 and JWT tokens via Supabase Auth</li>
                    <li><strong className="text-gray-300">Row-Level Security:</strong> PostgreSQL RLS policies ensure users only access authorized data</li>
                    <li><strong className="text-gray-300">Role-Based Permissions:</strong> Granular access control per vault, team, and user role</li>
                    <li><strong className="text-gray-300">Session Management:</strong> Automatic token refresh with configurable expiration</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">File Integrity</h3>
                  <ul className="text-gray-400 mt-2 mb-0">
                    <li><strong className="text-gray-300">Content Hashing:</strong> SHA-256 hashes verify file integrity and detect changes</li>
                    <li><strong className="text-gray-300">Version Control:</strong> Complete version history with immutable audit trail</li>
                    <li><strong className="text-gray-300">Check-In/Check-Out:</strong> Exclusive file locking prevents concurrent edit conflicts</li>
                    <li><strong className="text-gray-300">Soft Delete:</strong> Deleted files are recoverable; permanent deletion requires explicit action</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">Infrastructure Security</h3>
                  <ul className="text-gray-400 mt-2 mb-0">
                    <li><strong className="text-gray-300">Desktop App:</strong> Electron with context isolation; Node.js APIs never exposed to renderer</li>
                    <li><strong className="text-gray-300">API Security:</strong> Service keys stored server-side only; anon keys have limited RLS-enforced access</li>
                    <li><strong className="text-gray-300">Input Validation:</strong> All inputs sanitized to prevent SQL injection and path traversal</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Google OAuth */}
            <div className="glass-light rounded-2xl p-6 sm:p-8 mb-8">
              <h2 className="font-display text-xl font-semibold text-white mt-0 mb-4">
                Google Sign-In
              </h2>
              <p className="text-gray-400">
                If your organization enables Google Sign-In, BluePLM requests the following 
                permissions from Google:
              </p>
              <ul className="text-gray-400">
                <li><strong className="text-gray-300">email:</strong> To identify your account</li>
                <li><strong className="text-gray-300">profile:</strong> To display your name and photo</li>
                <li><strong className="text-gray-300">openid:</strong> For secure authentication</li>
              </ul>
              <p className="text-gray-400 mb-0">
                BluePLM only requests these basic scopes. We do not access your Google Drive, 
                Gmail, Calendar, or any other Google services through the sign-in process.
              </p>
            </div>

            {/* Your Rights */}
            <div className="glass-light rounded-2xl p-6 sm:p-8 mb-8">
              <h2 className="font-display text-xl font-semibold text-white mt-0 mb-4">
                Your Rights
              </h2>
              <p className="text-gray-400">
                Since your organization controls the database, contact your BluePLM administrator to:
              </p>
              <ul className="text-gray-400 mb-0">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Export your data</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="glass-light rounded-2xl p-6 sm:p-8 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-ocean-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-ocean-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-white mt-0 mb-2">
                    Contact
                  </h2>
                  <p className="text-gray-400 mb-4">
                    For questions about this privacy policy or BluePLM:
                  </p>
                  <div className="text-gray-300">
                    <p className="m-0"><strong>Blue Robotics Inc.</strong></p>
                    <p className="m-0 text-gray-400">2740 California Street</p>
                    <p className="m-0 text-gray-400">Torrance, CA 90503</p>
                    <p className="m-0 mt-2">
                      <a href="mailto:support@bluerobotics.com" className="text-ocean-400 hover:text-ocean-300">
                        support@bluerobotics.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Other Organizations */}
            <div className="mt-12 p-6 rounded-xl border border-dashed border-gray-700 bg-gray-900/30">
              <h2 className="font-display text-lg font-semibold text-gray-300 mt-0 mb-3">
                📋 For Organizations Self-Hosting BluePLM
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                If you're setting up BluePLM for your own organization and need a privacy policy 
                for Google OAuth verification, you can adapt this policy for your own use:
              </p>
              <ul className="text-gray-500 text-sm mb-0">
                <li>Replace "Blue Robotics" with your organization name</li>
                <li>Update the contact information to your own</li>
                <li>Adjust any details specific to your deployment</li>
                <li>Host on your own domain</li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
