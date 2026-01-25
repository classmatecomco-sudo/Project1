'use client';

import { useState } from 'react';

export default function Home() {
  const [students, setStudents] = useState<string[]>(['']);
  const [tasks, setTasks] = useState<string[]>(['']);
  const [result, setResult] = useState<Record<string, string[]> | null>(null);

  const addStudent = () => {
    setStudents([...students, '']);
  };

  const updateStudent = (index: number, value: string) => {
    const newStudents = [...students];
    newStudents[index] = value;
    setStudents(newStudents);
  };

  const removeStudent = (index: number) => {
    if (students.length > 1) {
      setStudents(students.filter((_, i) => i !== index));
    }
  };

  const addTask = () => {
    setTasks([...tasks, '']);
  };

  const updateTask = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const removeTask = (index: number) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const distribute = () => {
    const validStudents = students.filter(s => s.trim() !== '');
    const validTasks = tasks.filter(t => t.trim() !== '');

    if (validStudents.length === 0) {
      alert('학생 이름을 최소 1명 이상 입력해주세요.');
      return;
    }

    if (validTasks.length === 0) {
      alert('숙제를 최소 1개 이상 입력해주세요.');
      return;
    }

    const distribution: Record<string, string[]> = {};
    validStudents.forEach(student => {
      distribution[student] = [];
    });

    const shuffledTasks = [...validTasks].sort(() => Math.random() - 0.5);
    const baseCount = Math.floor(shuffledTasks.length / validStudents.length);
    const remainder = shuffledTasks.length % validStudents.length;

    let taskIndex = 0;
    validStudents.forEach((student, index) => {
      const count = baseCount + (index < remainder ? 1 : 0);
      distribution[student] = shuffledTasks.slice(taskIndex, taskIndex + count);
      taskIndex += count;
    });

    setResult(distribution);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-indigo-600">📚 숙제 분배기</h1>
          <p className="text-gray-600">공정하게 나눠드려요!</p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">👥 학생 이름</h2>
          {students.map((student, index) => (
            <div key={index} className="mb-3 flex gap-2">
              <input
                type="text"
                value={student}
                onChange={(e) => updateStudent(index, e.target.value)}
                placeholder={`학생 ${index + 1}`}
                className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
              {students.length > 1 && (
                <button
                  onClick={() => removeStudent(index)}
                  className="rounded-lg bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addStudent}
            className="w-full rounded-lg bg-indigo-100 px-4 py-2 text-indigo-600 hover:bg-indigo-200"
          >
            + 학생 추가
          </button>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">📝 숙제 목록</h2>
          {tasks.map((task, index) => (
            <div key={index} className="mb-3 flex gap-2">
              <input
                type="text"
                value={task}
                onChange={(e) => updateTask(index, e.target.value)}
                placeholder={`숙제 ${index + 1}`}
                className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
              {tasks.length > 1 && (
                <button
                  onClick={() => removeTask(index)}
                  className="rounded-lg bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addTask}
            className="w-full rounded-lg bg-indigo-100 px-4 py-2 text-indigo-600 hover:bg-indigo-200"
          >
            + 숙제 추가
          </button>
        </div>

        <button
          onClick={distribute}
          className="mb-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          ✨ 분배하기
        </button>

        {result && (
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-center text-2xl font-bold text-indigo-600">🎯 분배 결과</h2>
            <div className="space-y-4">
              {Object.entries(result).map(([student, assignedTasks]) => (
                <div key={student} className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-indigo-700">{student}</h3>
                  <ul className="space-y-1">
                    {assignedTasks.length > 0 ? (
                      assignedTasks.map((task, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
                          <span className="text-indigo-500">✓</span>
                          <span>{task}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400">할당된 숙제가 없습니다</li>
                    )}
                  </ul>
                  <div className="mt-2 text-sm font-medium text-indigo-600">
                    총 {assignedTasks.length}개
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
