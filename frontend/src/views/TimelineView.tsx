import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import KPICard from '../components/ui/KPICard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { mockTimelineSummary, mockTimelineEvents } from '../mock/mockTimelineData';
import { timelineApi } from '../services/timelineApi';
import { TimelineEvent } from '../types';
import {
  Clock,
  Building2,
  Globe,
  GitMerge,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowDown,
  DollarSign,
  Layers,
  Users,
  Megaphone,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const TimelineView: React.FC = () => {
  const navigate = useNavigate();

  // Filter States
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('All Competitors');
  const [selectedType, setSelectedType] = useState<string>('All Activity');
  const [selectedImportance, setSelectedImportance] = useState<string>('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('6 Months');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data States connected to API
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(mockTimelineEvents);
  const [summaryStats, setSummaryStats] = useState(mockTimelineSummary);

  useEffect(() => {
    let isMounted = true;
    timelineApi.getTimelineEvents().then((events) => {
      if (isMounted && events && events.length > 0) {
        setTimelineEvents(events);
      }
    });
    timelineApi.getTimelineSummaryStats().then((stats) => {
      if (isMounted && stats) {
        setSummaryStats(stats);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Expansion and Modal States
  const [expandedEventIds, setExpandedEventIds] = useState<Record<string, boolean>>({
    'ev-sep28-a': true, // Expanded by default to showcase historical context immediately
  });
  const [selectedModalEvent, setSelectedModalEvent] = useState<TimelineEvent | null>(null);

  // Toggle single card expansion
  const toggleExpand = (id: string) => {
    setExpandedEventIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedCompetitor('All Competitors');
    setSelectedType('All Activity');
    setSelectedImportance('All');
    setSelectedTimeRange('6 Months');
    setSearchQuery('');
  };

  const isFiltered =
    selectedCompetitor !== 'All Competitors' ||
    selectedType !== 'All Activity' ||
    selectedImportance !== 'All' ||
    selectedTimeRange !== '6 Months' ||
    searchQuery.trim() !== '';

  // Filter computation logic covering 6-month mock window
  const filteredEvents = useMemo(() => {
    // Reference date: end of September 2026
    const refDate = new Date('2026-09-30T23:59:59Z').getTime();

    return timelineEvents.filter(ev => {
      // 1. Competitor Filter
      if (selectedCompetitor !== 'All Competitors' && ev.competitor !== selectedCompetitor) {
        return false;
      }

      // 2. Activity Type Filter
      if (selectedType !== 'All Activity' && ev.type !== selectedType) {
        return false;
      }

      // 3. Importance Filter
      if (selectedImportance !== 'All' && ev.importance.toLowerCase() !== selectedImportance.toLowerCase()) {
        return false;
      }

      // 4. Time Range Filter (7 Days, 30 Days, 3 Months, 6 Months)
      const evTime = new Date(ev.timestamp).getTime();
      const diffDays = (refDate - evTime) / (1000 * 60 * 60 * 24);

      if (selectedTimeRange === '7 Days' && diffDays > 7) {
        return false;
      }
      if (selectedTimeRange === '30 Days' && diffDays > 30) {
        return false;
      }
      if (selectedTimeRange === '3 Months' && diffDays > 92) {
        return false;
      }
      if (selectedTimeRange === '6 Months' && diffDays > 185) {
        return false;
      }

      // 5. Search Filter (Competitor name, Activity type, Title, Description, Source)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inComp = ev.competitor.toLowerCase().includes(query);
        const inType = ev.type.toLowerCase().includes(query);
        const inTitle = ev.title.toLowerCase().includes(query);
        const inDesc = ev.description.toLowerCase().includes(query);
        const inFullDesc = ev.fullDescription?.toLowerCase().includes(query) ?? false;
        const inSource = ev.source.toLowerCase().includes(query);

        if (!inComp && !inType && !inTitle && !inDesc && !inFullDesc && !inSource) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCompetitor, selectedType, selectedImportance, selectedTimeRange, searchQuery]);

  // Helper for type-based icon & color
  const getTypeStyling = (type: string) => {
    switch (type) {
      case 'Pricing':
        return {
          icon: DollarSign,
          color: '#00D2FF',
          bg: 'rgba(0, 210, 255, 0.1)',
          border: 'rgba(0, 210, 255, 0.25)',
          badgeClass: 'badge-pricing'
        };
      case 'Product':
        return {
          icon: Layers,
          color: '#38BDF8',
          bg: 'rgba(56, 189, 248, 0.1)',
          border: 'rgba(56, 189, 248, 0.25)',
          badgeClass: 'badge-product'
        };
      case 'Hiring':
        return {
          icon: Users,
          color: '#818CF8',
          bg: 'rgba(129, 140, 248, 0.1)',
          border: 'rgba(129, 140, 248, 0.25)',
          badgeClass: 'badge-hiring'
        };
      case 'Marketing':
        return {
          icon: Megaphone,
          color: '#C084FC',
          bg: 'rgba(192, 132, 252, 0.1)',
          border: 'rgba(192, 132, 252, 0.25)',
          badgeClass: 'badge-funding'
        };
      case 'Website':
      default:
        return {
          icon: Globe,
          color: '#94A3B8',
          bg: 'rgba(148, 163, 184, 0.1)',
          border: 'rgba(148, 163, 184, 0.25)',
          badgeClass: 'badge-other'
        };
    }
  };

  // Importance badge style
  const getImportanceBadge = (importance: string) => {
    switch (importance.toLowerCase()) {
      case 'high':
        return {
          label: 'High',
          className: 'badge-sev-high',
          dotColor: '#F59E0B'
        };
      case 'medium':
        return {
          label: 'Medium',
          className: 'badge-sev-medium',
          dotColor: '#3B82F6'
        };
      case 'low':
      default:
        return {
          label: 'Low',
          className: 'badge-sev-low',
          dotColor: '#94A3B8'
        };
    }
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* 1. Page Header Bar with Subtle Date Range Indicator */}
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
              Historical Timeline
            </h1>
            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                marginTop: '0.25rem',
                lineHeight: 1.4
              }}
            >
              Explore competitor activity and historical events across your competitive landscape.
            </p>
          </div>

          {/* Right side subtle date range indicator */}
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
              fontWeight: 600,
            }}
          >
            <Calendar size={13} color="#00D2FF" />
            <span>Last 6 months</span>
          </div>
        </div>

        {/* 2. Timeline Summary Metrics (Matching Dashboard KPI cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          <KPICard
            stat={{
              id: 'stat-total-events',
              label: 'Total Events',
              value: summaryStats.totalEvents,
              subtext: 'Recorded over 6 months',
              category: 'signals',
            }}
            icon={<Clock size={16} />}
          />
          <KPICard
            stat={{
              id: 'stat-competitors',
              label: 'Competitors',
              value: summaryStats.totalCompetitors,
              subtext: 'Tracked landscape entities',
              category: 'competitors',
            }}
            icon={<Building2 size={16} />}
          />
          <KPICard
            stat={{
              id: 'stat-sources',
              label: 'Sources',
              value: summaryStats.totalSources,
              subtext: 'Websites, pricing & job feeds',
              category: 'memory',
            }}
            icon={<Globe size={16} />}
          />
          <KPICard
            stat={{
              id: 'stat-patterns',
              label: 'Detected Patterns',
              value: summaryStats.detectedPatterns,
              subtext: 'Historical pattern sequences',
              category: 'threats',
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
          {/* Top Filter Bar Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem' }}>
            
            {/* Competitor Dropdown */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Competitor
              </label>
              <select
                className="ci-select"
                value={selectedCompetitor}
                onChange={(e) => setSelectedCompetitor(e.target.value)}
              >
                <option value="All Competitors">All Competitors</option>
                <option value="Competitor A">Competitor A</option>
                <option value="Competitor B">Competitor B</option>
                <option value="Competitor C">Competitor C</option>
                <option value="Competitor D">Competitor D</option>
              </select>
            </div>

            {/* Activity Type Dropdown */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Activity Type
              </label>
              <select
                className="ci-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="All Activity">All Activity</option>
                <option value="Pricing">Pricing</option>
                <option value="Product">Product</option>
                <option value="Hiring">Hiring</option>
                <option value="Marketing">Marketing</option>
                <option value="Website">Website</option>
              </select>
            </div>

            {/* Importance Dropdown */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Importance
              </label>
              <select
                className="ci-select"
                value={selectedImportance}
                onChange={(e) => setSelectedImportance(e.target.value)}
              >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Time Range Dropdown */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Time Range
              </label>
              <select
                className="ci-select"
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="7 Days">7 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div style={{ minWidth: '220px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Search Activity
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
                  placeholder="Search activity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Filter Status Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.35rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Showing <strong style={{ color: '#FFFFFF' }}>{filteredEvents.length}</strong> of {mockTimelineEvents.length} timeline events
            </span>

            {isFiltered && (
              <button
                onClick={handleResetFilters}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38BDF8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px',
                }}
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Professional Vertical Timeline */}
        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No matching activity found"
            description="Try adjusting your filters or search."
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div
            style={{
              position: 'relative',
              paddingLeft: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            {/* Subtle Vertical Timeline Axis Line */}
            <div
              style={{
                position: 'absolute',
                left: '11px',
                top: '12px',
                bottom: '24px',
                width: '2px',
                background: 'linear-gradient(180deg, #00D2FF 0%, #3B82F6 30%, #8B5CF6 70%, rgba(139, 92, 246, 0.15) 100%)',
                opacity: 0.6
              }}
            />

            {filteredEvents.map((ev) => {
              const isExpanded = !!expandedEventIds[ev.id];
              const styling = getTypeStyling(ev.type);
              const impBadge = getImportanceBadge(ev.importance);
              const IconComponent = styling.icon;

              return (
                <div
                  key={ev.id}
                  style={{
                    position: 'relative',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {/* Timeline Event Node Marker */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-2.25rem',
                      top: '16px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--bg-card)',
                      border: `2px solid ${styling.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: `0 0 10px ${styling.color}33`
                    }}
                  >
                    <IconComponent size={12} color={styling.color} />
                  </div>

                  {/* Timeline Card Container */}
                  <div
                    className="ci-card"
                    style={{
                      padding: '1.25rem 1.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      borderColor: isExpanded ? styling.border : 'var(--border-subtle)',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    {/* Header Row: Date/Time, Competitor, Type, Importance, Expand Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {/* Competitor Pill */}
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {ev.competitor}
                        </span>

                        {/* Activity Type Badge */}
                        <span className={`badge-category ${styling.badgeClass}`}>
                          {ev.type}
                        </span>

                        {/* Importance Badge */}
                        <span className={`badge-category ${impBadge.className}`}>
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: impBadge.dotColor,
                              display: 'inline-block'
                            }}
                          />
                          {impBadge.label}
                        </span>
                      </div>

                      {/* Timestamp & Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          <Clock size={12} />
                          <span>{ev.dateDisplay} • {ev.timeDisplay}</span>
                        </div>

                        <button
                          onClick={() => toggleExpand(ev.id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.2rem 0.4rem',
                            gap: '0.25rem',
                            fontSize: '0.72rem',
                            transition: 'color 0.15s ease, border-color 0.15s ease'
                          }}
                          aria-label={isExpanded ? 'Collapse event' : 'Expand event'}
                        >
                          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Headline Title and Short Description */}
                    <div>
                      <h3
                        style={{
                          fontSize: '0.98rem',
                          fontWeight: 700,
                          color: '#F8FAFC',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.3
                        }}
                      >
                        {ev.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          marginTop: '0.25rem',
                          lineHeight: 1.45
                        }}
                      >
                        {ev.description}
                      </p>
                    </div>

                    {/* Source Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <span>Source:</span>
                      <span
                        style={{
                          color: '#94A3B8',
                          background: 'rgba(255, 255, 255, 0.04)',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <ExternalLink size={11} color="var(--text-muted)" />
                        {ev.source}
                      </span>
                    </div>

                    {/* EXPANDED STATE CONTENT */}
                    {isExpanded && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                          paddingTop: '0.85rem',
                          marginTop: '0.35rem',
                          borderTop: '1px solid var(--border-subtle)'
                        }}
                      >
                        {/* Full Observation Narrative */}
                        {ev.fullDescription && (
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Detailed Observation
                            </span>
                            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.45 }}>
                              {ev.fullDescription}
                            </p>
                          </div>
                        )}

                        {/* Detected Changes List */}
                        {ev.detectedChanges && ev.detectedChanges.length > 0 && (
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Detected Surface Changes
                            </span>
                            <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {ev.detectedChanges.map((change, idx) => (
                                <li key={idx} style={{ fontSize: '0.8rem', color: '#E2E8F0', lineHeight: 1.35 }}>
                                  {change}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* HISTORICAL CONTEXT SECTION (Core Feature) */}
                        {ev.historicalContext && (
                          <div
                            style={{
                              background: 'rgba(7, 13, 36, 0.85)',
                              border: '1px solid rgba(0, 210, 255, 0.22)',
                              borderRadius: 'var(--radius-md)',
                              padding: '1rem 1.15rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <Clock size={15} color="#00D2FF" />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38BDF8', letterSpacing: '0.01em' }}>
                                  Historical Context
                                </span>
                              </div>

                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  color: '#C4B5FD',
                                  background: 'rgba(139, 92, 246, 0.12)',
                                  border: '1px solid rgba(139, 92, 246, 0.28)',
                                  padding: '0.12rem 0.5rem',
                                  borderRadius: '12px',
                                  fontWeight: 600
                                }}
                              >
                                {ev.historicalContext.summary}
                              </span>
                            </div>

                            {/* Visual Historical Sequence Stepper */}
                            {ev.historicalContext.sequence && ev.historicalContext.sequence.length > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.35rem',
                                  padding: '0.65rem 0.85rem',
                                  background: 'rgba(3, 7, 18, 0.7)',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-subtle)',
                                  marginTop: '0.2rem'
                                }}
                              >
                                {ev.historicalContext.sequence.map((step, sIdx) => (
                                  <React.Fragment key={sIdx}>
                                    {sIdx > 0 && (
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.4rem',
                                          margin: '0.1rem 0 0.1rem 1.25rem',
                                          color: '#38BDF8',
                                          fontSize: '0.72rem',
                                          fontWeight: 600
                                        }}
                                      >
                                        <ArrowDown size={13} color="#00D2FF" />
                                        <span>{step.daysOffset ? `${step.daysOffset} days` : 'Follow-on move'}</span>
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                                      <div
                                        style={{
                                          width: '10px',
                                          height: '10px',
                                          borderRadius: '50%',
                                          background: sIdx === 0 ? 'var(--gradient-brand)' : 'rgba(255, 255, 255, 0.2)',
                                          border: sIdx === 0 ? '1px solid #00D2FF' : '1px solid var(--border-subtle)',
                                          flexShrink: 0
                                        }}
                                      />
                                      <span
                                        style={{
                                          fontSize: '0.78rem',
                                          fontWeight: sIdx === 0 ? 700 : 500,
                                          color: sIdx === 0 ? '#FFFFFF' : 'var(--text-secondary)'
                                        }}
                                      >
                                        {step.label}
                                      </span>
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            )}

                            {/* Detected Pattern Sequence Statement */}
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Sparkles size={12} color="#C084FC" />
                              <span>
                                Similar sequence detected <strong style={{ color: '#FFFFFF' }}>{ev.historicalContext.similarCount} times</strong> previously.
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedModalEvent(ev)}
                          >
                            View Related Events
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedModalEvent(ev)}
                          >
                            Inspect Details
                          </Button>

                          <button
                            onClick={() => navigate('/insights')}
                            className="btn-brand-primary"
                            style={{
                              marginLeft: 'auto',
                              fontSize: '0.78rem',
                              padding: '0.4rem 0.85rem'
                            }}
                          >
                            <span>View AI Insight</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Event Details Modal / Panel */}
        {selectedModalEvent && (
          <Modal
            isOpen={!!selectedModalEvent}
            onClose={() => setSelectedModalEvent(null)}
            title={`${selectedModalEvent.competitor} — ${selectedModalEvent.title}`}
            subtitle={`Observed on ${selectedModalEvent.dateDisplay} at ${selectedModalEvent.timeDisplay}`}
            footer={
              <>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedModalEvent(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedModalEvent(null);
                    navigate('/insights');
                  }}
                  icon={<Sparkles size={14} />}
                >
                  View AI Insight
                </Button>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {/* Event Attributes Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  background: 'rgba(3, 7, 18, 0.7)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Competitor
                  </span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.1rem' }}>
                    {selectedModalEvent.competitor}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Event Type
                  </span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#38BDF8', marginTop: '0.1rem' }}>
                    {selectedModalEvent.type}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Detected
                  </span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F8FAFC', marginTop: '0.1rem' }}>
                    {selectedModalEvent.dateDisplay} — {selectedModalEvent.timeDisplay}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Source
                  </span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#CBD5E1', marginTop: '0.1rem' }}>
                    {selectedModalEvent.source}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Description
                </span>
                <p style={{ fontSize: '0.86rem', color: '#E2E8F0', marginTop: '0.25rem', lineHeight: 1.45 }}>
                  {selectedModalEvent.fullDescription || selectedModalEvent.description}
                </p>
              </div>

              {/* Historical Evidence & Related Activity Flow */}
              {selectedModalEvent.historicalContext && (
                <div
                  style={{
                    padding: '0.9rem',
                    background: 'rgba(7, 13, 36, 0.85)',
                    border: '1px solid rgba(0, 210, 255, 0.22)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#38BDF8' }}>
                      Historical Evidence
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#C4B5FD', fontWeight: 600 }}>
                      {selectedModalEvent.historicalContext.similarCount} similar events
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {selectedModalEvent.historicalContext.summary}
                  </p>

                  {/* Flow Steps */}
                  {selectedModalEvent.historicalContext.sequence && (
                    <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                        Related Activity Flow
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          background: 'rgba(3, 7, 18, 0.6)',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px'
                        }}
                      >
                        {selectedModalEvent.historicalContext.sequence.map((step, sIdx) => (
                          <div key={sIdx}>
                            {sIdx > 0 && (
                              <div style={{ margin: '0.1rem 0 0.1rem 0.5rem', color: '#00D2FF', fontSize: '0.7rem' }}>
                                ↓ {step.daysOffset ? `${step.daysOffset} days` : ''}
                              </div>
                            )}
                            <div style={{ fontSize: '0.78rem', fontWeight: sIdx === 0 ? 700 : 500, color: sIdx === 0 ? '#FFFFFF' : '#94A3B8' }}>
                              {step.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </Modal>
        )}

      </div>
    </PageContainer>
  );
};

export default TimelineView;
