import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Building2, 
  Calendar, 
  BrainCircuit, 
  Zap,
  Layers
} from 'lucide-react';
import { CategoryPieChart, CompetitorActivityBarChart } from '../charts/AnalyticsCharts';
import { apiService } from '../services/api';

export default function AnalyticsView({ competitors }) {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [totalSignals, setTotalSignals] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, [competitors]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      if (!competitors || competitors.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch event counts for all competitors
      const evProms = competitors.map(c => 
        apiService.getCompetitorEvents(c.id, 1, 100).catch(() => ({ items: [] }))
      );
      const results = await Promise.all(evProms);

      let total = 0;
      const catMap = {};
      const actList = [];

      results.forEach((res, idx) => {
        const comp = competitors[idx];
        const items = res.items || [];
        total += items.length;

        actList.push({
          name: comp.name,
          events: items.length,
        });

        items.forEach(ev => {
          const cat = ev.category || 'other';
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
      });

      setTotalSignals(total);
      setActivityData(actList);

      const pieList = Object.entries(catMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
      setCategoryData(pieList);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="fade-in-up">
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(99, 102, 241, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.6rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', color: '#a5b4fc' }}>
            <BarChart3 size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              Strategic Analytics & Signal Visualizer
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Quantitative distribution & competitor activity velocity across persistent memory banks
            </p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Ingested Signals
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
            {totalSignals}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            Active Competitors
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
            {competitors.length}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            Categories Tracked
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', marginTop: '0.25rem' }}>
            {categoryData.length || 6}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Category Breakdown Pie Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieIcon size={18} color="#a5b4fc" />
            <span>Event Category Distribution</span>
          </h3>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading chart...</div>
          ) : (
            <CategoryPieChart data={categoryData} />
          )}
        </div>

        {/* Competitor Activity Comparison Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#34d399" />
            <span>Competitor Activity Signals Comparison</span>
          </h3>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading chart...</div>
          ) : (
            <CompetitorActivityBarChart data={activityData} />
          )}
        </div>

      </div>

    </div>
  );
}
