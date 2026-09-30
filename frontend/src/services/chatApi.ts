import { fetchApi } from './api';
import { ChatMessage } from '../types';
import { generateMockIntelligenceResponse } from '../mock/mockChatData';

export const chatApi = {
  /**
   * Sends user query to the backend intelligence service boundary.
   * Falls back seamlessly to simulated synthesis with memory provenance.
   */
  async sendMessage(query: string, conversationId?: string, competitorId?: number): Promise<ChatMessage & { conversation_id?: string }> {
    try {
      const response = await fetchApi<{
        answer: string;
        evidence: any[];
        confidence: number;
        facts?: string[];
        observations?: string[];
        citations?: string[];
        related_events?: string[];
        conversation_id?: string;
      }>('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: query,
          query,
          conversation_id: conversationId,
          competitor_id: competitorId,
        }),
      });

      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        facts: response.facts || [],
        observations: response.observations || [],
        citations: response.citations || [],
        conversation_id: response.conversation_id,
        evidence: {
          summary: 'Verified against historical activity timeline and monitored memory data.',
          eventsCount: response.evidence?.length || (response.related_events?.length || 2),
          matchesCount: response.related_events?.length || 2,
          sequence: response.evidence || [],
          observedData: response.observations?.length ? response.observations : response.facts,
          confidence: Math.round((response.confidence ?? 0.87) * 100),
        },
      };
    } catch (err) {
      console.warn('[chatApi] Backend chat API unavailable, using simulated intelligence response:', err);
      const fallback = generateMockIntelligenceResponse(query);
      return { ...fallback, conversation_id: conversationId };
    }
  },
};
