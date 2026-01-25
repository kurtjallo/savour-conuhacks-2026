// Design system colors
const colors = {
  cardBorder: '#e8e6e3',
  textPrimary: '#2e2c29',
  textSecondary: '#6b6966',
  savings: '#4a7c59',
  savingsLight: '#f0f5f1',
};

interface SavingsCardProps {
  savingsAmount: number;
  savingsPercent: number;
  annualProjection: number;
}

export default function SavingsCard({ savingsAmount, savingsPercent, annualProjection }: SavingsCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-6 border-l-4"
      style={{
        borderColor: colors.savings,
        borderTopColor: colors.cardBorder,
        borderRightColor: colors.cardBorder,
        borderBottomColor: colors.cardBorder,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
      }}
    >
      <p
        className="text-sm font-medium mb-2"
        style={{ color: colors.textSecondary, fontFamily: "'Outfit', sans-serif" }}
      >
        You save
      </p>

      <div className="flex items-baseline gap-3 mb-4">
        <span
          className="text-4xl font-semibold tracking-tight"
          style={{ color: colors.savings }}
        >
          ${savingsAmount.toFixed(2)}
        </span>
        <span
          className="text-lg font-medium"
          style={{ color: colors.textSecondary }}
        >
          ({savingsPercent.toFixed(0)}%)
        </span>
      </div>

      <div
        className="pt-4 border-t"
        style={{ borderColor: colors.cardBorder }}
      >
        <div className="flex items-baseline justify-between">
          <div>
            <p
              className="text-sm"
              style={{ color: colors.textSecondary, fontFamily: "'Outfit', sans-serif" }}
            >
              Annual projection
            </p>
            <p
              className="text-xl font-semibold mt-0.5"
              style={{ color: colors.textPrimary }}
            >
              ${annualProjection.toFixed(0)}
            </p>
          </div>
          <p
            className="text-sm"
            style={{ color: colors.textSecondary }}
          >
            per year
          </p>
        </div>
      </div>
    </div>
  );
}
