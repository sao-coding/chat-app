import "./globals.css"
import type { Metadata } from "next"
import Container from "@/components/Container"

export const metadata: Metadata = {
    title: "聊天 App",
    description: "聊天 App By 唯一",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='zh-Hant-TW'>
            <body>
                <Container>{children}</Container>
            </body>
        </html>
    )
}
