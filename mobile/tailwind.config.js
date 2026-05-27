/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Mirror the web app's dark command center tokens
        primary:             '#00f2ff',
        background:          '#0f1419',
        ink:                 '#0a0f14',
        'surface-low':       '#171c21',
        'surface':           '#1b2025',
        'surface-high':      '#252a30',
        'surface-highest':   '#30353b',
        'on-surface':        '#dee3ea',
        'on-surface-dim':    '#b9cacb',
        muted:               '#849495',
        outline:             '#3a494b',
        safe:                '#3cddc7',
        caution:             '#b1c5ff',
        critical:            '#ffb4ab',
        'critical-bg':       '#93000a',
      },
      fontFamily: {
        mono: ['JetBrainsMono', 'monospace'],
      },
    },
  },
  plugins: [],
}
