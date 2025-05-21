"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import ChatbotMain from "@/components/chatbot"

export default function Home() {
  const pathname = usePathname()
  const initialId =
    typeof pathname === "string" && pathname.startsWith("/conversation/")
      ? pathname.split("/conversation/")[1] || null
      : null

  const [conversationId, setConversationId] = useState(initialId)

  return (
    <ChatbotMain
      conversationId={conversationId}
      setConversationId={setConversationId}
      initialMessages={[]}
    />
  )
}
