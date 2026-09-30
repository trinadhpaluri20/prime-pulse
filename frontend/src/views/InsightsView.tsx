import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import KPICard from '../components/ui/KPICard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Tooltip from '../components/ui/Tooltip';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import {
  mockInsightsSummary,
  featuredInsight,
  mockInsightsList
} from '../mock/mockInsightsData';
import { insightsApi } from '../services/insightsApi';
import { AIInsightItem, AIInsightType } from '../types';
import {
  GitMerge,
  Layers,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  History,
  ArrowDown,
  Info,
  ExternalLink
} from 'lucide-react';

export const InsightsView: React.FC = () => {
  const navigate = useNavigate();

  // Filters
  const [selectedType, setSelectedType] = useState<string>('All Insights');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('All Competitors');
  const [selectedTime, setSelectedTime] = useState<string>('6 Months');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Evidence Modal
  const [evidenceModalInsight, setEvidenceModalInsight] = useState<AIInsightItem | null>(null);

  // Data States connected to API
  const [insightsList, setInsightsList] = useState<AIInsightItem[]>(mockInsightsList);
  const [summaryStats, setSummaryStats] = useState(mockInsightsSummary);
  const [featured, setFeatured] = useState<AIInsightItem>(featuredInsight);

  useEffect(() => {
    let isMounted = true;
    insightsApi.getInsights().then((data) => {
      if (isMounted && data && data.length > 0) {
        setInsightsList(data);
        const feat = data.find((i) => i.isFeatured) || data[0];
        if (feat) setFeatured(feat);
      }
    });
    insightsApi.getInsightsSummaryStats().then((stats) => {
      if (isMounted && stats) setSummaryStats(stats);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenEvidence = async (insight: AIInsightItem) => {
    if (!insight.evidenceDetails) {
      try {
        const details = await insightsApi.getInsightEvidence(insight.id);
        if (details) {
          setEvidenceModalInsight({ ...insight, evidenceDetails: details });
          return;
        }
      } catch (err) {
        console.warn('[InsightsView] Failed to fetch dynamic evidence:', err);
      }
    }
    setEvidenceModalInsight(insight);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedType('All Insights');
    setSelectedCompetitor('All Competitors');
    setSelectedTime('6 Months');
    setSearchQuery('');
  };

  const isFiltered =
    selectedType !== 'All Insights' ||
    selectedCompetitor !== 'All Competitors' ||
    selectedTime !== '6 Months' ||
    searchQuery.trim() !== '';

  // Filter Computation
  const filteredInsights = useMemo(() => {
    return insightsList.filter((item) => {
      // 1. Type Filter
      if (selectedType !== 'All Insights') {
        const typeMap: Record<string, AIInsightType> = {
          'Patterns': 'pattern',
          'Trends': 'trend',
          'Unusual Activity': 'unusual',
          'Historical Matches': 'historical'
        };
        const targetType = typeMap[selectedType];
        if (targetType && item.type !== targetType) return false;
      }

      // 2. Competitor Filter
      if (selectedCompetitor !== 'All Competitors' && item.competitor !== selectedCompetitor) {
        return false;
      }

      // 3. Time Filter
      if (selectedTime === '30 Days' && item.timeframeDays > 30) return false;
      if (selectedTime === '3 Months' && item.timeframeDays > 90) return false;
      if (selectedTime === '6 Months' && item.timeframeDays > 180) return false;

      // 4. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inComp = item.competitor.toLowerCase().includes(q);
        const inFlow = item.detectedPatternFlow?.some(p => p.toLowerCase().includes(q)) ?? false;
        if (!inTitle && !inDesc && !inComp && !inFlow) return false;
      }

      return true;
    });
  }, [selectedType, selectedCompetitor, selectedTime, searchQuery]);

  // Helper for Type Styling & Badges
  const getTypeMeta = (type: AIInsightType) => {
    switch (type) {
      case 'pattern':
        return {
          label: 'Pattern Detected',
          icon: GitMerge,
          color: '#00D2FF',
          bg: 'rgba(0, 210, 255, 0.1)',
          border: 'rgba(0, 210, 255, 0.25)',
        };
      case 'trend':
        return {
          label: 'Trend Detected',
          icon: TrendingUp,
          color: '#38BDF8',
          bg: 'rgba(56, 189, 248, 0.1)',
          border: 'rgba(56, 189, 248, 0.25)',
        };
      case 'unusual':
        return {
          label: 'Unusual Activity',
          icon: Flame,
          color: '#FB7185',
          bg: 'rgba(251, 113, 133, 0.1)',
          border: 'rgba(251, 113, 133, 0.25)',
        };
      case 'historical':
      default:
        return {
          label: 'Historical Match',
          icon: History,
          color: '#C084FC',
          bg: 'rgba(192, 132, 252, 0.1)',
          border: 'rgba(192, 132, 252, 0.25)',
        };
    }
  };

  // Helper for Priority Styling
  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return {
          label: 'High Priority',
          color: '#FBBF24',
          bg: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.28)'
        };
      case 'medium':
        return {
          label: 'Medium Priority',
          color: '#38BDF8',
          bg: 'rgba(56, 189, 248, 0.1)',
          border: 'rgba(56, 189, 248, 0.28)'
        };
      case 'low':
      default:
        return {
          label: 'Low Priority',
          color: '#94A3B8',
          bg: 'rgba(148, 163, 184, 0.1)',
          border: 'rgba(148, 163, 184, 0.28)'
        };
    }
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* 1. Page Header with Subtle Intelligence Status */}
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
              AI Insights
            </h1>
            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                marginTop: '0.25rem',
                lineHeight: 1.4
              }}
            >
              Discover patterns and signals hidden within historical competitor activity.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.45rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <Sparkles size={12} color="#00D2FF" />
              <span>Analysis based on historical competitor activity</span>
            </div>
          </div>

          {/* Right Status Indicator */}
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
            <span>Intelligence Analysis Active</span>
          </div>
        </div>

        {/* 2. Top Summary Metrics (4 Compact Intelligence Metrics matching Dashboard KPI cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          <KPICard
            stat={{
              id: 'stat-patterns-detected',
              label: 'Patterns Detected',
              value: summaryStats.patternsDetected,
              subtext: 'Across 6-month window',
              category: 'threats'
            }}
            icon={<GitMerge size={16} />}
          />
          <KPICard
            stat={{
              id: 'stat-historical-matches',
              label: 'Historical Matches',
              value: summaryStats.historicalMatches,
              subtext: 'Precedent sequences linked',
              category: 'memory'
            }}
            icon={<Layers size={16} />}
          />
          <KPICard
            stat={{
              id: 'stat-active-signals',
              label: 'Active Signals',
              value: summaryStats.activeSignals,
              subtext: 'Trailing 30-day indicators',
              category: 'signals'
            }}
            icon={<Clock size={16} />}
          />
          <KPICard
            stat={{
              id: 'stat-average-confidence',
              label: 'Average Confidence',
              value: `${summaryStats.averageConfidence}%`,
              subtext: 'Based on supporting evidence',
              category: 'competitors'
            }}
            icon={<TrendingUp size={16} />}
          />
        </div>

        {/* 3. Featured AI Insight Card */}
        <div
          className="ci-card"
          style={{
            padding: '1.5rem 1.6rem',
            background: 'linear-gradient(135deg, rgba(8, 13, 33, 0.95) 0%, rgba(13, 20, 52, 0.9) 100%)',
            border: '1px solid rgba(0, 210, 255, 0.35)',
            boxShadow: '0 8px 30px rgba(0, 210, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.15rem'
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#00D2FF',
                  background: 'rgba(0, 210, 255, 0.12)',
                  border: '1px solid rgba(0, 210, 255, 0.3)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '16px'
                }}
              >
                <Sparkles size={12} color="#00D2FF" />
                Featured Insight
              </span>

              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {featuredInsight.competitor}
              </span>
            </div>

            {/* Confidence & Evidence Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Evidence: <strong style={{ color: '#E2E8F0' }}>{featuredInsight.evidenceCount} related events</strong>
              </span>

              {/* Confidence Ring Display */}
              <Tooltip content="Confidence reflects the strength and recurrence of supporting historical evidence.">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '16px',
                    background: 'rgba(0, 210, 255, 0.1)',
                    border: '1px solid rgba(0, 210, 255, 0.25)',
                    cursor: 'help'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38BDF8' }}>
                    {featuredInsight.confidence}%
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Confidence
                  </span>
                  <Info size={11} color="#38BDF8" />
                </div>
              </Tooltip>
            </div>
          </div>

          {/* Title & Insight Description */}
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.015em',
                lineHeight: 1.3
              }}
            >
              {featuredInsight.title}
            </h2>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                marginTop: '0.4rem',
                lineHeight: 1.5,
                maxWidth: '900px'
              }}
            >
              {featuredInsight.description}
            </p>
          </div>

          {/* Visual Pattern Flow Stepper (Cyan → Blue → Violet Connections) */}
          <div
            style={{
              padding: '0.9rem 1.15rem',
              background: 'rgba(3, 7, 18, 0.7)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              flexWrap: 'wrap'
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Pattern Sequence:
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#00D2FF',
                  background: 'rgba(0, 210, 255, 0.1)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 210, 255, 0.25)'
                }}
              >
                Pricing Change
              </span>

              <span style={{ color: '#38BDF8', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                → 8–14 Days →
              </span>

              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#38BDF8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(56, 189, 248, 0.25)'
                }}
              >
                Product Update
              </span>

              <span style={{ color: '#818CF8', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                → Follow-on →
              </span>

              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#C084FC',
                  background: 'rgba(192, 132, 252, 0.1)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(192, 132, 252, 0.25)'
                }}
              >
                Marketing Activity
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Historical Context: <strong style={{ color: '#CBD5E1' }}>2 previous matches confirmed</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/timeline')}
              >
                View Timeline Event
              </Button>

              <button
                className="btn-brand-primary"
                onClick={() => handleOpenEvidence(featured)}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.45rem 1rem'
                }}
              >
                <span>View Evidence</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Professional Clean Filter Bar */}
        <div
          className="ci-card"
          style={{
            padding: '1.25rem 1.35rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
            
            {/* Type Filter */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Insight Type
              </label>
              <select
                className="ci-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="All Insights">All Insights</option>
                <option value="Patterns">Patterns</option>
                <option value="Trends">Trends</option>
                <option value="Unusual Activity">Unusual Activity</option>
                <option value="Historical Matches">Historical Matches</option>
              </select>
            </div>

            {/* Competitor Filter */}
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
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Timeframe
              </label>
              <select
                className="ci-select"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="30 Days">30 Days</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
              </select>
            </div>

            {/* Search Input */}
            <div style={{ minWidth: '220px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Search Insights
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
                  placeholder="Search insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Status Strip & Reset Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.35rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Showing <strong style={{ color: '#FFFFFF' }}>{filteredInsights.length}</strong> of {mockInsightsList.length} intelligence signals
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
                  borderRadius: '4px'
                }}
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. Insight Cards Feed */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            <SkeletonCard rows={3} />
            <SkeletonCard rows={3} />
            <SkeletonCard rows={3} />
          </div>
        ) : filteredInsights.length === 0 ? (
          <EmptyState
            title="No insights found"
            description="Try changing your filters or time range."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {filteredInsights.map((insight) => {
              const typeMeta = getTypeMeta(insight.type);
              const priMeta = getPriorityBadge(insight.priority);
              const TypeIcon = typeMeta.icon;

              return (
                <div
                  key={insight.id}
                  className="ci-card"
                  style={{
                    padding: '1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  {/* Top Meta Header: Type Badge, Priority Badge, Competitor */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: typeMeta.color,
                          background: typeMeta.bg,
                          border: `1px solid ${typeMeta.border}`,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <TypeIcon size={12} color={typeMeta.color} />
                        {typeMeta.label}
                      </span>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: priMeta.color,
                          background: priMeta.bg,
                          border: `1px solid ${priMeta.border}`,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px'
                        }}
                      >
                        {priMeta.label}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {insight.competitor}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#F8FAFC',
                        letterSpacing: '-0.01em',
                        lineHeight: 1.3
                      }}
                    >
                      {insight.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.35rem',
                        lineHeight: 1.45
                      }}
                    >
                      {insight.description}
                    </p>
                  </div>

                  {/* Pattern tags if present */}
                  {insight.detectedPatternFlow && insight.detectedPatternFlow.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {insight.detectedPatternFlow.map((flowItem, fIdx) => (
                        <span
                          key={fIdx}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.12rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-subtle)',
                            color: fIdx === 0 ? '#00D2FF' : fIdx === 1 ? '#38BDF8' : '#C084FC'
                          }}
                        >
                          {flowItem}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Confidence Bar & Supporting Evidence Count */}
                  <div
                    style={{
                      padding: '0.65rem 0.75rem',
                      background: 'rgba(3, 7, 18, 0.6)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tooltip content="Confidence reflects the strength and recurrence of supporting historical evidence.">
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}>
                          Confidence: <strong style={{ color: '#38BDF8' }}>{insight.confidence}%</strong>
                          <Info size={11} color="#38BDF8" />
                        </span>
                      </Tooltip>

                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Supporting: <strong style={{ color: '#E2E8F0' }}>{insight.evidenceCount} events</strong>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        width: '100%',
                        height: '4px',
                        borderRadius: '2px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${insight.confidence}%`,
                          height: '100%',
                          background: 'var(--gradient-brand)',
                          borderRadius: '2px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.35rem' }}>
                    <button
                      onClick={() => navigate('/timeline')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0',
                        transition: 'color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      <ExternalLink size={12} />
                      <span>View Timeline Event</span>
                    </button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEvidence(insight)}
                    >
                      View Evidence
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Insight Detail / Evidence View Modal */}
        {evidenceModalInsight && (
          <Modal
            isOpen={!!evidenceModalInsight}
            onClose={() => setEvidenceModalInsight(null)}
            title="Insight Evidence"
            subtitle={`${evidenceModalInsight.competitor} — ${evidenceModalInsight.title}`}
            footer={
              <>
                <Button
                  variant="secondary"
                  onClick={() => setEvidenceModalInsight(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEvidenceModalInsight(null);
                    navigate('/timeline');
                  }}
                  icon={<ExternalLink size={14} />}
                >
                  View Timeline Event
                </Button>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Confidence & Supporting Metrics Summary */}
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
                    Confidence
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38BDF8', marginTop: '0.1rem' }}>
                    {evidenceModalInsight.confidence}%
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Observed Events
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.1rem' }}>
                    {evidenceModalInsight.evidenceCount}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Historical Matches
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#C084FC', marginTop: '0.1rem' }}>
                    {evidenceModalInsight.historicalMatches}
                  </div>
                </div>
              </div>

              {/* Sequential Event Chain Flow Diagram */}
              {evidenceModalInsight.evidenceDetails && (
                <div
                  style={{
                    padding: '0.9rem 1.1rem',
                    background: 'rgba(7, 13, 36, 0.85)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(0, 210, 255, 0.22)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sequential Pattern Flow
                  </span>

                  {/* Stepper Chain */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'rgba(3, 7, 18, 0.6)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00D2FF', boxShadow: '0 0 6px #00D2FF' }} />
                      <span style={{ fontSize: '0.78rem', color: '#F8FAFC', fontWeight: 700 }}>
                        Current Event: {evidenceModalInsight.evidenceDetails.currentEvent.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                        {evidenceModalInsight.evidenceDetails.currentEvent.date}
                      </span>
                    </div>

                    {evidenceModalInsight.evidenceDetails.historicalSequence.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', margin: '0.15rem 0 0.15rem 1rem', color: '#38BDF8', fontSize: '0.7rem', fontWeight: 600 }}>
                          <ArrowDown size={12} color="#00D2FF" />
                          <span>{step.daysOffset ? `${step.daysOffset} days` : 'Precedent event'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.3)', border: '1px solid var(--border-subtle)' }} />
                          <span style={{ fontSize: '0.78rem', color: '#CBD5E1', fontWeight: 500 }}>
                            {step.label}
                          </span>
                          {step.date && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                              {step.date}
                            </span>
                          )}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <Sparkles size={12} color="#C084FC" />
                    <span>{evidenceModalInsight.evidenceDetails.similarSequenceStatement}</span>
                  </div>
                </div>
              )}

              {/* Critical Distinction: OBSERVED vs AI INTERPRETATION */}
              {evidenceModalInsight.evidenceDetails && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  
                  {/* OBSERVED FACTS */}
                  <div
                    style={{
                      padding: '0.85rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Observed Evidence
                    </span>
                    <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {evidenceModalInsight.evidenceDetails.observedFacts.map((fact, fIdx) => (
                        <li key={fIdx} style={{ fontSize: '0.8rem', color: '#E2E8F0', lineHeight: 1.4 }}>
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI INTERPRETATION */}
                  <div
                    style={{
                      padding: '0.85rem',
                      background: 'rgba(139, 92, 246, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(139, 92, 246, 0.28)'
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#C4B5FD', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      AI Interpretation
                    </span>
                    <p style={{ fontSize: '0.82rem', color: '#F1F5F9', marginTop: '0.25rem', lineHeight: 1.45 }}>
                      {evidenceModalInsight.evidenceDetails.aiInterpretation}
                    </p>
                  </div>

                  {/* WHY THIS MATTERS */}
                  <div
                    style={{
                      padding: '0.85rem',
                      background: 'rgba(0, 210, 255, 0.06)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(0, 210, 255, 0.2)'
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Why This Matters
                    </span>
                    <p style={{ fontSize: '0.82rem', color: '#E2E8F0', marginTop: '0.25rem', lineHeight: 1.45 }}>
                      {evidenceModalInsight.evidenceDetails.whyThisMatters}
                    </p>
                  </div>

                  {/* Historical Matches List */}
                  {evidenceModalInsight.evidenceDetails.historicalMatchesList.length > 0 && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Precedent Matches: </span>
                      {evidenceModalInsight.evidenceDetails.historicalMatchesList.join(' • ')}
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

export default InsightsView;
