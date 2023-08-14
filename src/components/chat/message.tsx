import React from "react"
import { IconUser } from "@tabler/icons-react"
import clsx from "clsx"
import { User } from "firebase/auth"
import { Message } from "@/types"
import dayjs from "dayjs"

const Message = React.forwardRef<HTMLDivElement, { user: User; message: Message }>(
    ({ user, message }, ref) => {
        const formatDateTime = (timestamp: string) => {
            return dayjs(new Date(timestamp)).format("YYYY/MM/DD HH:mm:ss")
        }
        return (
            <div
                ref={ref}
                className={clsx(
                    "flex flex-col mb-2",
                    user.email === message.author?.email?.toLowerCase()
                        ? "items-end"
                        : "items-start"
                )}
            >
                <div className='flex items-center px-1 py-1'>
                    <div className='w-6 h-6 bg-orange-300 rounded-full flex items-center justify-center'>
                        {message.author?.avatar && message.author?.anonymous === false ? (
                            <img className='rounded-full' src={message.author.avatar} alt='' />
                        ) : (
                            <IconUser size={24} className='p-1' />
                        )}
                    </div>

                    <div className='ml-1'>
                        {message.author?.anonymous ? (
                            <div className='text-xs text-gray-400'>匿名</div>
                        ) : (
                            <div className='text-xs text-gray-400'>{message.author?.username}</div>
                        )}
                    </div>
                </div>
                <div className='border rounded-2xl bg-white p-2 max-w-xl break-words whitespace-pre-line'>
                    {message.content}
                </div>
                <div className='text-xs gary-400'>
                    {message.timestamp ? formatDateTime(message.timestamp) : ""}
                </div>
                <div className='text-xs gary-400 hidden'>{message.id}</div>
            </div>
        )
    }
)

Message.displayName = "Message"

export default Message
