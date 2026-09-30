import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import KPICard from '../components/ui/KPICard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Tooltip from '../components/ui/Tooltip';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { mockAlertsSummary, mockSmartAlertsList } from '../mock/mockAlertsData';
import { alertsApi } from '../services/alertsApi';
import { SmartAlertItem, SmartAlertType, AlertPriority } from '../types';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  GitMerge,
  DollarSign,
  Layers,
  Globe,
  Users,
  Megaphone,
  Zap,
  Clock,
  Sparkles,
  RotateCcw,
  CheckCheck,
  Eye,
  Info
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const navigate = useNavigate();

  // Alert List State
  const [alerts, setAlerts] = useState<SmartAlertItem[]>(mockSmartAlertsList);

  useEffect(() => {
    let isMounted = true;
    alertsApi.getAlerts().then((data) => {
      if (isMounted && data && data.length > 0) {
        setAlerts(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unread' | 'Read'>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [competitorFilter, setCompetitorFilter] = useState<string>('All Competitors');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<string>('30 Days');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'Most Recent' | 'Highest Priority' | 'Most Historical Evidence'>('Most Recent');
  const [loading, setLoading] = useState<boolean>(false);

  // Modal State for Alert Details
  const [selectedAlert, setSelectedAlert] = useState<SmartAlertItem | null>(null);

  // Toggle Read State for Single Alert
  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const current = alerts.find(a => a.id === id);
    const nextRead = current ? !current.read : true;
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: nextRead } : a));
    alertsApi.markAlertRead(id, nextRead);
  };

  // Mark All as Read
  const handleMarkAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    alertsApi.markAllAlertsRead();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setStatusFilter('All');
    setPriorityFilter('All');
    setCompetitorFilter('All Competitors');
    setTypeFilter('All');
    setTimeFilter('30 Days');
    setSearchQuery('');
    setSortBy('Most Recent');
  };

  const isFiltered =
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    competitorFilter !== 'All Competitors' ||
    typeFilter !== 'All' ||
    timeFilter !== '30 Days' ||
    searchQuery.trim() !== '' ||
    sortBy !== 'Most Recent';

  // Computed summary metrics
  const unreadCount = alerts.filter(a => !a.read).length;
  const highPriorityCount = alerts.filter(a => (a.priority || '').toLowerCase() === 'high').length;
  const newTodayCount = alerts.filter(a => {
    const disp = (a.detectedDisplay || '').toLowerCase();
    return disp.includes('hour') || disp.includes('today');
  }).length;
  const historicalSignalsCount = alerts.filter(a => (a.historicalEvidenceCount || 0) > 0).length;

  // Filter & Sort Logic
  const filteredAlerts = useMemo(() => {
    const list = alerts.filter((alt) => {
      // 1. Status Filter
      if (statusFilter === 'Unread' && alt.read) return false;
      if (statusFilter === 'Read' && !alt.read) return false;

      // 2. Priority Filter
      if (priorityFilter !== 'All' && (alt.priority || '').toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }

      // 3. Competitor Filter
      if (competitorFilter !== 'All Competitors' && alt.competitor !== competitorFilter) {
        return false;
      }

      // 4. Alert Type Filter
      if (typeFilter !== 'All') {
        const typeMap: Record<string, SmartAlertType> = {
          'Activity Spike': 'activity-spike',
          'Pattern': 'pattern',
          'Pricing': 'pricing',
          'Product': 'product',
          'Website': 'website',
          'Hiring': 'hiring',
          'Marketing': 'marketing'
        };
        const targetType = typeMap[typeFilter];
        if (targetType && (alt.type || '') !== targetType) return false;
      }

      // 5. Time Filter
      if (timeFilter === 'Today') {
        const disp = (alt.detectedDisplay || '').toLowerCase();
        const isToday = disp.includes('hour') || disp.includes('today');
        if (!isToday) return false;
      }
      if (timeFilter === '7 Days') {
        const disp = (alt.detectedDisplay || '').toLowerCase();
        const is7Days = disp.includes('hour') || disp.includes('today') || disp.includes('yesterday') || disp.includes('day');
        if (!is7Days) return false;
      }

      // 6. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = (alt.title || '').toLowerCase().includes(q);
        const inDesc = (alt.description || '').toLowerCase().includes(q);
        const inComp = (alt.competitor || '').toLowerCase().includes(q);
        const inWhy = (alt.whyItMatters || '').toLowerCase().includes(q);
        const inType = (alt.type || '').toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inComp && !inWhy && !inType) return false;
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'Highest Priority') {
        const rank: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const rankB = rank[(b.priority || '').toLowerCase()] || 0;
        const rankA = rank[(a.priority || '').toLowerCase()] || 0;
        return rankB - rankA;
      }
      if (sortBy === 'Most Historical Evidence') {
        return (b.historicalEvidenceCount || 0) - (a.historicalEvidenceCount || 0);
      }
      // Most Recent (default)
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [alerts, statusFilter, priorityFilter, competitorFilter, typeFilter, timeFilter, searchQuery, sortBy]);

  // Priority Styling Helper
  const getPriorityStyle = (priority?: AlertPriority | string) => {
    const p = (priority || '').toLowerCase();
    switch (p) {
      case 'high':
        return {
          label: 'High Priority',
          color: '#FB7185',
          bg: 'rgba(244, 63, 94, 0.1)',
          border: 'rgba(244, 63, 94, 0.3)',
          indicatorDot: '#FB7185'
        };
      case 'medium':
        return {
          label: 'Medium Priority',
          color: '#FBBF24',
          bg: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.3)',
          indicatorDot: '#FBBF24'
        };
      case 'low':
      default:
        return {
          label: 'Low Priority',
          color: '#38BDF8',
          bg: 'rgba(0, 210, 255, 0.1)',
          border: 'rgba(0, 210, 255, 0.25)',
          indicatorDot: '#38BDF8'
        };
    }
  };

  // Alert Type Icon & Meta Helper
  const getTypeMeta = (type?: SmartAlertType | string) => {
    const t = (type || '').toLowerCase();
    switch (t) {
      case 'activity-spike':
      case 'activity_spike':
        return { label: 'Activity Spike', icon: Zap, color: '#FB7185' };
      case 'pattern':
        return { label: 'Pattern', icon: GitMerge, color: '#C084FC' };
      case 'pricing':
        return { label: 'Pricing', icon: DollarSign, color: '#00D2FF' };
      case 'product':
        return { label: 'Product', icon: Layers, color: '#38BDF8' };
      case 'hiring':
        return { label: 'Hiring', icon: Users, color: '#818CF8' };
      case 'marketing':
        return { label: 'Marketing', icon: Megaphone, color: '#D946EF' };
      case 'website':
      default:
        return { label: 'Website', icon: Globe, color: '#94A3B8' };
    }
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* 1. Page Header with Subtle Monitoring Status and Active Alerts Count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}
            >
              Smart Alerts
            </h1>
            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                marginTop: '0.25rem',
                lineHeight: 1.4
              }}
            >
              Important competitive signals detected across your monitored landscape.
            </p>
          </div>

          {/* Right Status Indicator & Active Alert Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.8rem',
                background: 'rgba(0, 210, 255, 0.08)',
                border: '1px solid rgba(0, 210, 255, 0.22)',
                borderRadius: '20px',
                fontSize: '0.75rem',
                color: '#38BDF8',
                fontWeight: 600
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#00D2FF',
                  boxShadow: '0 0 8px rgba(0, 210, 255, 0.8)'
                }}
              />
              <span>Monitoring Active</span>
            </div>

            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#FFFFFF',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px'
              }}
            >
              {unreadCount} Active Alerts
            </span>
          </div>
        </div>

        {/* 2. Summary Metrics (4 Compact Metrics matching Dashboard KPI cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          <KPICard
            stat={{
              id: 'stat-active-alerts',
              label: 'Active Alerts',
              value: unreadCount,
              subtext: 'Requiring review',
              category: 'threats'
            }}
            icon={<AlertTriangle size={16} />}
          />
          <KPICard
            stat={{
              id: 'stat-high-priority',
              label: 'High Priority',
              value: highPriorityCount,
              subtext: 'Immediate market movements',
              category: 'signals'
            }}
            icon={<Zap size={16} />}
          />
          <KPICard
            stat={{
              id: 'stat-new-today',
              label: 'New Today',
              value: newTodayCount,
              subtext: 'Detected in last 24h',
              category: 'competitors'
            }}
            icon={<Clock size={16} />}
          />
          <KPICard
            stat={{
              id: 'stat-historical-signals',
              label: 'Historical Signals',
              value: historicalSignalsCount,
              subtext: 'Precedent memory linked',
              category: 'memory'
            }}
            icon={<GitMerge size={16} />}
          />
        </div>

        {/* 3. Professional Filter and Search Bar */}
        <div
          className="ci-card"
          style={{
            padding: '1.25rem 1.35rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* Top Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
            
            {/* Status Filter */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Status
              </label>
              <select
                className="ci-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="All">All Statuses</option>
                <option value="Unread">Unread ({unreadCount})</option>
                <option value="Read">Read ({alerts.length - unreadCount})</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Priority
              </label>
              <select
                className="ci-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Competitor Filter */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Competitor
              </label>
              <select
                className="ci-select"
                value={competitorFilter}
                onChange={(e) => setCompetitorFilter(e.target.value)}
              >
                <option value="All Competitors">All Competitors</option>
                <option value="Competitor A">Competitor A</option>
                <option value="Competitor B">Competitor B</option>
                <option value="Competitor C">Competitor C</option>
                <option value="Competitor D">Competitor D</option>
              </select>
            </div>

            {/* Alert Type Filter */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Alert Type
              </label>
              <select
                className="ci-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Activity Spike">Activity Spike</option>
                <option value="Pattern">Pattern</option>
                <option value="Pricing">Pricing</option>
                <option value="Product">Product</option>
                <option value="Website">Website</option>
                <option value="Hiring">Hiring</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Timeframe
              </label>
              <select
                className="ci-select"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="Today">Today</option>
                <option value="7 Days">7 Days</option>
                <option value="30 Days">30 Days</option>
              </select>
            </div>

            {/* Sorting Control */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Sort By
              </label>
              <select
                className="ci-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="Most Recent">Most Recent</option>
                <option value="Highest Priority">Highest Priority</option>
                <option value="Most Historical Evidence">Most Evidence</option>
              </select>
            </div>

            {/* Search Input */}
            <div style={{ minWidth: '220px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Search Alerts
              </label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={14}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="ci-input"
                  style={{ paddingLeft: '2.25rem', fontSize: '0.82rem' }}
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Action Row: Showing Count, Mark All as Read, Reset Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.35rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Showing <strong style={{ color: '#FFFFFF' }}>{filteredAlerts.length}</strong> of {alerts.length} signals
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38BDF8',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <CheckCheck size={13} />
                  <span>Mark All as Read</span>
                </button>
              )}

              {isFiltered && (
                <button
                  onClick={handleResetFilters}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. Alert List Feed */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <EmptyState
            title={statusFilter === 'Unread' && unreadCount === 0 ? "You're all caught up." : "No alerts found"}
            description={statusFilter === 'Unread' && unreadCount === 0 ? "No new competitive signals require attention." : "Try changing your filters or search criteria."}
            actionLabel="Reset Alert Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredAlerts.map((alert) => {
              const priStyle = getPriorityStyle(alert.priority);
              const typeMeta = getTypeMeta(alert.type);
              const TypeIcon = typeMeta.icon;

              return (
                <div
                  key={alert.id}
                  className="ci-card"
                  onClick={() => setSelectedAlert(alert)}
                  style={{
                    padding: '1.25rem 1.45rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    borderLeft: alert.read ? '1px solid var(--border-subtle)' : `3px solid ${priStyle.color}`,
                    borderColor: alert.read ? 'var(--border-subtle)' : undefined,
                    background: alert.read ? 'rgba(7, 11, 27, 0.55)' : 'var(--bg-card)',
                    opacity: alert.read ? 0.85 : 1,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, opacity 0.15s ease, background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = alert.read ? '0.85' : '1';
                    e.currentTarget.style.borderColor = alert.read ? 'var(--border-subtle)' : priStyle.border;
                  }}
                >
                  {/* Top Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      
                      {/* Unread Glowing Dot */}
                      {!alert.read && (
                        <Tooltip content="Unread signal requiring review">
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: priStyle.color,
                              boxShadow: `0 0 8px ${priStyle.color}`,
                              display: 'inline-block'
                            }}
                          />
                        </Tooltip>
                      )}

                      {/* Priority Indicator Pill */}
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: priStyle.color,
                          background: priStyle.bg,
                          border: `1px solid ${priStyle.border}`,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px'
                        }}
                      >
                        {priStyle.label}
                      </span>

                      {/* Competitor Name Pill */}
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '4px'
                        }}
                      >
                        {alert.competitor}
                      </span>

                      {/* Alert Type Badge */}
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: typeMeta.color,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <TypeIcon size={12} color={typeMeta.color} />
                        {typeMeta.label}
                      </span>
                    </div>

                    {/* Timestamp & Historical Evidence Count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: '#38BDF8',
                          background: 'rgba(0, 210, 255, 0.08)',
                          border: '1px solid rgba(0, 210, 255, 0.2)',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}
                      >
                        {alert.historicalEvidenceCount} related events
                      </span>

                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {alert.detectedDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      style={{
                        fontSize: '1.02rem',
                        fontWeight: 700,
                        color: alert.read ? '#CBD5E1' : '#FFFFFF',
                        letterSpacing: '-0.01em',
                        lineHeight: 1.3
                      }}
                    >
                      {alert.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.3rem',
                        lineHeight: 1.45
                      }}
                    >
                      {alert.description}
                    </p>
                  </div>

                  {/* Why It Matters Callout Snippet */}
                  <div
                    style={{
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(3, 7, 18, 0.6)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.78rem'
                    }}
                  >
                    <Info size={13} color="#00D2FF" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#E2E8F0', lineHeight: 1.4 }}>
                      <strong style={{ color: '#38BDF8' }}>Why it matters: </strong>
                      {alert.whyItMatters}
                    </span>
                  </div>

                  {/* Action Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.65rem',
                      paddingTop: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/insights');
                        }}
                        icon={<Sparkles size={13} />}
                      >
                        View Insight
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/timeline');
                        }}
                        icon={<ExternalLink size={13} />}
                      >
                        View Timeline
                      </Button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <button
                        onClick={(e) => handleToggleRead(alert.id, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: alert.read ? 'var(--text-muted)' : '#38BDF8',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.4rem'
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>{alert.read ? 'Mark as Unread' : 'Mark as Read'}</span>
                      </button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlert(alert);
                        }}
                        icon={<Eye size={13} />}
                      >
                        Inspect Details
                      </Button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* 5. Alert Details Modal / Drawer */}
        {selectedAlert && (
          <Modal
            isOpen={!!selectedAlert}
            onClose={() => setSelectedAlert(null)}
            title={selectedAlert.title}
            subtitle={`${selectedAlert.competitor} • Detected ${selectedAlert.detectedDisplay}`}
            footer={
              <>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedAlert(null)}
                >
                  Close
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedAlert(null);
                    navigate('/timeline');
                  }}
                  icon={<ExternalLink size={14} />}
                >
                  View Timeline
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedAlert(null);
                    navigate('/insights');
                  }}
                  icon={<Sparkles size={14} />}
                >
                  View Full Insight
                </Button>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Alert Header Metadata Box */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.65rem',
                  padding: '0.75rem',
                  background: 'rgba(3, 7, 18, 0.7)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Competitor
                  </span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.1rem' }}>
                    {selectedAlert.competitor}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Alert Type
                  </span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38BDF8', marginTop: '0.1rem' }}>
                    {(selectedAlert.type || 'pattern').toUpperCase()}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Historical Evidence
                  </span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#C084FC', marginTop: '0.1rem' }}>
                    {selectedAlert.historicalEvidenceCount || 0} events
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Alert Summary
                </span>
                <p style={{ fontSize: '0.86rem', color: '#F1F5F9', marginTop: '0.25rem', lineHeight: 1.45 }}>
                  {selectedAlert.description}
                </p>
              </div>

              {/* WHY IT MATTERS (Critical Section) */}
              <div
                style={{
                  padding: '0.9rem 1.05rem',
                  background: 'rgba(0, 210, 255, 0.06)',
                  border: '1px solid rgba(0, 210, 255, 0.22)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <Info size={13} color="#00D2FF" />
                  <span>Why It Matters</span>
                </div>
                <p style={{ fontSize: '0.83rem', color: '#E2E8F0', lineHeight: 1.45 }}>
                  {selectedAlert.whyItMatters}
                </p>
              </div>

              {/* Related Events Flow */}
              {Array.isArray(selectedAlert.relatedEventsSequence) && selectedAlert.relatedEventsSequence.length > 0 && (
                <div
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(7, 13, 36, 0.75)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Related Historical Sequence
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedAlert.relatedEventsSequence.map((evItem, evIdx) => (
                      <React.Fragment key={evIdx}>
                        {evIdx > 0 && <span style={{ color: '#00D2FF', fontSize: '0.75rem', fontWeight: 700 }}>→</span>}
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-subtle)',
                            color: evIdx === 0 ? '#FB7185' : evIdx === 1 ? '#00D2FF' : '#C084FC'
                          }}
                        >
                          {evItem}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* OBSERVATION vs INTERPRETATION vs POSSIBLE SIGNAL */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  padding: '0.85rem',
                  background: 'rgba(3, 7, 18, 0.65)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {selectedAlert.observationFact && (
                  <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>OBSERVATION: </strong>
                    {selectedAlert.observationFact}
                  </div>
                )}

                {selectedAlert.interpretation && (
                  <div style={{ fontSize: '0.78rem', color: '#38BDF8', lineHeight: 1.4 }}>
                    <strong style={{ color: '#00D2FF' }}>INTERPRETATION: </strong>
                    {selectedAlert.interpretation}
                  </div>
                )}

                {selectedAlert.possibleSignal && (
                  <div style={{ fontSize: '0.78rem', color: '#C4B5FD', lineHeight: 1.4 }}>
                    <strong style={{ color: '#A855F7' }}>POSSIBLE SIGNAL: </strong>
                    {selectedAlert.possibleSignal}
                  </div>
                )}
              </div>

            </div>
          </Modal>
        )}

      </div>
    </PageContainer>
  );
};

export default AlertsView;
