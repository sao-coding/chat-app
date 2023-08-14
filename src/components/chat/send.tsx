import { useState, useEffect, useRef } from "react"
import {
    IconSend,
    IconMicrophone,
    IconUser,
    IconSettings,
    IconX,
    IconBell,
    IconSpy,
} from "@tabler/icons-react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Switch from "@radix-ui/react-switch"
import clsx from "clsx"
import { db } from "@/lib/firebase/app"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { User } from "firebase/auth"
// 卷軸 type

const SendCP = ({ user, scroll }: { user: User; scroll: any }) => {
    const [voice, setVoice] = useState("")
    const [voiceLoading, setVoiceLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [changes, setChanges] = useState(1)
    const [notification, setNotification] = useState(
        localStorage.getItem("notification") === "true" ? true : false
    )
    const [anonymous, setAnonymous] = useState(
        localStorage.getItem("anonymous") === "true" ? true : false
    )
    const messageRef = useRef<HTMLTextAreaElement | null>(null)
    // const AnonymousRef = useRef(false)

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then(function (registration) {
                    console.log("Registration successful, scope is:", registration.scope)
                })
                .catch(function (error) {
                    console.log("Service worker registration failed, error:", error)
                })
        }
    }, [])

    const sendMessage = async () => {
        if (messageRef.current) {
            if (messageRef.current.value === "") return
            const { uid, displayName, photoURL, email } = user
            const data = {
                // uid,
                author: {
                    avatar: photoURL,
                    username: displayName,
                    email: email,
                    anonymous: anonymous,
                },
                content: messageRef.current.value,
                timestamp: new Date().toISOString(),
            }

            try {
                await addDoc(collection(db, "messages"), data)
                messageRef.current.value = ""
                setChanges(1)
                // // 偵測捲軸自動捲到底部
                // scroll.current.scrollIntoView({ behavior: "smooth" })
            } catch (error) {
                console.log(error)
            }
        }
    }

    const voiceInput = () => {
        console.log("語音輸入")
        setVoiceLoading(true)
        if (!("webkitSpeechRecognition" in window)) {
            alert("您的瀏覽器不支持語音輸入")
            return
        }
        const recognition =
            new (window as any).webkitSpeechRecognition() || (window as any).SpeechRecognition()

        // 設置語言為中文
        recognition.lang = "zh-TW"

        // 設置連續語音辨識
        // recognition.continuous = true

        // 設置語音辨識事件處理器
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript
            console.log("輸入的文本：", transcript)
            setVoice(transcript)
            if (messageRef.current) {
                messageRef.current.value = transcript
            }

            setVoiceLoading(false)
        }

        recognition.start()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // 如果是手機版，就不要做任何事情
        // 刪除
        if (event.key === "Backspace") {
            if (changes === 1) return
            setChanges(changes - 1)
        }
        if (window.innerWidth < 768) {
            if (event.key === "Enter") {
                scroll.current?.scrollTo({
                    top: 0,
                    behavior: "smooth",
                })
                if (changes > 2) return
                setChanges(changes + 1)
            }
        } else {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                sendMessage()
            } else if (event.key === "Enter" && event.shiftKey) {
                scroll.current?.scrollTo({
                    top: 0,
                    behavior: "smooth",
                })
                if (changes > 2) return
                setChanges(changes + 1)
            }
        }
    }

    const onNotification = async () => {
        // 開關通知
        if (notification) {
            localStorage.setItem("notification", "false")
            setNotification(false)

            // 取消註冊通知
            // if ("serviceWorker" in navigator) {
            //     navigator.serviceWorker.getRegistrations().then((registrations) => {
            //         for (let registration of registrations) {
            //             registration.unregister()
            //         }
            //     })
            // }
        }
        if (!notification) {
            localStorage.setItem("notification", "true")
            setNotification(true)
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification("通知訊息", {
                    body: "您已開啟通知",
                    icon: "/icons/icon-192x192.png",
                    vibrate: [200, 100, 200, 100, 200, 100, 200],
                    tag: "notification",
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
                })
            })

            // 註冊通知
            // 是否允許瀏覽器通知
            await Notification.requestPermission()
            if (Notification.permission === "granted") {
                setNotification(true)
            }
            if (Notification.permission === "denied") {
                setNotification(false)
            }
        }
    }

    const onAnonymous = () => {
        // 開關匿名
        if (anonymous) {
            localStorage.setItem("anonymous", "false")
            setAnonymous(false)
        }
        if (!anonymous) {
            localStorage.setItem("anonymous", "true")
            setAnonymous(true)
        }
    }

    return (
        <>
            {/* <div className='flex items-center justify-center'> */}
            <Dialog.Root>
                <Dialog.Trigger asChild>
                    <div className='p-2 flex items-center justify-center'>
                        {/* {user?.photoURL && anonymous === false ? (
                                <img className='rounded-full' src={user?.photoURL} alt='' />
                            ) : (
                                <IconUser size={24} />
                            )} */}
                        <IconSettings size={25} />
                    </div>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay className='fixed inset-0 z-10 bg-[rgba(0,0,0,.5)] backdrop-blur-sm data-[state=open]:animate-overlayShow' />
                    <Dialog.Content className='fixed left-1/2 top-1/2 z-10 max-h-[85vh] w-[90vw] max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-lg outline-none data-[state=open]:animate-contentShow'>
                        <Dialog.Close className='absolute right-0 flex items-center justify-end pr-4 outline-none'>
                            <IconX size={24} />
                        </Dialog.Close>
                        <Dialog.Title asChild>
                            <div className='flex items-center justify-center text-lg font-bold'>
                                設定
                            </div>
                        </Dialog.Title>
                        <div className='flex flex-col space-y-2'>
                            <div className='flex items-center space-x-2'>
                                <div className='w-10 h-10 bg-orange-300 rounded-full flex items-center justify-center'>
                                    {user?.photoURL && anonymous === false ? (
                                        <img className='rounded-full' src={user?.photoURL} alt='' />
                                    ) : (
                                        <IconUser size={24} />
                                    )}
                                </div>
                                <div className=''>{user.email}</div>
                            </div>
                            <div className=''>{user.displayName}</div>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-2'>
                                    <IconBell />
                                    <div className=''>通知訊息</div>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <div
                                        className={clsx(
                                            "text-xs",
                                            notification ? "text-green-500" : "text-red-500"
                                        )}
                                    >
                                        {notification ? "已開啟" : "已關閉"}
                                    </div>
                                    <Switch.Root
                                        className='bg-black rounded-full w-11 h-6 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 outline-none'
                                        defaultChecked={notification}
                                        onCheckedChange={onNotification}
                                        checked={notification}
                                    >
                                        <Switch.Thumb className='bg-white rounded-full h-5 w-5 block transition-transform data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0.5' />
                                    </Switch.Root>
                                </div>
                            </div>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-2'>
                                    <IconSpy />
                                    <div className=''>匿名模式</div>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <div
                                        className={clsx(
                                            "text-xs",
                                            anonymous ? "text-green-500" : "text-red-500"
                                        )}
                                    >
                                        {anonymous ? "已開啟" : "已關閉"}
                                    </div>
                                    <Switch.Root
                                        className='bg-black rounded-full w-11 h-6 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 outline-none'
                                        defaultChecked={anonymous}
                                        onCheckedChange={onAnonymous}
                                    >
                                        <Switch.Thumb className='bg-white rounded-full h-5 w-5 block transition-transform data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0.5' />
                                    </Switch.Root>
                                </div>
                            </div>
                            <div className='text-xs text-gray-500'>
                                {"註： 匿名模式下，您的大頭貼與姓名將不會顯示在聊天室"}
                                <br />
                                {"註：使用不同裝置匿名設定不會同步"}
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
            {/* </div> */}
            <textarea
                className={clsx(
                    "w-4/6 py-2 px-3 border h-full focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent",
                    changes === 1 && "rounded-full",
                    changes > 1 && "rounded-xl"
                )}
                rows={changes}
                ref={messageRef}
                onKeyDown={handleKeyDown}
                placeholder={anonymous ? "匿名模式" : "一般模式"}
            />
            <div className='flex items-center'>
                <button className='p-2 rounded-md h-full' onClick={sendMessage}>
                    {/* 旋轉 icon 45 度 */}
                    <IconSend size={25} className='transform rotate-45' />
                </button>
                {/* 語音輸入 */}
                <button className='p-2 rounded-md h-full' onClick={voiceInput}>
                    <IconMicrophone size={25} />
                </button>
            </div>
        </>
    )
}

export default SendCP
