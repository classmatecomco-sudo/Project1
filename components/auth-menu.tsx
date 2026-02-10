"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export function AuthMenu() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="text-sm text-gray-500">로딩 중...</div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          <span className="font-medium text-indigo-600">{user.name}</span>님
        </span>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
      >
        로그인
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm text-white hover:bg-indigo-600"
      >
        회원가입
      </Link>
    </div>
  )
}
