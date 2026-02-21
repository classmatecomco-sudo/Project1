interface UsageLimitProps {
  remaining: number
  isLocked: boolean
}

export function UsageLimit({ remaining, isLocked }: UsageLimitProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="text-center">
        {isLocked ? (
          <p className="text-lg font-semibold text-red-600">
            오늘 무료 사용 횟수(5회)를 모두 사용했습니다
          </p>
        ) : (
          <p className="text-gray-600">
            오늘 남은 무료 사용 횟수:&nbsp;
            <span className="font-bold text-indigo-600">{remaining}회</span>
            <span className="text-sm text-gray-400"> / 5회</span>
          </p>
        )}
      </div>
    </div>
  )
}
