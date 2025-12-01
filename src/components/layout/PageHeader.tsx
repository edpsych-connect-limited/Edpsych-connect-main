/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
};

export default PageHeader;
