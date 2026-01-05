import React from 'react';

/**
 * Admin interface for calendar setup (mobile-optimized)
 */
export const ConfigurationPanel: React.FC = () => {
  return (
    <div className="configuration-panel" style={{ padding: '24px', fontSize: '18px' }}>
      <h2>Calendar Configuration</h2>
      <div className="config-section">
        <h3>Calendar Sources</h3>
        {/* TODO: Implement configuration UI */}
        <p>Manage iCloud and Outlook calendar connections</p>
      </div>
      <div className="config-section">
        <h3>Display Settings</h3>
        <p>Customize calendar appearance and behavior</p>
      </div>
      <div className="config-section">
        <h3>Authentication</h3>
        <p>Configure IP restrictions and user access</p>
      </div>
    </div>
  );
};
