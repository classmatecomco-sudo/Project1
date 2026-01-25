import { notFound } from 'next/navigation'
import Link from 'next/link'
import { posts } from '@/data/posts'

export async function generateStaticParams() {
  return posts.map((post) => ({
    id: post.id,
  }))
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = posts.find((p) => p.id === params.id)

  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다',
    }
  }

  return {
    title: `${post.title} - 나눠줌`,
    description: post.description,
    keywords: post.keywords.join(', '),
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

function formatContent(content: string) {
  let html = content
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-800">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3 text-gray-800">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2 text-gray-800">$1</h3>')
    .replace(/^\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-800">$1</strong>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-gray-700">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 list-decimal text-gray-700">$2</li>')
    .split('\n')
    .map((line) => {
      if (line.trim() === '') return '<br />'
      if (line.startsWith('<h') || line.startsWith('<li')) return line
      if (line.startsWith('<strong')) return line
      return `<p class="mb-4 text-gray-700 leading-7">${line}</p>`
    })
    .join('')

  return html
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = posts.find((p) => p.id === params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <article className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/blog"
            className="mb-4 inline-block text-indigo-600 hover:text-indigo-700"
          >
            ← 목록으로
          </Link>
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <span>{post.category}</span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.author}</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-800">{post.title}</h1>
          <p className="text-xl text-gray-600">{post.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-600"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div
            className="max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block rounded-lg bg-indigo-500 px-6 py-2 text-white hover:bg-indigo-600"
          >
            숙제 분배기 사용하기
          </Link>
        </div>
      </article>
    </div>
  )
}
