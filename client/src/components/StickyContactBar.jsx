import { useState } from 'react';
import { BRAND } from '../config';
import ContactModal from './ContactModal';

export default function StickyContactBar() {
  const [modalOpen, setModalOpen] = useState(false);

  const smsHref = `sms:${BRAND.phoneNumber}?body=${encodeURIComponent(
    `Hi ${BRAND.name}, I have a question about a vehicle.`
  )}`;
  const whatsappHref = `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(
    `Hi ${BRAND.name}, I have a question about a vehicle.`
  )}`;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="container-page grid grid-cols-4 gap-1 py-2 sm:flex sm:justify-center sm:gap-3">
          <a
            href={`tel:${BRAND.phoneNumber}`}
            className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-100 sm:flex-row sm:gap-2 sm:px-4 sm:py-2"
          >
            <span className="text-lg sm:text-base">📞</span>
            <span className="text-[11px] font-medium sm:text-sm">Call</span>
          </a>
          <a
            href={smsHref}
            className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-slate-700 hover:bg-slate-100 sm:flex-row sm:gap-2 sm:px-4 sm:py-2"
          >
            <span className="text-lg sm:text-base">💬</span>
            <span className="text-[11px] font-medium sm:text-sm">Text Us</span>
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-emerald-700 hover:bg-emerald-50 sm:flex-row sm:gap-2 sm:px-4 sm:py-2"
          >
            <span className="text-lg sm:text-base">🟢</span>
            <span className="text-[11px] font-medium sm:text-sm">WhatsApp</span>
          </a>
          <button
            onClick={() => setModalOpen(true)}
            className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-brand hover:bg-brand/10 sm:flex-row sm:gap-2 sm:px-4 sm:py-2"
          >
            <span className="text-lg sm:text-base">✉️</span>
            <span className="text-[11px] font-medium sm:text-sm">Email</span>
          </button>
        </div>
      </div>

      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
