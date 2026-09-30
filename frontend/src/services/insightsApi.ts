import { fetchApi } from './api';
import { AIInsightItem, AIInsightsSummaryStats, InsightEvidenceDetails } from '../types';
import {
  mockInsightsList,
  mockInsightsSummary,
  featuredInsight,
} from '../mock/mockInsightsData';

export interface InsightFilterParams {
  type?: string;
  competitor?: string;
  priority?: string;
  search?: string;
}

export const insightsApi = {
  /**
   * Retrieves AI strategic insights list with multi-criteria filtering.
   */
  async getInsights(filters: InsightFilterParams = {}): Promise<AIInsightItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'All Insights') {
        params.append('type', filters.type.toLowerCase());
      }
      if (filters.competitor && filters.competitor !== 'All Competitors') {
        params.append('competitor', filters.competitor);
      }
      if (filters.priority && filters.priority !== 'All') {
        params.append('priority', filters.priority.toLowerCase());
      }
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const data = await fetchApi<any[]>(`/insights${queryString}`);

      if (Array.isArray(data) && data.length > 0) {
        return data.map((item, idx) => ({
          id: `ins-${item.id}`,
          type: item.type,
          title: item.title,
          competitor: item.competitor || item.competitor_name || 'Market Pattern',
          description: item.description,
          confidence: Math.round((item.confidence || 0.85) * 100),
          evidenceCount: item.evidence_count || 3,
          historicalMatches: item.evidence_count || 3,
          priority: item.priority as 'high' | 'medium' | 'low',
          timeframeDays: item.timeframe_days || 30,
          detectedPatternFlow: item.detectedPatternFlow,
          isFeatured: idx === 0,
          evidenceDetails: item.evidenceDetails,
        }));
      }
      return mockInsightsList;
    } catch (err) {
      console.warn('[insightsApi] Backend offline or error, falling back to mock insights:', err);
      // Client side fallback filter
      let filtered = [...mockInsightsList];
      if (filters.type && filters.type !== 'All Insights') {
        filtered = filtered.filter(i => i.type.toLowerCase() === filters.type!.toLowerCase());
      }
      if (filters.competitor && filters.competitor !== 'All Competitors') {
        filtered = filtered.filter(i => i.competitor.toLowerCase().includes(filters.competitor!.toLowerCase()));
      }
      if (filters.priority && filters.priority !== 'All') {
        filtered = filtered.filter(i => i.priority.toLowerCase() === filters.priority!.toLowerCase());
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
      }
      return filtered;
    }
  },

  /**
   * Retrieves supporting historical evidence for a specific insight modal.
   */
  async getInsightEvidence(insightId: string | number): Promise<InsightEvidenceDetails | null> {
    try {
      const cleanId = String(insightId).replace('ins-', '');
      const data = await fetchApi<any>(`/insights/${cleanId}/evidence`);
      if (data && data.evidence_details) {
        return data.evidence_details;
      }
      return featuredInsight.evidenceDetails || null;
    } catch (err) {
      console.warn('[insightsApi] Error fetching evidence breakdown, using fallback:', err);
      return featuredInsight.evidenceDetails || null;
    }
  },

  /**
   * Retrieves summary KPI stats for the Insights view.
   */
  async getInsightsSummaryStats(): Promise<AIInsightsSummaryStats> {
    try {
      const summary = await fetchApi<any>('/dashboard/summary');
      return {
        patternsDetected: summary.patterns_detected || 7,
        historicalMatches: 34,
        activeSignals: 18,
        averageConfidence: 91,
      };
    } catch (err) {
      return mockInsightsSummary;
    }
  },
};
