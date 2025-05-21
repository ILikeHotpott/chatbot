import ChatbotMain from "@/components/chatbot"
import { notFound } from "next/navigation"
import { v4 as uuidv4 } from 'uuid';

export const dynamic = "force-dynamic"

export default async function ConversationPage({ params }) {
    let { cid } = await params;
    let initialMessages = [];

    if (cid === "new") {
        cid = uuidv4(); // Generate a new UUID for new conversations
        console.log(`[ConversationPage] New conversation, generated cid: ${cid}`);
    } else {
        console.log(`[ConversationPage] Existing conversation, cid from params: ${cid}`);
        const resp = await fetch(`http://127.0.0.1:8000/conversation/${cid}`, {
            cache: "no-store"
        });
        if (!resp.ok) {
            console.error(`[ConversationPage] Failed to fetch conversation ${cid}, status: ${resp.status}`);
            notFound();
        }

        try {
            const raw = await resp.json();
            initialMessages = raw.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                createdAt: new Date(m.created_at).toISOString(),
                parentId: m.parent_id,
                branchId: m.branch_id
            }));
        } catch (error) {
            console.error(`[ConversationPage] Failed to parse JSON for conversation ${cid}:`, error);
            // Decide how to handle this - perhaps treat as notFound() or an error page
            notFound(); 
        }
    }

    return <ChatbotMain conversationId={cid} initialMessages={initialMessages} />
}
