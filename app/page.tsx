"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { StudentInput } from "@/components/student-input"
import { TaskInput } from "@/components/task-input"
import { DistributeButton } from "@/components/distribute-button"
import { ResultsSection } from "@/components/results-section"
import { UsageLimit } from "@/components/usage-limit"

export default function Home() {
  const [students, setStudents] = useState<string[]>([])
  const [tasks, setTasks] = useState<string[]>([])
  const [results, setResults] = useState<{ student: string; tasks: string[] }[] | null>(null)
  const [isDistributing, setIsDistributing] = useState(false)
  const [usageCount, setUsageCount] = useState(3)
  const [isLocked, setIsLocked] = useState(false)

  const handleDistribute = () => {
    if (students.length === 0 || tasks.length === 0 || usageCount <= 0) return

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
      setUsageCount((prev) => {
        const newCount = prev - 1
        if (newCount <= 0) setIsLocked(true)
        return newCount
      })
    }, 1500)
  }

  const handleUnlock = () => {
    setIsLocked(false)
    setUsageCount(3)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Header />

        <div className="space-y-4">
          <StudentInput students={students} setStudents={setStudents} disabled={isLocked} />
          <TaskInput tasks={tasks} setTasks={setTasks} disabled={isLocked} />
        </div>

        <DistributeButton
          onClick={handleDistribute}
          disabled={students.length === 0 || tasks.length === 0 || isLocked}
          isLoading={isDistributing}
        />

        <ResultsSection results={results} />

        <UsageLimit
          remaining={usageCount}
          isLocked={isLocked}
          onUnlock={handleUnlock}
        />

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