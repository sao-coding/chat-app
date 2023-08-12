"use client"

import { useRouter } from "next/navigation"
import { use, useEffect, useRef, useState } from "react"
import { useAuthState, useSignOut } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase/app"
import { query, collection, orderBy, onSnapshot, limit } from "firebase/firestore"
import { db } from "@/lib/firebase/app"
import MessageCP from "@/components/chat/message"
import SendCP from "@/components/chat/send"
import { Message } from "@/types"

const ChatPage = () => {
    const [user, loading, error] = useAuthState(auth)
    const [signOut] = useSignOut(auth)
    const [messages, setMessages] = useState<Message[]>([])
    const scroll = useRef<HTMLDivElement | null>(null)
    const router = useRouter()

    useEffect(() => {
        // 驗證是否登入
        if (!user) {
            router.push("/")
        }
    }, [user])

    useEffect(() => {
        if (scroll.current) {
            scroll.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    useEffect(() => {
        const q = query(collection(db, "messages"), orderBy("timestamp", "asc"), limit(50))
        const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
            const fetchedMessages: Message[] = []
            QuerySnapshot.forEach((doc) => {
                console.log(doc.data())
                fetchedMessages.push({ id: doc.id, ...doc.data() } as Message)
            })
            // const sortedMessages = fetchedMessages.sort(
            //     (a, b) => a.timestamp.seconds - b.timestamp.seconds
            // )
            setMessages(fetchedMessages)
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        console.log(user)
    }, [user])

    return (
        <>
            {user && (
                <>
                    <div className='py-2 h-full'>
                        <div className='relative h-full flex flex-col'>
                            <div className='absolute w-full text-center'>
                                <button
                                    className='text-xs px-2 py-1 rounded-md bg-orange-300'
                                    onClick={() => signOut()}
                                >
                                    登出
                                </button>
                            </div>
                            <div className='h-[90vh] overflow-y-scroll px-2'>
                                {messages.map((message) => (
                                    <MessageCP key={message.id} user={user} message={message} />
                                ))}
                                <span ref={scroll}></span>
                            </div>

                            <div className='w-full'>
                                <div className='text-xs text-gray-400 text-center'>
                                    Powered by 唯一
                                </div>
                                <div className='flex justify-between items-end'>
                                    <SendCP scroll={scroll} user={user} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default ChatPage
