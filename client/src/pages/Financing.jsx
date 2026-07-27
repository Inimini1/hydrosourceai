import { useMemo, useState } from 'react';
import { formatPrice } from '../utils/format';

const TERMS = [24, 36, 48, 60, 72];

function calcMonthlyPayment({ price, downPayment, termMonths, apr }) {
  const principal = Math.max(Number(price) - Number(downPayment), 0);
  const monthlyRate = Number(apr) / 100 / 12;

  if (!principal) return 0;
  if (!monthlyRate) return principal / termMonths;

  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export default function Financing() {
  const [price, setPrice] = useState(9000);
  const [downPayment, setDownPayment] = useState(1000);
  const [termMonths, setTermMonths] = useState(48);
  const [apr, setApr] = useState(9.9);

  const monthlyPayment = useMemo(
    () => calcMonthlyPayment({ price, downPayment, termMonths, apr }),
    [price, downPayment, termMonths, apr]
  );

  const principal = Math.max(Number(price) - Number(downPayment), 0);
  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = Math.max(totalPaid - principal, 0);

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-slate-900">Financing Calculator</h1>
      <p className="mt-1 max-w-2xl text-slate-500">
        Get a quick estimate of your monthly payment. This is an estimate only — final terms depend on
        credit approval and lender.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card space-y-5 p-6">
          <div>
            <label className="label">Vehicle Price</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">$</span>
              <input
                type="number"
                min="0"
                className="input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Down Payment</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">$</span>
              <input
                type="number"
                min="0"
                className="input"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Loan Term</label>
            <div className="grid grid-cols-5 gap-2">
              {TERMS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTermMonths(t)}
                  className={`rounded-lg border px-2 py-2 text-sm font-semibold ${
                    termMonths === t ? 'border-brand bg-brand text-white' : 'border-slate-300 text-slate-600'
                  }`}
                >
                  {t}mo
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Estimated APR (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="input"
              value={apr}
              onChange={(e) => setApr(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">
              Rates vary by credit history. Adjust this to see how it affects your payment.
            </p>
          </div>
        </div>

        <div className="card flex flex-col justify-between p-6">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Estimated Monthly Payment</p>
            <p className="mt-2 text-4xl font-extrabold text-brand sm:text-5xl">
              {formatPrice(monthlyPayment)}<span className="text-lg font-semibold text-slate-400">/mo</span>
            </p>
          </div>

          <div className="mt-8 space-y-3 border-t border-slate-200 pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Financed</span>
              <span className="font-semibold text-slate-900">{formatPrice(principal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Loan Term</span>
              <span className="font-semibold text-slate-900">{termMonths} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Total Interest</span>
              <span className="font-semibold text-slate-900">{formatPrice(totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Cost of Loan</span>
              <span className="font-semibold text-slate-900">{formatPrice(totalPaid)}</span>
            </div>
          </div>

          <a href="/inventory" className="btn-primary mt-8 w-full">Browse Inventory</a>
        </div>
      </div>
    </div>
  );
}
