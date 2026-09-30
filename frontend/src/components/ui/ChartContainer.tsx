import React from 'react';
import Card from './Card';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  height?: number | string;
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  action,
  height = 300,
  children,
  className = '',
}) => {
  return (
    <Card
      title={title}
      subtitle={subtitle}
      action={action}
      className={`chart-container-card ${className}`}
      padding="md"
    >
      <div 
        style={{ 
          width: '100%', 
          height: typeof height === 'number' ? `${height}px` : height,
          position: 'relative',
        }}
      >
        {children}
      </div>
    </Card>
  );
};

export default ChartContainer;
