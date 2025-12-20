import { useState } from 'react'
import { 
  Heart, Github, CreditCard, 
  MessageCircle, Bug, Lightbulb, Users,
  ExternalLink, ChevronRight, Wallet, RefreshCw
} from 'lucide-react'

const presetAmounts = [15, 30, 50, 120, 250]

const supportOptions = [
  {
    icon: Bug,
    title: 'Report a Bug',
    description: 'Found something broken? Let us know on GitHub Issues.',
    href: 'https://github.com/bluerobotics/bluePLM/issues/new?template=bug_report.md',
    cta: 'Report Bug',
  },
  {
    icon: Lightbulb,
    title: 'Request a Feature',
    description: 'Have an idea? We\'d love to hear your suggestions.',
    href: 'https://github.com/bluerobotics/bluePLM/issues/new?template=feature_request.md',
    cta: 'Request Feature',
  },
  {
    icon: MessageCircle,
    title: 'Discussions',
    description: 'Ask questions, share ideas, and connect with the community.',
    href: 'https://github.com/bluerobotics/bluePLM/discussions',
    cta: 'Join Discussion',
  },
  {
    icon: Users,
    title: 'Contributing',
    description: 'Want to contribute? Check out our contributing guide.',
    href: 'https://github.com/bluerobotics/bluePLM/blob/main/CONTRIBUTING.md',
    cta: 'Start Contributing',
  },
]

export default function Donate() {
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState('')
  const [coverFees, setCoverFees] = useState(false)
  const [currency, setCurrency] = useState('USD')

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
  ]

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0]
  const amount = selectedAmount || parseFloat(customAmount) || 0
  const feePercentage = 0.029 + 0.30 / (amount || 1) // ~2.9% + $0.30 typical Stripe fee
  const totalWithFees = coverFees ? Math.ceil(amount * (1 + feePercentage) * 100) / 100 : amount

  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  return (
    <div className="relative py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Support BluePLM
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            BluePLM is free and open-source. Your donation helps us maintain and 
            improve the project for everyone.
          </p>
        </div>

        {/* Donation Form */}
        <div className="max-w-xl mx-auto mb-20">
          <div className="p-8 rounded-3xl glass">
            {/* Frequency Toggle */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-3">Frequency</label>
              <div className="flex gap-2 p-1 rounded-xl bg-white/5">
                <button
                  onClick={() => setFrequency('one-time')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    frequency === 'one-time'
                      ? 'bg-gradient-to-r from-ocean-500 to-brand-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  One-Time
                </button>
                <button
                  onClick={() => setFrequency('monthly')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    frequency === 'monthly'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Monthly Sustaining
                </button>
              </div>
            </div>

            {/* Preset Amounts */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-3">Select Amount</label>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleAmountSelect(amt)}
                    className={`py-3 px-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      selectedAmount === amt
                        ? 'bg-white text-gray-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {currentCurrency.symbol}{amt}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    {currentCurrency.symbol}
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Custom"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 rounded-lg bg-white/5 border text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      customAmount ? 'border-ocean-500' : 'border-white/10 focus:border-ocean-500'
                    }`}
                  />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-ocean-500 cursor-pointer"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code} className="bg-gray-900">
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cover Fees Checkbox */}
            {amount > 0 && (
              <label className="flex items-start gap-3 mb-8 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={coverFees}
                    onChange={(e) => setCoverFees(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border transition-colors ${
                    coverFees 
                      ? 'bg-ocean-500 border-ocean-500' 
                      : 'bg-white/5 border-white/20 group-hover:border-white/40'
                  }`}>
                    {coverFees && (
                      <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  Round up my donation to{' '}
                  <span className="text-white font-medium">
                    {currentCurrency.symbol}{totalWithFees.toFixed(2)}
                  </span>
                  {' '}to cover processing fees.
                </span>
              </label>
            )}

            {/* Donate Button */}
            <button
              disabled={true}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-lg font-semibold bg-white/10 text-gray-500 cursor-not-allowed"
            >
              <Heart className="w-5 h-5" />
              Donations Coming Soon
            </button>

            {/* Payment Methods */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-4 text-gray-500">
                <CreditCard className="w-5 h-5" />
                <Wallet className="w-5 h-5" />
                <span className="text-xs">
                  Card, Apple Pay, Google Pay, and more
                </span>
              </div>
            </div>
          </div>

          {/* Alternative: GitHub Sponsors */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Or support via</p>
            <a
              href="https://github.com/sponsors/bluerobotics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub Sponsors
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Community Support */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-bold text-white mb-3">
              Get Help & Stay Connected
            </h2>
            <p className="text-gray-400">
              Join our community to get help, report issues, or contribute.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {supportOptions.map((option) => (
              <a
                key={option.title}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-xl glass-light hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ocean-500/20 to-brand-600/20 flex items-center justify-center flex-shrink-0">
                    <option.icon className="w-5 h-5 text-ocean-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                      {option.title}
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{option.description}</p>
                    <span className="inline-flex items-center gap-1 text-sm text-ocean-400 group-hover:text-ocean-300 font-medium">
                      {option.cta}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
