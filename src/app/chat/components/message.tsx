import React, { useEffect } from "react"
import { IconUser } from "@tabler/icons-react"
import clsx from "clsx"
import { User } from "firebase/auth"
import { db } from "@/lib/firebase/app"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Message } from "@/types"
import dayjs from "dayjs"
import * as Popover from "@radix-ui/react-popover"
import { useEditMessageStore } from "@/store/edit"
import { useDeleteMessageStore } from "@/store/delete"

const Message = React.forwardRef<HTMLDivElement, { user: User; message: Message }>(
    ({ user, message }, ref) => {
        const { setEditMessage } = useEditMessageStore()
        const { deleteMessage, setDeleteMessage } = useDeleteMessageStore()

        useEffect(() => {
            const deleteMsg = async () => {
                const docRef = doc(db, "messages", deleteMessage.id)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    await setDoc(docRef, {
                        ...docSnap.data(),
                        deleted_timestamp: new Date().toISOString(),
                    })
                }
            }
            if (deleteMessage.status && deleteMessage.email === user.email) {
                deleteMsg()
                setDeleteMessage({
                    id: "",
                    email: "",
                    status: false,
                })
            }
        }, [deleteMessage.status])

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
                {!message.deleted_timestamp && (
                    <>
                        {user.email === message.author?.email?.toLowerCase() ? (
                            <Popover.Root modal={true}>
                                <Popover.Trigger asChild>
                                    <div className='border rounded-2xl bg-white px-2 py-1 max-w-xs break-words whitespace-pre-line'>
                                        {message.content}
                                    </div>
                                </Popover.Trigger>
                                <Popover.Anchor className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
                                <Popover.Portal>
                                    <Popover.Content className='w-48 bg-slate-100 outline-none border rounded-2xl p-2'>
                                        <Popover.Close asChild>
                                            <button
                                                className='block outline-none text-center w-full hover:bg-slate-200 rounded-md'
                                                onClick={() => {
                                                    setEditMessage({
                                                        id: message.id,
                                                        email: message.author?.email?.toLowerCase(),
                                                        content: message.content,
                                                        status: true,
                                                    })
                                                }}
                                            >
                                                編輯
                                            </button>
                                        </Popover.Close>
                                        <Popover.Close asChild>
                                            <button
                                                className='block outline-none text-center w-full hover:bg-slate-200 rounded-md'
                                                onClick={async () => {
                                                    setDeleteMessage({
                                                        id: message.id,
                                                        email: message.author?.email?.toLowerCase(),
                                                        status: true,
                                                    })
                                                }}
                                            >
                                                刪除
                                            </button>
                                        </Popover.Close>
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        ) : (
                            <div className='border rounded-2xl bg-white px-2 py-1 max-w-xs break-words whitespace-pre-line'>
                                {message.content}
                            </div>
                        )}
                    </>
                )}
                {message.deleted_timestamp && (
                    <div className='text-xs text-red-500'>已刪除訊息</div>
                )}
                <div className='text-xs gary-400'>
                    {message.deleted_timestamp ? (
                        formatDateTime(message.deleted_timestamp) + " 已刪除"
                    ) : (
                        <>
                            {message.edited_timestamp
                                ? formatDateTime(message.edited_timestamp) + " 已編輯"
                                : formatDateTime(message.timestamp)}
                        </>
                    )}
                </div>
                {/* <div className='text-xs gary-400'>{message.id}</div> */}
            </div>
        )
    }
)

Message.displayName = "Message"

export default Message
