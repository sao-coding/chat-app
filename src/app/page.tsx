"use client"

import { useEffect } from "react"
import { useSignInWithGoogle } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase/app"
import { IconBrandGoogle } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

const HomePage = () => {
    const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth)
    const router = useRouter()

    useEffect(() => {
        if (user && !loading && !error) {
            router.push("/chat")
        }
    }, [user, loading, error])

    return (
        <div className='flex items-center justify-center h-full'>
            <div className='bg-white shadow-md rounded-md p-2'>
                <div className='w-full text-center text-2xl'>聊天室登入</div>
                <button
                    className='flex items-center justify-center bg-orange-300 shadow-md rounded-md px-4 py-2'
                    onClick={() => signInWithGoogle()}
                >
                    <IconBrandGoogle size={24} />
                    <span>使用 Google 登入</span>
                </button>
            </div>
        </div>
    )
}

export default HomePage
