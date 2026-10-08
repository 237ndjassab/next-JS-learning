"use client"
import { useRouter } from "next/navigation.js"

const BackButton = () => {
  const router = useRouter()
  return (
    <button onClick={()=> router.back()}>
      ⬅️ Retour
    </button>
  )
}

export default BackButton