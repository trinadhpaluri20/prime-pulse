import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';

export function CategoryPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        No category distribution data recorded.
      </div>
    );
  }

  const COLORS = ['#6366f1', '#34d399', '#c084fc', '#fcd34d', '#67e8f9', '#f472b6'];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ background: '#0f172a', border: '1px solid var(--border-light)', borderRadius: '8px', color: '#ffffff', fontSize: '0.82rem' }} 
        />
        <Legend 
          formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 500 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CompetitorActivityBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        No competitor activity data available.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
        <Tooltip 
          contentStyle={{ background: '#0f172a', border: '1px solid var(--border-light)', borderRadius: '8px', color: '#ffffff', fontSize: '0.82rem' }}
        />
        <Bar dataKey="events" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#8b5cf6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
