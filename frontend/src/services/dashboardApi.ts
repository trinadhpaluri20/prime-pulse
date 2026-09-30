import { fetchApi } from './api';
import {
  DashboardKPICardData,
  mockDashboardKPIs,
  mockActivityChartData,
  mockDashboardIntelligenceBrief,
  mockRecentActivities,
  mockActiveAlertsPreview,
  mockHistoricalMemoryStats,
} from '../mock/dashboardMockData';
import {
  DashboardActivityItem,
  DashboardAlertItem,
  DashboardIntelligenceBrief,
  HistoricalMemoryStats,
  ActivityChartDataPoint,
} from '../types';

export interface DashboardSummaryApiResponse {
  competitors_tracked: number;
  changes_detected: number;
  patterns_detected: number;
  active_alerts: number;
}

export const dashboardApi = {
  /**
   * Retrieves summary metric cards with fallback to mock data.
   */
  async getDashboardSummary(): Promise<DashboardKPICardData[]> {
    try {
      const summary = await fetchApi<DashboardSummaryApiResponse>('/dashboard/summary');
      return [
        {
          id: 'kpi-1',
          label: 'Competitors Tracked',
          value: summary.competitors_tracked,
          changeIndicator: '+2 this month',
          isPositiveChange: true,
          supportingText: '4 Tier-1 Strategic Entities',
          category: 'competitors',
        },
        {
          id: 'kpi-2',
          label: 'Changes Detected',
          value: summary.changes_detected,
          changeIndicator: '+38% vs prev period',
          isPositiveChange: true,
          supportingText: '34 Verified Across 6 Sources',
          category: 'changes',
        },
        {
          id: 'kpi-3',
          label: 'Patterns Detected',
          value: summary.patterns_detected,
          changeIndicator: '94% peak confidence',
          isPositiveChange: true,
          supportingText: 'Precursor Correlation Engine',
          category: 'patterns',
        },
        {
          id: 'kpi-4',
          label: 'Active Alerts',
          value: summary.active_alerts,
          changeIndicator: '4 High Priority',
          isPositiveChange: false,
          supportingText: 'Immediate Action Required',
          category: 'alerts',
        },
      ];
    } catch (err) {
      console.warn('[dashboardApi] Backend unavailable or failed, falling back to mock KPIs:', err);
      return mockDashboardKPIs;
    }
  },

  /**
   * Retrieves historical multi-competitor activity volume for the Recharts visualization.
   */
  async getActivityChartData(timeframe: '6M' | '30D' | '7D' = '6M'): Promise<ActivityChartDataPoint[]> {
    try {
      const data = await fetchApi<ActivityChartDataPoint[]>(`/dashboard/activity?timeframe=${timeframe}`);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return mockActivityChartData[timeframe];
    } catch (err) {
      console.warn('[dashboardApi] Chart API error, using fallback:', err);
      return mockActivityChartData[timeframe];
    }
  },

  /**
   * Retrieves executive intelligence brief synthesis.
   */
  async getIntelligenceBrief(): Promise<DashboardIntelligenceBrief> {
    try {
      return await fetchApi<DashboardIntelligenceBrief>('/dashboard/brief');
    } catch (err) {
      console.warn('[dashboardApi] Brief API error, using fallback:', err);
      return mockDashboardIntelligenceBrief;
    }
  },

  /**
   * Retrieves recent activities for the dashboard feed.
   */
  async getRecentActivities(): Promise<DashboardActivityItem[]> {
    try {
      const activities = await fetchApi<any[]>('/activities?limit=5');
      if (Array.isArray(activities) && activities.length > 0) {
        return activities.map((act) => ({
          id: `act-${act.id}`,
          competitor: act.competitor_name || `Competitor ${act.competitor_id}`,
          type: act.activity_type.charAt(0).toUpperCase() + act.activity_type.slice(1),
          description: act.title,
          timestamp: new Date(act.detected_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          importance: act.importance as 'high' | 'medium' | 'low',
        }));
      }
      return mockRecentActivities;
    } catch (err) {
      console.warn('[dashboardApi] Recent activities API error, using fallback:', err);
      return mockRecentActivities;
    }
  },

  /**
   * Retrieves active alert items preview for the dashboard.
   */
  async getActiveAlertsPreview(): Promise<DashboardAlertItem[]> {
    try {
      const alerts = await fetchApi<any[]>('/alerts?status=Unread&limit=4');
      if (Array.isArray(alerts) && alerts.length > 0) {
        return alerts.map((al) => ({
          id: `al-${al.id}`,
          title: al.title,
          competitor: al.competitor_name || `Competitor ${al.competitor_id}`,
          description: al.description,
          timestamp: new Date(al.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          severity: al.priority as 'high' | 'medium' | 'low',
        }));
      }
      return mockActiveAlertsPreview;
    } catch (err) {
      console.warn('[dashboardApi] Alerts preview API error, using fallback:', err);
      return mockActiveAlertsPreview;
    }
  },

  /**
   * Retrieves historical memory retention telemetry stats.
   */
  async getHistoricalMemoryStats(): Promise<HistoricalMemoryStats> {
    return Promise.resolve(mockHistoricalMemoryStats);
  },
};
