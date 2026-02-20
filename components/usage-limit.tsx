interface UsageLimitProps {
  remaining: number
  isLocked: boolean
  onUnlock: () => void
}

export function UsageLimit({ remaining, isLocked }: UsageLimitProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="text-center">
        {isLocked ? (
          <p className="text-lg font-semibold text-red-600">사용 횟수를 모두 사용했습니다</p>
        ) : (
          <p className="text-gray-600">
            남은 사용 횟수: <span className="font-bold text-indigo-600">{remaining}회</span>
          </p>
        )}
      </div>
    </div>
  )
}
