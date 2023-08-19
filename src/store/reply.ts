import { create } from "zustand"

type ReplyMessageStore = {
    replyMessage: {
        id: string
        author: {
            avatar: string
            username: string
            email: string
            anonymous: boolean
        }
        content: string
        timestamp: string
        edited_timestamp: string
        deleted_timestamp: string
        status: boolean
    }
    setReplyMessage: (message: {
        id: string
        author: {
            avatar: string
            username: string
            email: string
            anonymous: boolean
        }
        content: string
        timestamp: string
        edited_timestamp: string
        deleted_timestamp: string
        status: boolean
    }) => void
}

export const useReplyMessageStore = create<ReplyMessageStore>((set) => ({
    replyMessage: {
        id: "",
        author: {
            avatar: "",
            username: "",
            email: "",
            anonymous: false,
        },
        content: "",
        timestamp: "",
        edited_timestamp: "",
        deleted_timestamp: "",
        status: false,
    },
    setReplyMessage: (message) => set({ replyMessage: message }),
}))
