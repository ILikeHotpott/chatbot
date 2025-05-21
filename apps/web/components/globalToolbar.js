"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SlidersHorizontal, SquarePen } from "lucide-react"
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem
} from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function GlobalToolbar() {
    const router = useRouter()
    const [model, setModel] = useState("gpt-4o")

    async function handleNewConversation() {
        // const res = await fetch("http://127.0.0.1:8000/api/new_conversation", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ title: "Untitled" })
        // })
        // const data = await res.json()
        // const cid = data.conversation_id ?? data.id
        // if (cid) router.push(`/conversation/${cid}`)
        router.push("/")
    }

    return (
        <header className="flex items-center justify-between h-12 px-4 border-b bg-background shrink-0">
            {/* ─── 左侧：侧边栏开关 + New ─── */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="size-6" />
                <button
                    onClick={handleNewConversation}
                    aria-label="New conversation"
                    className="p-1 hover:bg-muted rounded transition-colors"
                >
                    <SquarePen className="h-5 w-5" />
                </button>

                {/* 模型下拉 */}
                <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                        {[
                            ["gpt-4o", "OpenAI GPT-4o"],
                            ["gpt-4-turbo", "GPT-4 Turbo"],
                            ["gpt-3.5-turbo", "GPT-3.5 Turbo"],
                            ["deepseek-v3", "DeepSeek V3"],
                            ["llama3-70b", "Llama-3 70B"]
                        ].map(([val, label]) => (
                            <SelectItem value={val} key={val}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ─── 右侧：Config ─── */}
            <button
                className="p-1 hover:bg-muted rounded transition-colors"
                aria-label="Open configuration"
            >
                <SlidersHorizontal className="h-5 w-5" />
            </button>
        </header>
    )
}
