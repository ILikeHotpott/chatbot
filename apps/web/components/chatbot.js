"use client"

import { useChat } from "ai/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { ChatBubble, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import ThreadPanel from "@/components/ThreadPanel"
import ChatView from "@/components/ChatView"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { MessageSquareReply } from "lucide-react"

export default function ChatbotMain({
  conversationId,
  setConversationId,
  initialMessages = []
}) {
  /* ---------- local ---------- */
  const [creatingConv, setCreatingConv] = useState(false)
  const [activeThreadParentMessage, setActiveThreadParentMessage] = useState(
    null
  )
  const [showThreadPanel, setShowThreadPanel] = useState(false)
  const [expandedThreadMsgs, setExpandedThreadMsgs] = useState({})

  /* ---------- latest id ref ---------- */
  const convIdRef = useRef(conversationId)
  useEffect(() => {
    convIdRef.current = conversationId
  }, [conversationId])

  /* ---------- chat ---------- */
  const {
    messages,
    input,
    handleInputChange,
    append,
    isLoading,
    setInput,
    setMessages
  } = useChat({
    api: "http://127.0.0.1:8000/api/chat",
    experimental_prepareRequestBody: ({ messages }) => ({
      conversation_id: convIdRef.current,
      branch_id: null,
      model: "gpt-4o",
      message: messages.at(-1)?.content ?? ""
    }),
    headers: { "Content-Type": "application/json" },
    initialMessages
  })

  const onSubmit = async e => {
    e.preventDefault()
    if (isLoading || !input.trim()) return

    const userText = input
    setInput("")
    setCreatingConv(true)

    if (!convIdRef.current) {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/new_conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: userText.slice(0, 20) || "Untitled" })
        })
        const data = await res.json()
        const cid = data.conversation_id ?? data.id
        if (!cid) throw new Error("new_conversation 接口未返回 id")
        convIdRef.current = cid
        setConversationId(cid)

        window.history.replaceState(null, "", `/conversation/${cid}`)
      } catch (err) {
        console.error("创建会话失败：", err)
        setCreatingConv(false)
        return
      }
    }

    /* ② 直接 append，流式返回 */
    try {
      await append({ role: "user", content: userText })
    } finally {
      setCreatingConv(false)
    }
  }

  const onKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  /* ---------- helpers ---------- */
  const toggleExpandThreadMsg = id =>
    setExpandedThreadMsgs(p => ({ ...p, [id]: !p[id] }))

  const handleOpenThread = msg => {
    setActiveThreadParentMessage(msg)
    setShowThreadPanel(true)
  }
  const handleCloseThread = () => {
    setShowThreadPanel(false)
    setActiveThreadParentMessage(null)
  }

  /* ---------- reply counts ---------- */
  const messageReplyCounts = useMemo(() => {
    const map = {}
    messages.forEach(m => {
      if (m?.parentId && m.branchId)
        map[m.parentId] = (map[m.parentId] || 0) + 1
    })
    return map
  }, [messages])

  const currentThreadReplies = useMemo(() => {
    if (!activeThreadParentMessage?.id) return []
    return messages
      .filter(m => m?.parentId === activeThreadParentMessage.id && m.branchId)
      .sort(
        (a, b) =>
          (new Date(a.createdAt).getTime() || 0) -
          (new Date(b.createdAt).getTime() || 0)
      )
  }, [messages, activeThreadParentMessage])

  const handlePostReplyToThread = txt => {
    if (!txt.trim() || !activeThreadParentMessage?.id) return
    setMessages([
      ...messages,
      {
        id: `reply-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,
        content: txt,
        role: "user",
        createdAt: new Date().toISOString(),
        parentId: activeThreadParentMessage.id,
        branchId: "temp"
      }
    ])
  }

  /* ---------- render ---------- */
  const renderMessages = (list, isThread = false) => (
    <>
      {list.map((m, i) => {
        const isAssistant = m.role === "assistant"
        const containerJustify = isThread
          ? "justify-center"
          : isAssistant
            ? "justify-start"
            : "justify-end"
        const bubbleWidth = isThread
          ? "max-w-[80%]"
          : isAssistant
            ? "max-w-[90%]"
            : "max-w-[80%]"
        const shouldShorten =
          isThread && typeof m.content === "string" && m.content.length > 50
        const expanded = expandedThreadMsgs[m.id]
        const displayedContent =
          shouldShorten && !expanded ? `${m.content.slice(0, 50)}…` : m.content

        return (
          <div
            key={m.id ?? i}
            className={`group relative my-4 flex w-full md:px-[10%] ${containerJustify}`}
          >
            {isAssistant ? (
              <div className={`flex w-full ${bubbleWidth} gap-3`}>
                <img
                  src="/openai.svg"
                  alt="bot"
                  className="h-8 w-8 shrink-0 rounded-full"
                />
                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-5 mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="text-base leading-relaxed mb-4" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc ml-6 space-y-2 mb-4" {...props} />,
                      li: ({ node, ...props }) => <li className="text-base leading-relaxed" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                    }}
                  >
                    {displayedContent}
                  </Markdown>
                </div>
              </div>
            ) : (
              <ChatBubble
                variant="sent"
                className={`${bubbleWidth} w-auto`}
                onOpenThread={
                  !isThread && m ? () => handleOpenThread(m) : undefined
                }
                replyCount={
                  !isThread && m?.id ? messageReplyCounts[m.id] || 0 : 0
                }
              >
                <ChatBubbleMessage
                  variant="sent"
                  className="text-base"
                  onClick={
                    shouldShorten
                      ? () => toggleExpandThreadMsg(m.id)
                      : undefined
                  }
                >
                  <p className="whitespace-pre-wrap break-words">
                    {displayedContent}
                  </p>
                  {shouldShorten && (
                    <span className="block mt-2 text-xs text-sky-400 hover:underline">
                      {expanded ? "Collapse" : "Expand"}
                    </span>
                  )}
                </ChatBubbleMessage>
              </ChatBubble>
            )}

            {!isThread && (
              <button
                onClick={() => handleOpenThread(m)}
                className="
                  absolute left-1/2 top-full mt-2 -translate-x-1/2
                  rounded-full p-1 opacity-0 transition-opacity
                  group-hover:opacity-100 hover:opacity-100
                  hover:bg-muted/20
                "
              >
                <MessageSquareReply className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )
      })}
    </>
  )

  const mainMessages = useMemo(() => messages.filter(m => m && !m.branchId), [
    messages
  ])

  /* ---------- layout ---------- */
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex h-full w-full overflow-hidden bg-background"
    >
      <ResizablePanel
        defaultSize={showThreadPanel ? 75 : 100}
        className={showThreadPanel ? "hidden md:block" : "block"}
      >
        <ChatView
          mainMessages={mainMessages}
          isLoading={isLoading}
          isGenerating={isLoading || creatingConv}
          input={input}
          handleInputChange={handleInputChange}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          renderMessages={renderMessages}
          showThreadPanel={showThreadPanel}
        />
      </ResizablePanel>

      {showThreadPanel && activeThreadParentMessage && (
        <ThreadPanel
          activeThreadParentMessage={activeThreadParentMessage}
          currentThreadReplies={currentThreadReplies}
          handleCloseThread={handleCloseThread}
          handlePostReplyToThread={handlePostReplyToThread}
          renderMessages={renderMessages}
          showThreadPanel={showThreadPanel}
          expandedThreadMsgs={expandedThreadMsgs}
          toggleExpandThreadMsg={toggleExpandThreadMsg}
        />
      )}
    </ResizablePanelGroup>
  )
}
