import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, Upload, FileCode, CheckCircle2, 
  ArrowRight, Github, FileText, Shield,
  AlertCircle, ExternalLink, BookOpen, Zap, Loader2
} from 'lucide-react'
import { submitExtension, ApiError } from '../../lib/api'

const requirements = [
  {
    icon: FileCode,
    title: 'Valid Manifest',
    description: 'extension.json following the BluePLM extension schema',
  },
  {
    icon: Shield,
    title: 'Security Review',
    description: 'Extensions with native code require additional review',
  },
  {
    icon: FileText,
    title: 'Documentation',
    description: 'README with installation and usage instructions',
  },
  {
    icon: Github,
    title: 'Source Access',
    description: 'Public repository for verified badge eligibility',
  },
]

const steps = [
  {
    number: 1,
    title: 'Prepare Your Extension',
    description: 'Ensure your extension follows our guidelines and has a valid manifest.',
  },
  {
    number: 2,
    title: 'Submit for Review',
    description: 'Upload your extension package or link your GitHub repository.',
  },
  {
    number: 3,
    title: 'Await Review',
    description: 'Our team reviews for security and quality (1-3 business days).',
  },
  {
    number: 4,
    title: 'Go Live',
    description: 'Once approved, your extension is published!',
  },
]

export default function Submit() {
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await submitExtension({
        repositoryUrl: submissionUrl,
        email: email,
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Submission failed:', err)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to submit extension. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-4">
            Submission Received!
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Thank you for submitting your extension. We'll review it and get back to you 
            at <span className="text-white font-medium">{email}</span> within 1-3 business days.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-ocean-500 to-brand-600 text-white hover:from-ocean-400 hover:to-brand-500 transition-all duration-300"
            >
              Browse Extensions
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setSubmitted(false)
                setSubmissionUrl('')
                setEmail('')
                setError(null)
              }}
              className="text-ocean-400 hover:text-ocean-300 font-medium"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-sm mb-6">
            <Upload className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300">Extension Submission</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Submit Your Extension
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Share your extension with thousands of BluePLM users. Get your extension verified 
            to build trust and increase visibility.
          </p>
        </div>

        {/* Process Steps */}
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-white mb-6 text-center">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step) => (
              <div 
                key={step.number}
                className="p-5 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-ocean-500/20 flex items-center justify-center text-sm font-bold text-ocean-400">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Submission Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h2 className="font-display text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-ocean-400" />
                Submit Extension
              </h2>

              <div className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-200/80">
                        <p className="font-medium text-red-300 mb-1">Submission Failed</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Repository URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub Repository URL *
                  </label>
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/username/my-extension"
                    required
                    disabled={submitting}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-ocean-500/50 focus:ring-2 focus:ring-ocean-500/20 transition-all disabled:opacity-50"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Must contain a valid extension.json manifest at the root
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={submitting}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-ocean-500/50 focus:ring-2 focus:ring-ocean-500/20 transition-all disabled:opacity-50"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    We'll notify you about the review status
                  </p>
                </div>

                {/* Terms */}
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-200/80">
                      <p className="font-medium text-amber-300 mb-1">Before submitting</p>
                      <p>
                        Ensure your extension follows our{' '}
                        <a 
                          href="https://docs.blueplm.io/extensions/guidelines" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-amber-100"
                        >
                          guidelines
                        </a>
                        {' '}and doesn't contain malicious code. Extensions with native 
                        binaries require additional security review.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-purple-500 to-ocean-500 text-white hover:from-purple-400 hover:to-ocean-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Submit for Review
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Requirements Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Requirements */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-ocean-400" />
                Requirements
              </h3>
              <div className="space-y-4">
                {requirements.map((req) => (
                  <div key={req.title} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <req.icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{req.title}</h4>
                      <p className="text-xs text-gray-500">{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentation Link */}
            <a
              href="https://docs.blueplm.io/extensions/publishing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-ocean-500/10 border border-ocean-500/30 hover:bg-ocean-500/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-ocean-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-ocean-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">Publishing Guide</h4>
                <p className="text-xs text-gray-400">Learn how to create and publish extensions</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>

            {/* Need Help? */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-sm text-gray-400">
                Have questions about the submission process? Check the{' '}
                <a
                  href="https://discuss.bluerobotics.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ocean-400 hover:text-ocean-300"
                >
                  community forum
                </a>
                {' '}for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
