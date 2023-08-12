export type Message = {
    id: string
    author: {
        avatar: string
        username: string
        email: string
        name: string
    }
    content: string
    timestamp: string
}
