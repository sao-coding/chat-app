"use client"

import { useRouter } from "next/navigation"
import { use, useEffect, useRef, useState } from "react"
import { useAuthState, useSignOut } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase/app"
import { query, collection, orderBy, onSnapshot, startAfter, limit } from "firebase/firestore"
import { db } from "@/lib/firebase/app"
import { useInView } from "react-intersection-observer"
import MessageCP from "@/components/chat/message"
import SendCP from "@/components/chat/send"
import { Message } from "@/types"

const ChatPage = () => {
    const [user, loading, error] = useAuthState(auth)
    const [signOut] = useSignOut(auth)
    const [messages, setMessages] = useState<Message[]>([])
    const [lastMessageId, setLastMessageId] = useState<string | undefined>(undefined)
    const scroll = useRef<HTMLDivElement | null>(null)
    const router = useRouter()
    const { ref, inView } = useInView()

    useEffect(() => {
        // 驗證是否登入
        if (!user && !loading) {
            router.push("/")
        }
    }, [user, loading])

    useEffect(() => {
        const fetchMessages = (id?: string) => {
            // const q = query(
            //     collection(db, "messages"),
            //     orderBy("timestamp", "desc"),
            //     startAt(id),
            //     limit(10)
            // )
            let q
            if (id) {
                console.log("id", id)
                q = query(
                    collection(db, "messages"),
                    orderBy("timestamp", "desc"),
                    startAfter(id),
                    limit(10)
                )
            } else {
                q = query(collection(db, "messages"), orderBy("timestamp", "desc"), limit(50))
            }

            const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
                console.log("及時更新")
                const fetchedMessages: Message[] = []
                QuerySnapshot.forEach((doc) => {
                    fetchedMessages.push({ id: doc.id, ...doc.data() } as Message)
                })
                const sortedMessages = fetchedMessages.sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                )
                // setMessages((messages) => [...sortedMessages, ...messages])
                setMessages(sortedMessages)
                if (!id) setLastMessageId(messages[messages.length - 1]?.id)
            })

            return () => unsubscribe()
        }
        fetchMessages()
    }, [])

    useEffect(() => {
        // 如果有新訊息就滾動到最下面
        // 取得最後一筆訊息的 id
        console.log("messages", messages)
        // const lastMessageId = messages[messages.length - 1]?.id
        console.log("lastMessageId", lastMessageId)
        if (scroll.current) {
            scroll.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    useEffect(() => {
        if (inView) {
            console.log("inView")
            // 取得最後一筆訊息的 timestamp
            const lastMessageTimestamp = messages[0].timestamp
            console.log(lastMessageTimestamp)
            // fetchMessages(lastMessageTimestamp)
        }
    }, [inView])

    return (
        <>
            {user && (
                <>
                    <div className='pt-2 h-full'>
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
                                {messages.map((message, i) => {
                                    if (i === 0) {
                                        return (
                                            <MessageCP
                                                ref={ref}
                                                key={message.id}
                                                user={user}
                                                message={message}
                                            />
                                        )
                                    }
                                    return (
                                        <MessageCP key={message.id} user={user} message={message} />
                                    )
                                })}
                                <span ref={scroll}></span>
                            </div>

                            <div className='w-full h-[10vh] flex flex-col justify-end'>
                                <div className='text-xs text-gray-400 text-center'>
                                    Powered by 唯一
                                </div>
                                <div className='flex justify-between items-end bg-slate-100 py-2 px-4'>
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
