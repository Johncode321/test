interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const MessageInput = ({ value, onChange }: MessageInputProps) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your message to sign..."
      className="w-full min-h-[120px] p-4 rounded-xl bg-gray-900/50 border border-gray-700 
        text-white placeholder-gray-500 text-sm resize-none focus:outline-none 
        focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
    />
  );
};