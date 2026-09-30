import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import {
  mockDashboardKPIs,
  mockActivityChartData,
  mockDashboardIntelligenceBrief,
  mockRecentActivities,
  mockActiveAlertsPreview,
  mockHistoricalMemoryStats,
} from '../mock/dashboardMockData';
import { dashboardApi } from '../services/dashboardApi';
import {
  Building2,
  Activity,
  BrainCircuit,
  ShieldAlert,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Globe,
  Tag,
  Cpu,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<'6M' | '30D' | '7D'>('6M');
  const [kpis, setKpis] = useState(mockDashboardKPIs);
  const [chartData, setChartData] = useState(mockActivityChartData[timeframe]);
  const [brief, setBrief] = useState(mockDashboardIntelligenceBrief);
  const [memoryStats, setMemoryStats] = useState(mockHistoricalMemoryStats);

  useEffect(() => {
    let isMounted = true;
    dashboardApi.getDashboardSummary().then((data) => {
      if (isMounted && data) setKpis(data);
    });
    dashboardApi.getIntelligenceBrief().then((data) => {
      if (isMounted && data) setBrief(data);
    });
    dashboardApi.getHistoricalMemoryStats().then((data) => {
      if (isMounted && data) setMemoryStats(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    dashboardApi.getActivityChartData(timeframe).then((data) => {
      if (isMounted && data) setChartData(data);
    });
    return () => {
      isMounted = false;
    };
  }, [timeframe]);

  // Custom Chart Tooltip
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: '#0B122D',
            border: '1px solid rgba(0, 210, 255, 0.35)',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            minWidth: '220px',
          }}
        >
          <div
            style={{
              fontSize: '0.76rem',
              color: '#94A3B8',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '0.35rem',
            }}
          >
            Period: {label}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {payload.map((entry: any, index: number) => {
              const compKey = entry.dataKey as 'Competitor A' | 'Competitor B' | 'Competitor C';
              const change =
                compKey === 'Competitor A'
                  ? entry.payload.changeA
                  : compKey === 'Competitor B'
                  ? entry.payload.changeB
                  : entry.payload.changeC;

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: entry.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 600 }}>
                      {entry.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {entry.value} acts
                    </span>
                    {change && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#38BDF8',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {change}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* ==================================================
            SECTION 1 — KEY INTELLIGENCE METRICS
        ================================================== */}
        <section aria-label="Key Intelligence Metrics">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {kpis.map((kpi) => {
              const iconMap = {
                competitors: <Building2 size={17} color="#60A5FA" />,
                changes: <Activity size={17} color="#38BDF8" />,
                patterns: <BrainCircuit size={17} color="#C084FC" />,
                alerts: <ShieldAlert size={17} color="#FB7185" />,
              };

              const bgTintMap = {
                competitors: 'rgba(59, 130, 246, 0.1)',
                changes: 'rgba(0, 210, 255, 0.1)',
                patterns: 'rgba(139, 92, 246, 0.1)',
                alerts: 'rgba(244, 63, 94, 0.1)',
              };

              const borderTintMap = {
                competitors: 'rgba(59, 130, 246, 0.22)',
                changes: 'rgba(0, 210, 255, 0.22)',
                patterns: 'rgba(139, 92, 246, 0.22)',
                alerts: 'rgba(244, 63, 94, 0.22)',
              };

              return (
                <div
                  key={kpi.id}
                  className="ci-card"
                  style={{
                    padding: '1.25rem 1.4rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--text-secondary)',
                          display: 'block',
                        }}
                      >
                        {kpi.label}
                      </span>
                      <div
                        style={{
                          fontSize: '2rem',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          lineHeight: 1.15,
                          marginTop: '0.35rem',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {kpi.value}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-md)',
                        background: bgTintMap[kpi.category],
                        border: `1px solid ${borderTintMap[kpi.category]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {iconMap[kpi.category]}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: kpi.isPositiveChange ? '#38BDF8' : '#FB7185',
                        background: kpi.isPositiveChange ? 'rgba(56, 189, 248, 0.1)' : 'rgba(251, 113, 133, 0.1)',
                        padding: '0.12rem 0.4rem',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {kpi.changeIndicator}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {kpi.supportingText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================
            SECTION 2 — COMPETITIVE ACTIVITY (PRIMARY DATA VISUALIZATION)
        ================================================== */}
        <section aria-label="Competitive Activity Chart">
          <Card
            title="Competitive Activity"
            subtitle="Historical activity detected across your tracked competitors."
            icon={<Activity size={18} color="#00D2FF" />}
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {(['7D', '30D', '6M'] as const).map((filterKey) => {
                  const labelMap = { '7D': '7 Days', '30D': '30 Days', '6M': '6 Months' };
                  const isSelected = timeframe === filterKey;
                  return (
                    <button
                      key={filterKey}
                      onClick={() => setTimeframe(filterKey)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.76rem',
                        fontWeight: isSelected ? 700 : 500,
                        background: isSelected ? 'var(--gradient-btn)' : 'rgba(255, 255, 255, 0.04)',
                        border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {labelMap[filterKey]}
                    </button>
                  );
                })}
              </div>
            }
          >
            {/* Competitor Color Legend */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                marginBottom: '1.25rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.78rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#00D2FF' }} />
                <span style={{ color: '#F1F5F9', fontWeight: 600 }}>Competitor A</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Primary Tier)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#3B82F6' }} />
                <span style={{ color: '#F1F5F9', fontWeight: 600 }}>Competitor B</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Direct Competitor)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#8B5CF6' }} />
                <span style={{ color: '#F1F5F9', fontWeight: 600 }}>Competitor C</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Emerging Challenger)</span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div style={{ width: '100%', height: 320, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientCompA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D2FF" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientCompB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientCompC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis
                    dataKey="period"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip content={renderCustomTooltip} />

                  <Area
                    type="monotone"
                    dataKey="Competitor A"
                    stroke="#00D2FF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradientCompA)"
                    activeDot={{ r: 5, fill: '#00D2FF', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Competitor B"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradientCompB)"
                    activeDot={{ r: 5, fill: '#3B82F6', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Competitor C"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradientCompC)"
                    activeDot={{ r: 5, fill: '#8B5CF6', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* ==================================================
            SECTION 3 — AI INTELLIGENCE BRIEF (PROMINENT AI CARD)
        ================================================== */}
        <section aria-label="AI Intelligence Brief">
          <div
            className="ci-card"
            style={{
              padding: '1.75rem 2rem',
              background: 'linear-gradient(135deg, rgba(8, 13, 33, 0.95), rgba(15, 22, 54, 0.88))',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              boxShadow: '0 6px 24px rgba(139, 92, 246, 0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Header / Badges Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      background: 'rgba(0, 210, 255, 0.12)',
                      border: '1px solid rgba(0, 210, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00D2FF',
                    }}
                  >
                    <Sparkles size={14} />
                  </span>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      letterSpacing: '-0.015em',
                      margin: 0,
                    }}
                  >
                    {brief.title}
                  </h3>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {brief.supportingText}
                </p>
              </div>

              {/* Verified Status Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#38BDF8',
                    background: 'rgba(0, 210, 255, 0.1)',
                    border: '1px solid rgba(0, 210, 255, 0.25)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {brief.patternLabel}
                </span>

                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#C084FC',
                    background: 'rgba(139, 92, 246, 0.12)',
                    border: '1px solid rgba(139, 92, 246, 0.28)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                  }}
                >
                  {brief.confidenceScore}% Confidence
                </span>

                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#93C5FD',
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                  }}
                >
                  {brief.historicalEventsCount} Historical Events
                </span>
              </div>
            </div>

            {/* Synthesized Intelligence Text */}
            <div
              style={{
                background: 'rgba(4, 8, 23, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderLeft: '3px solid #00D2FF',
                borderRadius: '0 8px 8px 0',
                padding: '1rem 1.25rem',
                margin: '1rem 0 1.25rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.92rem',
                  color: '#F8FAFC',
                  lineHeight: 1.65,
                  margin: 0,
                  fontWeight: 450,
                }}
              >
                "{brief.intelligence}"
              </p>
            </div>

            {/* Footer Action */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingTop: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Deterministic cross-event pattern synthesized from verified competitor trajectory.
              </span>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/insights')}
                icon={<ArrowRight size={14} />}
              >
                View Insight →
              </Button>
            </div>
          </div>
        </section>

        {/* ==================================================
            SECTION 4 & SECTION 5 — RECENT ACTIVITY + ACTIVE ALERTS
        ================================================== */}
        <section
          aria-label="Recent Activity and Active Alerts"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* SECTION 4: RECENT ACTIVITY */}
          <Card
            title="Recent Activity"
            subtitle="Latest changes detected across your competitive landscape."
            icon={<Clock size={18} color="#00D2FF" />}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/timeline')}
                icon={<ArrowRight size={13} />}
              >
                View Timeline
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mockRecentActivities.map((act) => {
                const typeIcon =
                  act.type.toLowerCase().includes('pricing') ? (
                    <Tag size={12} color="#38BDF8" />
                  ) : act.type.toLowerCase().includes('website') ? (
                    <Globe size={12} color="#A78BFA" />
                  ) : (
                    <Cpu size={12} color="#60A5FA" />
                  );

                return (
                  <div
                    key={act.id}
                    style={{
                      padding: '0.85rem 1rem',
                      background: 'rgba(7, 11, 27, 0.65)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                          {act.competitor}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {typeIcon}
                          {act.type}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {act.timestamp}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {act.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* SECTION 5: ACTIVE ALERTS */}
          <Card
            title="Active Alerts"
            subtitle="Signals requiring attention."
            icon={<AlertTriangle size={18} color="#FB7185" />}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/alerts')}
                icon={<ArrowRight size={13} />}
              >
                View All Alerts →
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mockActiveAlertsPreview.map((alert) => {
                const isHigh = alert.severity === 'high';
                const isMedium = alert.severity === 'medium';

                const borderStyle = isHigh
                  ? 'rgba(244, 63, 94, 0.35)'
                  : isMedium
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(59, 130, 246, 0.25)';

                const bgStyle = isHigh
                  ? 'rgba(244, 63, 94, 0.06)'
                  : isMedium
                  ? 'rgba(245, 158, 11, 0.05)'
                  : 'rgba(59, 130, 246, 0.05)';

                const badgeSeverity = isHigh ? 'critical' : isMedium ? 'high' : 'medium';
                const labelText = isHigh ? 'High Priority' : isMedium ? 'Medium Priority' : 'Low Priority';

                return (
                  <div
                    key={alert.id}
                    style={{
                      padding: '0.9rem 1rem',
                      background: bgStyle,
                      border: `1px solid ${borderStyle}`,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge severity={badgeSeverity} size="sm">
                          {labelText}
                        </Badge>
                        <span style={{ fontSize: '0.78rem', color: '#93C5FD', fontWeight: 600 }}>
                          {alert.competitor}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {alert.timestamp}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 0.25rem' }}>
                        {alert.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                        {alert.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* ==================================================
            SECTION 6 — HISTORICAL MEMORY INDICATOR (KEY DIFFERENTIATOR)
        ================================================== */}
        <section aria-label="Historical Memory Indicator">
          <div
            className="ci-card"
            style={{
              padding: '1.5rem 1.75rem',
              background: 'linear-gradient(135deg, rgba(6, 11, 28, 0.9), rgba(11, 17, 43, 0.85))',
              border: '1px solid rgba(0, 210, 255, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                paddingBottom: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 210, 255, 0.1)',
                    border: '1px solid rgba(0, 210, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00D2FF',
                  }}
                >
                  <Database size={16} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      letterSpacing: '-0.01em',
                      margin: 0,
                    }}
                  >
                    {memoryStats.title || 'Historical Intelligence'}
                  </h3>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    {memoryStats.subtitle}
                  </p>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>Differentiator:</span>
                <span style={{ color: '#38BDF8', fontWeight: 600 }}>
                  Continuously monitors & remembers historical trajectories
                </span>
              </div>
            </div>

            {/* 4 Memory Statistic Boxes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(7, 13, 36, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38BDF8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Clock size={12} />
                  <span>Historical Depth</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.35rem' }}>
                  {memoryStats.timeframe}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Persistent horizon
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(7, 13, 36, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#60A5FA', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Layers size={12} />
                  <span>Indexed Activity</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.35rem' }}>
                  {memoryStats.eventsCount} Events
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Verifiable memory logs
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(7, 13, 36, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#C084FC', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Globe size={12} />
                  <span>Intelligence Feeds</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.35rem' }}>
                  {memoryStats.sourcesCount} Sources
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Multi-channel scrapers
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(7, 13, 36, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#F472B6', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <BrainCircuit size={12} />
                  <span>Synthesized Patterns</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.35rem' }}>
                  {memoryStats.patternsCount} Patterns
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Cross-event correlations
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageContainer>
  );
};

export default DashboardView;
