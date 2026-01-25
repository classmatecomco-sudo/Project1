"use client"

interface StudentInputProps {
  students: string[]
  setStudents: (students: string[]) => void
  disabled?: boolean
}

export function StudentInput({ students, setStudents, disabled }: StudentInputProps) {
  const addStudent = () => {
    setStudents([...students, ""])
  }

  const updateStudent = (index: number, value: string) => {
    const newStudents = [...students]
    newStudents[index] = value
    setStudents(newStudents)
  }

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index))
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">👥 학생 이름</h2>
      {students.length === 0 ? (
        <button
          onClick={addStudent}
          disabled={disabled}
          className="w-full rounded-lg bg-indigo-100 px-4 py-2 text-indigo-600 hover:bg-indigo-200 disabled:opacity-50"
        >
          + 학생 추가
        </button>
      ) : (
        <>
          {students.map((student, index) => (
            <div key={index} className="mb-3 flex gap-2">
              <input
                type="text"
                value={student}
                onChange={(e) => updateStudent(index, e.target.value)}
                placeholder={`학생 ${index + 1}`}
                disabled={disabled}
                className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => removeStudent(index)}
                disabled={disabled}
                className="rounded-lg bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200 disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          ))}
          <button
            onClick={addStudent}
            disabled={disabled}
            className="w-full rounded-lg bg-indigo-100 px-4 py-2 text-indigo-600 hover:bg-indigo-200 disabled:opacity-50"
          >
            + 학생 추가
          </button>
        </>
      )}
    </div>
  )
}
