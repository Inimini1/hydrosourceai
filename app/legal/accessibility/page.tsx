import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility Statement — HydroSource AI',
  description: 'Our commitment to digital accessibility, current conformance status, and how to report an accessibility barrier in HydroSource AI.',
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-16">

        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-teal-600 text-sm font-semibold hover:text-teal-700 transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            HydroSource AI
          </Link>
          <h1 className="font-display text-4xl font-black text-slate-900 mt-6 mb-3">Accessibility Statement</h1>
          <p className="text-slate-400 text-sm">Effective August 10, 2026 · <a href="mailto:hydrosource.ai@appscloud365.com" className="hover:text-slate-600 transition-colors">hydrosource.ai@appscloud365.com</a></p>
        </div>

        <div className="space-y-8 text-slate-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-slate-900 font-bold text-lg mb-3">1. Our Commitment</h2>
            <p>HydroSource AI is built to work for pool owners and professionals of all abilities. We design and develop the app with the Web Content Accessibility Guidelines (WCAG) 2.1 in mind, and we treat accessibility as an ongoing responsibility rather than a one-time checklist.</p>
          </section>

          <section>
            <h2 className="text-slate-900 font-bold text-lg mb-3">2. Conformance Status</h2>
            <p className="mb-3">Our target is <span className="text-slate-900 font-semibold">WCAG 2.1 Level AA</span>. HydroSource AI is currently <span className="text-slate-900 font-semibold">partially conformant</span>: many AA success criteria are met (see Section 3), but the app has not yet been audited end-to-end by a third party or automated testing tool, and some gaps remain (see Section 4). &quot;Partially conformant&quot; means some parts of the content do not fully conform to the accessibility standard yet — this is the standard WCAG terminology for apps still working toward full conformance.</p>
          </section>

          <section>
            <h2 className="text-slate-900 font-bold text-lg mb-3">3. Measures We&apos;ve Taken</h2>
            <ul className="space-y-2">
              {[
                'Semantic HTML structure and landmark elements so screen readers can navigate the app predictably',
                'Every form field has a programmatically associated label, not just placeholder text',
                'Interactive elements (links, buttons, form controls) are operable by keyboard alone',
                'Form inputs show a clear, high-contrast focus indicator when navigated to by keyboard',
                'Informational images (like test strip photo previews) include descriptive alt text',
                'A color palette chosen for readable contrast between text and background',
                'A responsive layout that supports browser zoom and text resizing without breaking',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#00C9B1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-slate-900 font-bold text-lg mb-3">4. Known Limitations</h2>
            <p className="mb-3">We know of the following gaps and are actively working through them:</p>
            <ul className="space-y-2">
              {[
                'Some animations and page transitions do not yet respect the operating system\'s "reduce motion" setting',
                'Not every icon-only button currently has an explicit accessible name (e.g. an aria-label)',
                'Color contrast has been designed for readability but has not yet been verified line-by-line against the WCAG 4.5:1 ratio requirement',
                'The app has not yet been tested end-to-end with a screen reader by our team or an outside auditor',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-slate-900 font-bold text-lg mb-3">5. Compatibility</h2>
            <p>HydroSource AI is built to work with current versions of major browsers (Chrome, Safari, Firefox, Edge) and their built-in accessibility features, and is intended to be compatible with common assistive technologies such as VoiceOver, NVDA, and JAWS. We have not yet exhaustively tested every browser and assistive-technology combination.</p>
          </section>

          <section>
            <h2 className="text-slate-900 font-bold text-lg mb-3">6. Feedback</h2>
            <p className="mb-2">If you encounter an accessibility barrier while using HydroSource AI, please tell us — we want to fix it. Reach us:</p>
            <ul className="space-y-1.5">
              <li>Email: <a href="mailto:hydrosource.ai@appscloud365.com" className="text-teal-600 hover:text-teal-700 underline underline-offset-2">hydrosource.ai@appscloud365.com</a></li>
              <li>Phone: <a href="tel:+12144277224" className="text-teal-600 hover:text-teal-700 underline underline-offset-2">+1 (214) 427-7224</a></li>
            </ul>
            <p className="mt-3 text-slate-400 text-xs">Please include the page you were on and, if possible, the assistive technology and browser you were using — it helps us reproduce and fix the issue faster.</p>
          </section>

          <section>
            <h2 className="text-slate-900 font-bold text-lg mb-3">7. Formal Complaints</h2>
            <p>This statement was prepared using the accessibility statement guidance published by the W3C Web Accessibility Initiative. It reflects a good-faith, ongoing effort — it is not a certification of full conformance.</p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>HydroSource AI · Last updated August 10, 2026</span>
          <Link href="/legal/privacy" className="text-teal-600 hover:text-teal-700 transition-colors">Privacy Policy →</Link>
        </div>

      </div>
    </div>
  )
}
