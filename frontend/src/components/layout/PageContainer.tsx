import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <main className={`page-container fade-in ${className}`} style={style}>
      {children}
    </main>
  );
};

export default PageContainer;
