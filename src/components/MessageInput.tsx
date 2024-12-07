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
      className="w-full min-h-[120px] p-4 rounded-xl bg-gray-900/50 border border-gray-700 
        text-white placeholder-gray-500 text-sm resize-none outline-none shadow-lg
        transition-all focus:border-transparent"
      style={{
        '--tw-shadow-color': 'rgb(26 35 50)',
        '--tw-shadow-colored': '0 10px 15px -3px rgb(26 35 50), 0 4px 6px -4px var(--tw-shadow-color)',
        ':focus': {
          '--tw-ring-shadow': `0 0 0 2px ${focusColor}`
        }
      } as React.CSSProperties}
    />
  );
};
