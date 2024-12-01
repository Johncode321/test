import React from 'react';
import { Log } from '../types/wallet';
import { LogContainer, LogEntry, Button } from './styled';

interface LogViewerProps {
  logs: Log[];
  onClear: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs, onClear }) => {
  return (
    <>
      <h2>Logs</h2>
      <Button onClick={onClear}>Clear Logs</Button>
      <LogContainer>
        {logs.map((log, i) => (
          <LogEntry key={i} status={log.status}>
            <strong>{log.method}:</strong> {log.message}
          </LogEntry>
        ))}
      </LogContainer>
    </>
  );
};