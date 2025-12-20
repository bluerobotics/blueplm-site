# BluePLM Website

The official website for [BluePLM](https://github.com/bluerobotics/bluePLM) - Open-source Product Lifecycle Management.

## Features

- **Landing Page** - Hero section with feature highlights and animated stats
- **Downloads** - Platform-specific downloads with system requirements
- **Documentation** - Comprehensive wiki/docs with sidebar navigation
- **Support** - Donation tiers, community links, and contribution info
- **App Stats** - Animated counters for downloads, organizations, and users

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Header.tsx    # Navigation header
│   ├── Footer.tsx    # Site footer
│   └── Layout.tsx    # Main layout wrapper
├── pages/
│   ├── Home.tsx      # Landing page
│   ├── Downloads.tsx # Downloads page
│   ├── Docs.tsx      # Documentation
│   └── Support.tsx   # Support/donation page
├── App.tsx           # Root component with routes
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Design

- **Dark theme** with ocean/blue gradient accents
- **Glassmorphism** card effects
- **Animated elements** - fade-in, slide-up, floating
- **Responsive** - Mobile-first design
- **Accessible** - Semantic HTML, ARIA labels

## License

MIT - See [LICENSE](LICENSE)

---

Made with 💙 by [Blue Robotics](https://bluerobotics.com)

