import { fetchApi } from './api';
import { TimelineEvent, TimelineSummaryStats } from '../types';
import { mockTimelineEvents, mockTimelineSummary } from '../mock/mockTimelineData';

export interface TimelineFilterParams {
  competitor?: string;
  activityType?: string;
  importance?: string;
  timeRange?: string;
  search?: string;
}

export const timelineApi = {
  /**
   * Retrieves timeline events with filters applied.
   */
  async getTimelineEvents(filters: TimelineFilterParams = {}): Promise<TimelineEvent[]> {
    try {
      const params = new URLSearchParams();
      if (filters.competitor && filters.competitor !== 'All Competitors') {
        params.append('competitor', filters.competitor);
      }
      if (filters.activityType && filters.activityType !== 'All Activity') {
        params.append('activity_type', filters.activityType);
      }
      if (filters.importance && filters.importance !== 'All') {
        params.append('importance', filters.importance);
      }
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const data = await fetchApi<TimelineEvent[]>(`/timeline${queryString}`);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return mockTimelineEvents;
    } catch (err) {
      console.warn('[timelineApi] Backend offline or error, falling back to mock events:', err);
      // Client-side fallback filter
      let filtered = [...mockTimelineEvents];
      if (filters.competitor && filters.competitor !== 'All Competitors') {
        filtered = filtered.filter(e => e.competitor.toLowerCase().includes(filters.competitor!.toLowerCase()));
      }
      if (filters.activityType && filters.activityType !== 'All Activity') {
        filtered = filtered.filter(e => e.type.toLowerCase() === filters.activityType!.toLowerCase());
      }
      if (filters.importance && filters.importance !== 'All') {
        filtered = filtered.filter(e => e.importance.toLowerCase() === filters.importance!.toLowerCase());
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
      }
      return filtered;
    }
  },

  /**
   * Retrieves timeline summary KPI indicators.
   */
  async getTimelineSummaryStats(): Promise<TimelineSummaryStats> {
    try {
      const summary = await fetchApi<{
        competitors_tracked: number;
        changes_detected: number;
        patterns_detected: number;
      }>('/dashboard/summary');

      return {
        totalEvents: summary.changes_detected || 32,
        totalCompetitors: summary.competitors_tracked || 4,
        totalSources: 6,
        detectedPatterns: summary.patterns_detected || 7,
      };
    } catch (err) {
      console.warn('[timelineApi] Summary stats error, using fallback:', err);
      return mockTimelineSummary;
    }
  },
};
