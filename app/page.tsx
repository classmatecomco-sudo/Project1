"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { StudentInput } from "@/components/student-input"
import { TaskInput } from "@/components/task-input"
import { DistributeButton } from "@/components/distribute-button"
import { ResultsSection } from "@/components/results-section"
import { UsageLimit } from "@/components/usage-limit"
import { redeemPremiumCode } from "@/lib/auth-client"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user, refresh } = useAuth()
  const usageKey = useMemo(() => {
    const id = user?.id ? `user_${user.id}` : "guest"
    return `usage_count_${id}`
  }, [user?.id])

  const isPremium = !!user?.isLifetimePremium

  // user / premium 상태가 바뀌면 usage 상태도 새로 초기화되도록 remount
  return (
    <HomeInner
      key={`${usageKey}:${isPremium ? "premium" : "free"}`}
      userExists={!!user}
      isPremium={isPremium}
      usageKey={usageKey}
      refresh={refresh}
    />
  )
}

function HomeInner({
  userExists,
  isPremium,
  usageKey,
  refresh,
}: {
  userExists: boolean
  isPremium: boolean
  usageKey: string
  refresh: () => Promise<void>
}) {
  const [students, setStudents] = useState<string[]>([])
  const [tasks, setTasks] = useState<string[]>([])
  const [results, setResults] = useState<{ student: string; tasks: string[] }[] | null>(null)
  const [isDistributing, setIsDistributing] = useState(false)
  // 빌드 시 서버에서 localStorage 없음 → 기본값 사용 후 클라이언트에서 동기화
  const [usageCount, setUsageCount] = useState(3)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (isPremium) {
      setUsageCount(999999)
      setIsLocked(false)
      return
    }
    const raw = localStorage.getItem(usageKey)
    const parsed = raw ? Number(raw) : 3
    const count = Number.isFinite(parsed) ? Math.max(0, Math.min(3, parsed)) : 3
    setUsageCount(count)
    setIsLocked(count <= 0)
  }, [isPremium, usageKey])
  const [premiumCode, setPremiumCode] = useState("")
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [redeemSuccess, setRedeemSuccess] = useState(false)

  const handleRedeemCode = async () => {
    if (!userExists) {
      setRedeemError("프리미엄 코드를 적용하려면 먼저 로그인해주세요.")
      return
    }
    if (!premiumCode.trim()) {
      setRedeemError("코드를 입력해주세요.")
      return
    }

    setRedeemLoading(true)
    setRedeemError(null)
    setRedeemSuccess(false)

    const result = await redeemPremiumCode(premiumCode.trim())
    
    if (result.error) {
      setRedeemError(result.error)
    } else if (result.success) {
      setRedeemSuccess(true)
      setUsageCount(999999)
      setIsLocked(false)
      setPremiumCode("")
      await refresh()
    }

    setRedeemLoading(false)
  }

  const handleDistribute = () => {
    if (students.length === 0 || tasks.length === 0) return
    // 프리미엄이 아니고 사용 횟수가 없으면 차단
    if (!isPremium && usageCount <= 0) return

    setIsDistributing(true)
    setResults(null)

    setTimeout(() => {
      const shuffledTasks = [...tasks].sort(() => Math.random() - 0.5)
      const distribution: { student: string; tasks: string[] }[] = students.map((s) => ({
        student: s,
        tasks: [],
      }))

      shuffledTasks.forEach((task, index) => {
        distribution[index % students.length].tasks.push(task)
      })

      setResults(distribution)
      setIsDistributing(false)
      
      // 프리미엄이 아니면 사용 횟수 차감
      if (!isPremium) {
        setUsageCount((prev) => {
          const newCount = prev - 1
          const clamped = Math.max(0, newCount)
          localStorage.setItem(usageKey, String(clamped))
          if (newCount <= 0) setIsLocked(true)
          return newCount
        })
      }
    }, 1500)
  }

  const handleUnlock = () => {
    if (isPremium) return // 프리미엄은 잠금 해제 불필요
    setIsLocked(false)
    setUsageCount(3)
    localStorage.setItem(usageKey, "3")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Header />

        <div className="flex justify-center">
          <a
            href="https://www.latpeed.com/products/wpRB3"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
          >
            프리미엄 사용하기
          </a>
        </div>

        {/* 프리미엄 코드 입력 섹션 */}
        {!isPremium && (
          <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 p-6 shadow-lg border-2 border-yellow-200">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              🎁 프리미엄 코드 입력
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              프리미엄 코드를 입력하면 무제한으로 분배할 수 있습니다.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={premiumCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8)
                  // 4자리마다 하이픈 자동 삽입
                  const formatted = value.length > 4 
                    ? `${value.slice(0, 4)}-${value.slice(4)}` 
                    : value
                  setPremiumCode(formatted)
                  setRedeemError(null)
                  setRedeemSuccess(false)
                }}
                placeholder="ABCD-1234"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-lg font-mono tracking-wider focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                maxLength={9}
              />
              <button
                onClick={handleRedeemCode}
                disabled={redeemLoading || premiumCode.length < 8}
                className="rounded-lg bg-indigo-500 px-6 py-2 text-white hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {redeemLoading ? "처리 중..." : "적용"}
              </button>
            </div>
            {redeemError && (
              <p className="mt-2 text-sm text-red-600">{redeemError}</p>
            )}
            {redeemSuccess && (
              <p className="mt-2 text-sm text-green-600">
                ✅ 프리미엄이 활성화되었습니다!
              </p>
            )}
          </div>
        )}

        {isPremium && (
          <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-lg border-2 border-green-200">
            <p className="text-center text-green-700 font-semibold">
              ✨ 프리미엄 회원: 무제한 분배 가능
            </p>
          </div>
        )}

        <div className="space-y-4">
          <StudentInput students={students} setStudents={setStudents} disabled={!isPremium && isLocked} />
          <TaskInput tasks={tasks} setTasks={setTasks} disabled={!isPremium && isLocked} />
        </div>

        <DistributeButton
          onClick={handleDistribute}
          disabled={students.length === 0 || tasks.length === 0 || (!isPremium && isLocked)}
          isLoading={isDistributing}
        />

        <ResultsSection results={results} />

        {!isPremium && (
          <UsageLimit
            remaining={usageCount}
            isLocked={isLocked}
            onUnlock={handleUnlock}
          />
        )}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">📖 학습 가이드</h3>
          <p className="mb-4 text-gray-600">
            조별과제와 팀 프로젝트를 위한 공정한 분배 가이드를 확인해보세요.
          </p>
          <a
            href="/guide"
            className="inline-block rounded-lg bg-indigo-500 px-6 py-2 text-white hover:bg-indigo-600"
          >
            가이드 보기 →
          </a>
        </div>
      </div>
    </main>
  )
}