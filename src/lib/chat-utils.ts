import { getChatSessions } from "@/config/services";
import { ChatSession } from "@/types/chat";

/**
 * Find the most recent chat session for a given subject.
 * Returns null if no sessions exist for that subject.
 */
export async function getLastSessionForSubject(
  userId: string,
  subjectName: string
): Promise<ChatSession | null> {
  try {
    const response = await getChatSessions(userId);
    const sessionsData = response.sessions || [];

    const normalizedSubject = subjectName.toLowerCase().trim();

    const matchingSessions = sessionsData
      .map((session: any) => {
        const sessionId = session.session_id || session.id || session._id;
        return {
          id: sessionId,
          user_id: userId,
          title: session.session_name || "Untitled Chat",
          agent_type: session.agent_type || "subject",
          agent_name: session.subject || "General",
          agent_id: session.agent_id,
          created_at: session.created_at || new Date().toISOString(),
          updated_at:
            session.last_message_at ||
            session.updated_at ||
            session.created_at ||
            new Date().toISOString(),
          last_message_at:
            session.last_message_at ||
            session.created_at ||
            new Date().toISOString(),
          message_count: session.message_count || 0,
          is_archived: !session.is_active,
        } as ChatSession;
      })
      .filter((s: ChatSession) => {
        if (!s.id) return false;
        const sessionSubject = (s.agent_name || "").toLowerCase().trim();
        return sessionSubject === normalizedSubject;
      })
      .sort(
        (a: ChatSession, b: ChatSession) =>
          new Date(b.last_message_at).getTime() -
          new Date(a.last_message_at).getTime()
      );

    return matchingSessions.length > 0 ? matchingSessions[0] : null;
  } catch (error) {
    console.error("Failed to get last session for subject:", error);
    return null;
  }
}
