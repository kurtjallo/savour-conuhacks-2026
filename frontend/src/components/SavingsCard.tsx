interface SavingsCardProps {
  savingsAmount: number;
  savingsPercent: number;
  annualProjection: number;
}

export default function SavingsCard({ savingsAmount, savingsPercent, annualProjection }: SavingsCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
        <span className="font-semibold uppercase tracking-wide text-sm text-emerald-100">Your Savings</span>
      </div>

      <div className="mb-4">
        <span className="text-5xl font-bold">${savingsAmount.toFixed(2)}</span>
        <span className="ml-3 text-2xl font-semibold bg-white/20 px-3 py-1 rounded-full">
          {savingsPercent.toFixed(0)}% off
        </span>
      </div>

      <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-emerald-100">Annual Projection</span>
        </div>
        <p className="text-2xl font-bold">
          Save ${annualProjection.toFixed(0)}/year
        </p>
        <p className="text-sm text-emerald-100 mt-1">if you shop smart weekly!</p>
      </div>
    </div>
  );
}
