import * as React from "react";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
    ({className, ...props}, ref) => (
        <Textarea
            autoComplete="off"
            ref={ref}
            name="message"
            className={cn(
                "max-h-12 px-4 py-3 bg-background  placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-2xl flex items-center h-16 resize-none",
                className,
            )}
            style={{fontSize: "1.1rem"}}
            {...props}
        />
    ),
);
ChatInput.displayName = "ChatInput";

export {ChatInput};
