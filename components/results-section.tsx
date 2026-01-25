interface ResultsSectionProps {
  results: { student: string; tasks: string[] }[] | null
}

export function ResultsSection({ results }: ResultsSectionProps) {
  if (!results) return null

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-center text-2xl font-bold text-indigo-600">🎯 분배 결과</h2>
      <div className="space-y-4">
        {results.map((item, index) => (
          <div key={index} className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-indigo-700">{item.student}</h3>
            <ul className="space-y-1">
              {item.tasks.length > 0 ? (
                item.tasks.map((task, taskIndex) => (
                  <li key={taskIndex} className="flex items-center gap-2 text-gray-700">
                    <span className="text-indigo-500">✓</span>
                    <span>{task}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">할당된 숙제가 없습니다</li>
              )}
            </ul>
            <div className="mt-2 text-sm font-medium text-indigo-600">
              총 {item.tasks.length}개
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
