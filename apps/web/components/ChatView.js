/********************************************************************
 *  ChatView.tsx
 *******************************************************************/
"use client"

import { ChatInput } from "@/components/ui/chat/chat-input"
import { ChatMessageList } from "@/components/ui/chat/chat-message-list"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

export default function ChatView({
  mainMessages,
  isLoading,
  isGenerating,
  input,
  handleInputChange,
  onSubmit,
  onKeyDown,
  renderMessages,
  messagesRef,
  showThreadPanel
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {mainMessages.length === 0 && !isLoading && !showThreadPanel ? (
        <div className="flex flex-1 flex-col items-center gap-10 px-4 pt-48 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How can I help you?
          </h1>
          <form onSubmit={onSubmit} className="relative w-full max-w-2xl">
            <ChatInput
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              placeholder="Ask anything"
              className="h-20 resize-none bg-background px-4 py-2 text-lg"
            />
            <Button
              type="submit"
              disabled={!input || isGenerating || isLoading}
              className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full"
            >
              <Send className="size-5" />
            </Button>
          </form>
        </div>
      ) : (
        <>
          <ChatMessageList
            ref={messagesRef}
            className="min-h-0 flex-1 gap-8 overflow-y-auto bg-muted/15 py-8"
          >
            {renderMessages(mainMessages, false)}
          </ChatMessageList>

          <div className="shrink-0 bg-muted/15 px-6 pb-6">
            <form
              onSubmit={onSubmit}
              className="relative mx-auto flex w-full max-w-5xl gap-2"
            >
              <ChatInput
                value={input}
                onChange={handleInputChange}
                onKeyDown={onKeyDown}
                placeholder="Type your message and press Enter…"
                className="flex-1 h-20 resize-none bg-background px-4 py-3 text-lg"
              />
              <Button
                type="submit"
                disabled={!input || isGenerating || isLoading}
                className="absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-md"
              >
                <Send className="size-5" />
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
