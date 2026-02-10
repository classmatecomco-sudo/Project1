import Link from "next/link"
import { AuthMenu } from "./auth-menu"

export function Header() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-indigo-600 hover:underline">
          📚 숙제 분배기
        </Link>
        <AuthMenu />
      </div>
      <p className="text-center text-gray-600">공정하게 나눠드려요!</p>
    </div>
  )
}
