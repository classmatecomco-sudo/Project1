"use client"

interface TaskInputProps {
  tasks: string[]
  setTasks: (tasks: string[]) => void
  disabled?: boolean
}

export function TaskInput({ tasks, setTasks, disabled }: TaskInputProps) {
  const addTask = () => {
    setTasks([...tasks, ""])
  }

  const updateTask = (index: number, value: string) => {
    const newTasks = [...tasks]
    newTasks[index] = value
    setTasks(newTasks)
  }

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">📝 숙제 목록</h2>
      {tasks.length === 0 ? (
        <button
          onClick={addTask}
          disabled={disabled}
          className="w-full rounded-lg bg-indigo-100 px-4 py-2 text-indigo-600 hover:bg-indigo-200 disabled:opacity-50"
        >
          + 숙제 추가
        </button>
      ) : (
        <>
          {tasks.map((task, index) => (
            <div key={index} className="mb-3 flex gap-2">
              <input
                type="text"
                value={task}
                onChange={(e) => updateTask(index, e.target.value)}
                placeholder={`숙제 ${index + 1}`}
                disabled={disabled}
                className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => removeTask(index)}
                disabled={disabled}
                className="rounded-lg bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200 disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          ))}
          <button
            onClick={addTask}
            disabled={disabled}
            className="w-full rounded-lg bg-indigo-100 px-4 py-2 text-indigo-600 hover:bg-indigo-200 disabled:opacity-50"
          >
            + 숙제 추가
          </button>
        </>
      )}
    </div>
  )
}
