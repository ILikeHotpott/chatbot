"use client"

import { useMemo } from "react"
import { Search as SearchIcon } from "lucide-react"
import { isSameDay, isSameWeek, isSameMonth } from "date-fns"
import { useRouter } from "next/navigation"
import Link from 'next/link'
import { useConversations } from "@/contexts/ConversationContext"

import { Input } from "@/components/ui/input"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar"

function groupKey(d) {
    const now = new Date()
    if (isSameDay(now, d)) return "Today"
    if (isSameWeek(now, d, { weekStartsOn: 1 })) return "This Week"
    if (isSameMonth(now, d)) return "This Month"
    return "Earlier"
}

export function AppSidebar() {
    const router = useRouter()
    const { conversations, isLoading } = useConversations()

    /* group by bucket */
    const groups = useMemo(() => {
        const buckets = {
            Today: [],
            "This Week": [],
            "This Month": [],
            Earlier: []
        }
        if (conversations && conversations.length > 0) {
            conversations.forEach(c => {
                buckets[groupKey(new Date(c.created_at))].push(c)
            })
        }
        return buckets
    }, [conversations])

    if (isLoading) {
        return (
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2 px-3 pt-4 pb-2">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search"
                                className="w-full rounded-xl pl-8 h-8"
                                disabled
                            />
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <div className="p-4 text-sm text-muted-foreground">Loading conversations...</div>
                </SidebarContent>
            </Sidebar>
        )
    }

    return (
        <Sidebar>
            {/* ---- header ---- */}
            <SidebarHeader>
                <div className="flex items-center gap-2 px-3 pt-4 pb-2">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search"
                            className="w-full rounded-xl pl-8 h-8"
                        />
                    </div>
                </div>
            </SidebarHeader>

            {/* ---- list ---- */}
            <SidebarContent>
                {["Today", "This Week", "This Month", "Earlier"].map(lbl =>
                    groups[lbl].length ? (
                        <SidebarGroup key={lbl}>
                            <SidebarGroupLabel>{lbl}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {groups[lbl].map(c => (
                                        <SidebarMenuItem key={c.id}>
                                            <SidebarMenuButton asChild>
                                                <Link
                                                    href={`/conversation/${c.id}`}
                                                    className="flex w-full items-center truncate"
                                                >
                                                    <span className="truncate">
                                                        {c.title || "(untitled)"}
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ) : null
                )}
            </SidebarContent>
        </Sidebar>
    )
}
