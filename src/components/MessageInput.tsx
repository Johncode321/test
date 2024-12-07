interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  providerType: 'phantom' | 'solflare' | null;
}

export const MessageInput = ({ value, onChange, providerType }: MessageInputProps) => {
  const focusColor = providerType === 'phantom' ? '#ab9ff2' : '#fc7227';

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your message to sign..."
      className={`w-full min-h-[120px] p-4 rounded-xl bg-gray-900/50 border border-gray-700 
        text-white placeholder-gray-500 text-sm resize-none outline-none 
        focus:border-transparent transition-all`}
      style={{
        '--tw-shadow': `0 10px 15px -3px rgb(27 36 51), 0 4px 6px -4px rgb(27 36 51)`,
        boxShadow: 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)',
        '--tw-ring-offset-shadow': `0 0 #0000`,
        '--tw-ring-shadow': `0 0 0 2px ${focusColor}`,
      } as React.CSSProperties}
    />
  );
};
