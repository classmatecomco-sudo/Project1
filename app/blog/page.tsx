import Link from 'next/link'
import { posts } from '@/data/posts'

export const metadata = {
  title: '학습 가이드 - 나눠줌',
  description: '조별과제와 팀 프로젝트를 위한 실용적인 가이드와 팁을 제공합니다.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-indigo-600">📚 학습 가이드</h1>
          <p className="text-gray-600">조별과제와 팀 프로젝트를 위한 실용적인 정보</p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="block rounded-2xl bg-white p-6 shadow-lg transition-transform hover:scale-[1.02]"
            >
              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                <span>{post.category}</span>
                <span>•</span>
                <span>{post.date}</span>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-800">{post.title}</h2>
              <p className="text-gray-600">{post.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.keywords.slice(0, 3).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-600"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block rounded-lg bg-indigo-500 px-6 py-2 text-white hover:bg-indigo-600"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
