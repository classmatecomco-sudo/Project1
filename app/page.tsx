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
    <main className="min-h-screen bg-background p-4 md:p-8">
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
      </div>
    </main>
  )
}