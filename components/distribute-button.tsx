interface DistributeButtonProps {
  onClick: () => void
  disabled: boolean
  isLoading: boolean
}

export function DistributeButton({ onClick, disabled, isLoading }: DistributeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "분배 중..." : "✨ 분배하기"}
    </button>
  )
}
