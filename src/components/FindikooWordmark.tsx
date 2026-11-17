interface FindikooWordmarkProps {
  tone?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FindikooWordmark({
  tone = 'dark',
  size = 'md',
  className = '',
}: FindikooWordmarkProps) {
  const textColor = tone === 'light' ? 'text-white' : 'text-[#1E4EB8]';
  const leafFill = tone === 'light' ? '#9BE52E' : '#2D6A1E';
  const stemStroke = tone === 'light' ? '#FFFFFF' : '#1E4EB8';

  const sizeClass =
    size === 'sm'
      ? 'text-lg'
      : size === 'lg'
      ? 'text-2xl sm:text-3xl'
      : 'text-xl sm:text-2xl';

  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6';

  return (
    <span className={`inline-flex items-center gap-2 font-extrabold tracking-tight select-none ${sizeClass} ${textColor} ${className}`}>
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSize} shrink-0`}
        aria-hidden="true"
      >
        <path
          d="M14 24V12"
          stroke={stemStroke}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M14 14C14 8.5 18.2 5 23.5 5C23.5 10.3 20 14.2 14 14Z"
          fill={leafFill}
        />
        <path
          d="M14 17C9.5 17 6 14 6 9.5C10.5 9.5 14 12.6 14 17Z"
          fill={leafFill}
          fillOpacity="0.72"
        />
      </svg>
      <span style={{ fontFamily: 'var(--font-display)' }}>Findikoo</span>
    </span>
  );
}
