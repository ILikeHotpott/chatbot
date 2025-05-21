/********************************************************************
 *  ThreadPanel.tsx
 *******************************************************************/
"use client"

import {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage
} from "@/components/ui/chat/chat-bubble"
import { ChatInput } from "@/components/ui/chat/chat-input"
import { ChatMessageList } from "@/components/ui/chat/chat-message-list"
import { Button } from "@/components/ui/button"
import { X, Send } from "lucide-react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import CodeDisplayBlock from "@/components/ui/chat/hooks/code-display-block"
import { ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb"

export default function ThreadPanel({
    activeThreadParentMessage,
    currentThreadReplies,
    handleCloseThread,
    handlePostReplyToThread,
    renderMessages,
    showThreadPanel,
    expandedThreadMsgs,
    toggleExpandThreadMsg
}) {
    if (!showThreadPanel || !activeThreadParentMessage) return null

    /* ----- parent message shortening (same 50-char rule) ----- */
    const parentTooLong =
        typeof activeThreadParentMessage.content === "string" &&
        activeThreadParentMessage.content.length > 50
    const parentExpanded = expandedThreadMsgs[activeThreadParentMessage.id]
    const parentContent =
        parentTooLong && !parentExpanded
            ? `${activeThreadParentMessage.content.slice(0, 50)}…`
            : activeThreadParentMessage.content

    return (
        <>
            <ResizableHandle className="hidden w-0.5 bg-transparent transition-colors duration-150 ease-in-out md:flex hover:bg-sky-400/75 data-[resize-handle-active=true]:bg-sky-400/75 dark:hover:bg-sky-300/75 dark:data-[resize-handle-active=true]:bg-sky-300/75" />
            <ResizablePanel defaultSize={25} minSize={20}>
                <div className="flex h-full w-full flex-col overflow-y-auto bg-muted/20 md:border-l border-border">
                    {/* ---------- header ---------- */}
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-muted/20 p-4">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <Button
                                        variant="link"
                                        onClick={handleCloseThread}
                                        className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        Root
                                    </Button>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage
                                        className="max-w-[180px] truncate text-sm font-medium text-foreground"
                                        title={activeThreadParentMessage.content}
                                    >
                                        {activeThreadParentMessage.content.slice(0, 25)}
                                        {activeThreadParentMessage.content.length > 25 && "…"}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCloseThread}
                            aria-label="Close thread"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* ---------- parent message ---------- */}
                    <div className="flex justify-center border-b border-dashed border-border py-2">
                        <ChatBubble
                            key={activeThreadParentMessage.id}
                            variant={
                                activeThreadParentMessage.role === "user" ? "sent" : "received"
                            }
                            className="w-4/5 max-w-[80%] gap-3"
                        >
                            {/* <ChatBubbleAvatar
                                src=""
                                fallback={
                                    activeThreadParentMessage.role === "user" ? "👨🏽" : "🤖"
                                }
                                className="h-9 w-9"
                            /> */}
                            <ChatBubbleMessage
                                variant={
                                    activeThreadParentMessage.role === "user"
                                        ? "sent"
                                        : "received"
                                }
                                className="text-base"
                            >
                                {activeThreadParentMessage.role === "user" ? (
                                    <p
                                        className="break-words whitespace-pre-wrap"
                                        onClick={
                                            parentTooLong
                                                ? () =>
                                                    toggleExpandThreadMsg(activeThreadParentMessage.id)
                                                : undefined
                                        }
                                    >
                                        {parentContent}
                                    </p>
                                ) : (
                                    typeof parentContent === "string" &&
                                    parentContent.split("```").map((part, i) =>
                                        i % 2 === 0 ? (
                                            <Markdown
                                                key={i}
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ node, ...props }) => (
                                                        <p className="break-words" {...props} />
                                                    ),
                                                }}
                                            >
                                                {part}
                                            </Markdown>

                                        ) : (
                                            <pre
                                                key={i}
                                                className="mt-2 max-w-full overflow-x-auto whitespace-pre rounded-md bg-zinc-700 p-3 text-sm"
                                            >
                                                <CodeDisplayBlock code={part} lang="" />
                                            </pre>
                                        )
                                    )
                                )}
                                {parentTooLong && (
                                    <button
                                        onClick={() =>
                                            toggleExpandThreadMsg(activeThreadParentMessage.id)
                                        }
                                        className="mt-2 block text-xs text-sky-400 hover:underline"
                                    >
                                        {parentExpanded ? "Collapse" : "Expand"}
                                    </button>
                                )}
                            </ChatBubbleMessage>
                        </ChatBubble>
                    </div>

                    {/* ---------- replies ---------- */}
                    <ChatMessageList className="flex-1 min-h-0 gap-4 px-4 py-6">
                        {renderMessages(currentThreadReplies, true)}
                        {currentThreadReplies.length === 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No replies yet.
                            </p>
                        )}
                    </ChatMessageList>

                    {/* ---------- composer ---------- */}
                    <div className="sticky bottom-0 z-10 border-t border-border bg-muted/20 px-4 pb-6 pt-4">
                        <form
                            onSubmit={e => {
                                e.preventDefault()
                                const input = e.currentTarget.elements.namedItem(
                                    "threadReplyInput"
                                ).value
                                if (input.trim()) {
                                    handlePostReplyToThread(input)
                                    e.currentTarget.elements.namedItem("threadReplyInput").value =
                                        ""
                                }
                            }}
                            className="relative flex w-full gap-2"
                        >
                            <ChatInput
                                name="threadReplyInput"
                                placeholder="Reply in thread…"
                                className="flex-1 h-16 resize-none bg-background px-4 py-3 text-base"
                                onKeyDown={e => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        e.currentTarget.form?.requestSubmit()
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-md"
                            >
                                <Send className="size-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </ResizablePanel>
        </>
    )
}
