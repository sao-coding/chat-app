import "./globals.css"
import type { Metadata } from "next"
import Container from "@/components/Container"

export const metadata: Metadata = {
    title: "聊天 App",
    description: "聊天 App By 唯一",
    manifest: "/pwa/manifest.json",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='zh-Hant-TW'>
            <head>
                <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
                <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
                <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
                <link rel='manifest' href='pwa/manifest.json' />
                <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#5bbad5' />
                <meta name='msapplication-TileColor' content='#da532c' />
                <meta name='theme-color' content='#ffffff' />
            </head>
            <body>
                <Container>{children}</Container>
            </body>
        </html>
    )
}
