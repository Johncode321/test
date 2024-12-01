import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { IconButton } from './styled';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <IconButton onClick={handleCopy} title={label}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </IconButton>
  );
};