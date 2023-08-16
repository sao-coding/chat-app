export type Message = {
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
}
