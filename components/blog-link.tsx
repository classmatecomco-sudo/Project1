import Link from 'next/link'

export function BlogLink() {
  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
      <h3 className="mb-4 text-xl font-semibold text-gray-800">📖 학습 가이드</h3>
      <p className="mb-4 text-gray-600">
        조별과제와 팀 프로젝트를 위한 실용적인 가이드와 팁을 확인해보세요.
      </p>
      <Link
        href="/blog"
        className="inline-block rounded-lg bg-indigo-500 px-6 py-2 text-white hover:bg-indigo-600"
      >
        가이드 보기 →
      </Link>
    </div>
  )
}
