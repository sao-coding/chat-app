"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { IconX } from "@tabler/icons-react"
import { useAuthState, useSignOut } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase/app"
import {
    query,
    collection,
    getDocs,
    orderBy,
    onSnapshot,
    startAfter,
    limit,
} from "firebase/firestore"
import { db } from "@/lib/firebase/app"
import { useInView } from "react-intersection-observer"
import MessageCP from "@/app/chat/components/message"
import SendCP from "@/app/chat/components/send"
import LoadingCP from "@/app/chat/components/loading"
import { Message } from "@/types"
import { useDeleteMessageStore } from "@/store/delete"

const ChatPage = () => {
    const [user, loading, error] = useAuthState(auth)
    const [signOut] = useSignOut(auth)
    const [messages, setMessages] = useState<Message[]>([])
    const [noMore, setNoMore] = useState(false)
    const { ref, inView } = useInView({
        delay: 800,
    })
    const firstLoadRef = useRef(true)
    const containerRef = useRef<HTMLDivElement>(null)
    const [lastMessageId, setLastMessageId] = useState<string | null>(null)
    const router = useRouter()
    const [isMouseDown, setIsMouseDown] = useState(false)
    const { deleteMessage } = useDeleteMessageStore()

    useEffect(() => {
        // 驗證是否登入
        if (!user && !loading) {
            router.push("/")
        }
    }, [user, loading])

    useEffect(() => {
        if (user) {
            const q = query(collection(db, "messages"), orderBy("timestamp", "desc"), limit(10))
            const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
                setMessages((currentMessages) => {
                    const data: Message[] = []

                    QuerySnapshot.docChanges().forEach((change) => {
                        const doc = change.doc
                        const messageData = {
                            id: doc.id,
                            ...doc.data(),
                        } as Message

                        if (change.type === "added") {
                            const existingMessage = currentMessages.find(
                                (message) => message.id === messageData.id
                            )

                            if (!existingMessage) {
                                data.push(messageData)
                                // 通知訊息
                                if (typeof window !== "undefined" && "Notification" in window) {
                                    if (
                                        Notification.permission === "granted" &&
                                        messageData.author.email !== user?.email &&
                                        !firstLoadRef.current &&
                                        localStorage.getItem("notification") === "true"
                                    ) {
                                        navigator.serviceWorker.ready.then((registration) => {
                                            registration.showNotification(
                                                localStorage.getItem("anonymous") === "true"
                                                    ? "匿名"
                                                    : messageData.author.username,
                                                {
                                                    body: messageData.content,
                                                    icon: messageData.author.avatar,
                                                    vibrate: [200, 100, 200, 100, 200, 100, 200],
                                                    tag: messageData.id,
                                                    renotify: true,
                                                    data: {
                                                        url: window.location.href,
                                                    },
                                                    actions: [
                                                        {
                                                            action: "open",
                                                            title: "開啟",
                                                            icon: "/icons/icon-192x192.png",
                                                        },
                                                        {
                                                            action: "close",
                                                            title: "關閉",
                                                            icon: "/icons/icon-192x192.png",
                                                        },
                                                    ],
                                                }
                                            )
                                        })
                                    }
                                }
                            }
                        } else if (change.type === "modified") {
                            // 處理現有訊息的更新
                            const existingIndex = currentMessages.findIndex(
                                (message) => message.id === messageData.id
                            )
                            if (existingIndex !== -1) {
                                // 更新現有訊息的內容
                                currentMessages[existingIndex] = messageData
                            }
                        } else if (change.type === "removed") {
                            // 處理現有訊息的刪除
                            const existingIndex = currentMessages.findIndex(
                                (message) => message.id === messageData.id
                            )
                            if (existingIndex !== -1) {
                                currentMessages.splice(existingIndex, 1)
                            }
                        }
                    })

                    firstLoadRef.current = false
                    setLastMessageId(data[data.length - 1]?.id ?? null)
                    return [...data, ...currentMessages]
                })
            })

            return () => unsubscribe()
        }
    }, [user])

    useEffect(() => {
        if (inView) {
            console.log("inView", messages[messages.length - 1].timestamp)
            const getMore = async () => {
                const q = query(
                    collection(db, "messages"),
                    orderBy("timestamp", "desc"),
                    startAfter(messages[messages.length - 1].timestamp),
                    limit(10)
                )

                const data = await getDocs(q)

                const oldMessages: Message[] = []

                data.forEach((doc) => {
                    oldMessages.push({
                        id: doc.id,
                        ...doc.data(),
                    } as Message)
                })

                setMessages((currentMessages) => [...currentMessages, ...oldMessages])
                console.log("oldMessages", oldMessages)
                if (oldMessages.length === 0) {
                    setNoMore(true)
                }
            }

            !isMouseDown && getMore()
        }
    }, [inView, isMouseDown])

    useEffect(() => {
        // 到底部
        containerRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }, [lastMessageId])

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
                            <div
                                className='h-[90vh] overflow-y-scroll px-2 flex flex-col-reverse overflow-x-hidden max-[375px]:h-[85vh]'
                                ref={containerRef}
                                onMouseDown={() => setIsMouseDown(true)}
                                onMouseUp={() => setIsMouseDown(false)}
                            >
                                {messages.map((message, i) => {
                                    if (messages.length === i + 1) {
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
                                {!noMore &&
                                    Array.from(Array(6).keys()).map((index) => (
                                        <LoadingCP key={index} index={index} />
                                    ))}
                            </div>

                            <div className='w-full h-[10vh] flex flex-col justify-end max-[375px]:h-[15vh]'>
                                {/* <div className='flex justify-between items-end bg-slate-100 py-2 px-4'> */}
                                <SendCP scroll={scroll} user={user} />
                                {/* </div> */}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default ChatPage
