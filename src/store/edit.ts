import { create } from "zustand"

type EditMessageStore = {
    editMessage: {
        id: string
        email: string
        content: string
        status: boolean
    }
    setEditMessage: (message: {
        id: string
        email: string
        content: string
        status: boolean
    }) => void
}

export const useEditMessageStore = create<EditMessageStore>((set) => ({
    editMessage: {
        id: "",
        email: "",
        content: "",
        status: false,
    },
    setEditMessage: (message) => set({ editMessage: message }),
}))
