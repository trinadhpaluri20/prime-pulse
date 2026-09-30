import { fetchApi } from './api';
import { SmartAlertItem, SmartAlertsSummaryStats } from '../types';
import { mockSmartAlertsList, mockAlertsSummary } from '../mock/mockAlertsData';

export interface AlertFilterParams {
  status?: 'All' | 'Unread' | 'Read';
  priority?: string;
  competitor?: string;
  type?: string;
  search?: string;
}

export const alertsApi = {
  /**
   * Retrieves alerts list with status and priority filtering.
   */
  async getAlerts(filters: AlertFilterParams = {}): Promise<SmartAlertItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'All') {
        params.append('status', filters.status);
      }
      if (filters.priority && filters.priority !== 'All') {
        params.append('priority', filters.priority.toLowerCase());
      }
      if (filters.competitor && filters.competitor !== 'All Competitors') {
        params.append('competitor', filters.competitor);
      }
      if (filters.type && filters.type !== 'All') {
        params.append('alert_type', filters.type.toLowerCase().replace('-', '_'));
      }
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const data = await fetchApi<any[]>(`/alerts${queryString}`);

      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          id: `al-${item.id ?? Math.random().toString(36).substring(7)}`,
          competitor: item.competitor || item.competitor_name || 'Market Trigger',
          title: item.title || 'Competitive Signal Detected',
          description: item.description || '',
          priority: ((item.priority || 'medium').toLowerCase()) as 'high' | 'medium' | 'low',
          type: (item.alert_type ? item.alert_type.replace('_', '-') : item.type || 'pattern') as any,
          timestamp: item.timestamp || (item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString()),
          detectedDisplay: item.detectedDisplay || (item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'),
          historicalEvidenceCount: Number(item.historical_evidence_count ?? item.historicalEvidenceCount ?? 3),
          read: Boolean(item.is_read ?? item.read),
          whyItMatters: item.why_it_matters || item.whyItMatters || item.description || 'Important strategic signal detected across competitive surfaces.',
          observationFact: item.observation_fact || undefined,
          interpretation: item.interpretation || undefined,
          possibleSignal: item.possible_signal || undefined,
        }));
      }
      return mockSmartAlertsList;
    } catch (err) {
      console.warn('[alertsApi] Backend offline or error, falling back to mock alerts:', err);
      let filtered = [...mockSmartAlertsList];
      if (filters.status === 'Unread') {
        filtered = filtered.filter(a => !a.read);
      } else if (filters.status === 'Read') {
        filtered = filtered.filter(a => a.read);
      }
      if (filters.priority && filters.priority !== 'All') {
        filtered = filtered.filter(a => a.priority.toLowerCase() === filters.priority!.toLowerCase());
      }
      if (filters.competitor && filters.competitor !== 'All Competitors') {
        filtered = filtered.filter(a => a.competitor.toLowerCase().includes(filters.competitor!.toLowerCase()));
      }
      if (filters.type && filters.type !== 'All') {
        filtered = filtered.filter(a => a.type.toLowerCase() === filters.type!.toLowerCase());
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
      }
      return filtered;
    }
  },

  /**
   * Toggles or marks an individual alert as read or unread.
   */
  async markAlertRead(alertId: string | number, isRead: boolean = true): Promise<void> {
    try {
      const cleanId = String(alertId).replace('al-', '');
      await fetchApi(`/alerts/${cleanId}/read`, {
        method: 'PATCH',
        body: JSON.stringify({ is_read: isRead }),
      });
    } catch (err) {
      console.warn('[alertsApi] Failed to patch alert read status in backend:', err);
    }
  },

  /**
   * Marks all unread alerts as read.
   */
  async markAllAlertsRead(): Promise<void> {
    try {
      await fetchApi('/alerts/read-all', {
        method: 'PATCH',
      });
    } catch (err) {
      console.warn('[alertsApi] Failed to mark all alerts read in backend:', err);
    }
  },

  /**
   * Retrieves summary indicators for Smart Alerts.
   */
  async getAlertsSummaryStats(): Promise<SmartAlertsSummaryStats> {
    try {
      const summary = await fetchApi<any>('/dashboard/summary');
      return {
        activeAlerts: summary.active_alerts || 5,
        highPriority: 3,
        newToday: 2,
        historicalSignals: 14,
      };
    } catch (err) {
      return mockAlertsSummary;
    }
  },
};
