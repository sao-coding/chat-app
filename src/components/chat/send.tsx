import { useState, useRef } from "react"
import { IconSend, IconMicrophone } from "@tabler/icons-react"
import { auth, db } from "@/lib/firebase/app"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { User } from "firebase/auth"
// 卷軸 type

const SendCP = ({ user, scroll }: { user: User; scroll: any }) => {
    // const [message, setMessage] = useState("")
    const [voice, setVoice] = useState("")
    const [voiceLoading, setVoiceLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    // const [messages, setMessages] = useState([])
    const [changes, setChanges] = useState(1)
    const messageRef = useRef<HTMLTextAreaElement | null>(null)
    const sendMessage = async () => {
        console.log("送出訊息", messageRef.current?.value)
        if (messageRef.current) {
            if (messageRef.current.value === "") return
            const { uid, displayName, photoURL, email } = user
            const data = {
                // uid,
                author: {
                    avatar: photoURL,
                    username: displayName,
                    email: email,
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
                scroll.current.scrollIntoView({ behavior: "smooth" })
                if (changes > 2) return
                setChanges(changes + 1)
            }
        } else {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                sendMessage()
            } else if (event.key === "Enter" && event.shiftKey) {
                scroll.current.scrollIntoView({ behavior: "smooth" })
                if (changes > 2) return
                setChanges(changes + 1)
            }
        }
    }

    return (
        // <div className='flex justify-between'>
        <>
            <textarea
                className='w-4/5 p-2 border rounded-md h-full'
                rows={changes}
                ref={messageRef}
                onKeyDown={handleKeyDown}
            />
            <button
                className='text-white bg-sky-700 p-2 rounded-md hover:bg-sky-500 h-full mx-1'
                onClick={sendMessage}
            >
                <IconSend size={25} />
            </button>
            {/* 語音輸入 */}
            <button
                className='text-white bg-sky-700 p-2 rounded-md hover:bg-sky-500 h-full'
                onClick={voiceInput}
            >
                <IconMicrophone size={25} />
            </button>
        </>
        // </div>
    )
}

export default SendCP
