/* components/ui/chat/chat-bubble.js */
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import MessageLoading from "./message-loading"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

// ChatBubble
const chatBubbleVariant = cva(
  "flex gap-2 items-end relative group",
  {
    variants: {
      variant: {
        received: "self-start",
        sent: "self-end flex-row-reverse",
      },
      layout: {
        default: "",
        ai: "max-w-full w-full items-center",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  }
)

const ChatBubble = React.forwardRef(
  ({ className, variant, layout, children, onOpenThread, replyCount, ...props }, ref) => (
    <div
      className={cn(
        chatBubbleVariant({ variant, layout, className }),
        "relative group"
      )}
      ref={ref}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(child, { variant, layout })
          : child
      )}

      {onOpenThread && (
        <ChatBubbleActionWrapper variant={variant}>
          <ChatBubbleAction
            icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
            onClick={onOpenThread}
            aria-label="Reply in thread"
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </ChatBubbleActionWrapper>
      )}

      {replyCount > 0 && onOpenThread && (
        <button
          onClick={onOpenThread}
          className={cn(
            "text-xs mt-1 text-blue-500 hover:underline",
            variant === "sent" ? "mr-2" : "ml-2"
          )}
          style={{
            position: "absolute",
            bottom: "-18px",
            ...(variant === "sent" ? { right: "0" } : { left: "48px" }),
          }}
        >
          {replyCount} {replyCount === 1 ? "reply" : "replies"}
        </button>
      )}
    </div>
  )
)
ChatBubble.displayName = "ChatBubble"

// ChatBubbleAvatar
const ChatBubbleAvatar = ({ src, fallback, className }) => (
  <Avatar className={className}>
    <AvatarImage src={src} alt="Avatar" />
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
)

// ChatBubbleMessage
const chatBubbleMessageVariants = cva("px-4 py-2", {
  variants: {
    variant: {
      // limit width to ~50 characters before wrapping
      received:
        "bg-[var(--sidebar)] text-[var(--sidebar-foreground)] rounded-2xl max-w-[50ch]",
      sent:
        "bg-[var(--sidebar)] text-[var(--sidebar-foreground)] rounded-2xl max-w-[50ch]",
    },
    layout: {
      default: "",
      ai: "border-t w-full rounded-none bg-transparent text-foreground",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
})

const ChatBubbleMessage = React.forwardRef(
  ({ className, variant, layout, isLoading = false, children, ...props }, ref) => (
    <div
      className={cn(
        chatBubbleMessageVariants({ variant, layout, className }),
        "whitespace-pre-wrap break-words"
      )}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
        </div>
      ) : (
        children
      )}
    </div>
  )
)
ChatBubbleMessage.displayName = "ChatBubbleMessage"

// ChatBubbleTimestamp
const ChatBubbleTimestamp = ({ timestamp, className, ...props }) => (
  <div className={cn("text-xs mt-2 text-right", className)} {...props}>
    {timestamp}
  </div>
)

// ChatBubbleAction
const ChatBubbleAction = ({
  icon,
  onClick,
  className,
  variant = "ghost",
  size = "icon",
  ...props
}) => (
  <Button variant={variant} size={size} className={className} onClick={onClick} {...props}>
    {icon}
  </Button>
)

// ChatBubbleActionWrapper
const ChatBubbleActionWrapper = React.forwardRef(
  ({ variant, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        variant === "sent"
          ? "-left-2 -translate-x-full flex-row-reverse space-x-1 space-x-reverse"
          : "-right-2 translate-x-full space-x-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
ChatBubbleActionWrapper.displayName = "ChatBubbleActionWrapper"

export {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  chatBubbleVariant,
  chatBubbleMessageVariants,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
}
