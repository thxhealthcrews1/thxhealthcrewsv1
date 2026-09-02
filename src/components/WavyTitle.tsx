interface WavyTitleProps {
  lines: string[];
  className?: string;
}

export default function WavyTitle({ lines, className = '' }: WavyTitleProps) {
  let charIndex = 0;

  return (
    <div
      className={`text-center select-none ${className}`}
      aria-label={lines.join(' ')}
    >
      {lines.map((line, lineIndex) => (
        <div
          key={lineIndex}
          className="font-fredoka text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-snug tracking-wide animate-soft-float"
          style={{ animationDelay: `${lineIndex * 0.45}s`, WebkitTextStroke: '2px #1e3a8a', paintOrder: 'stroke fill' }}
        >
          {line.split('').map((char) => {
            const delay = charIndex * 0.09;
            charIndex += 1;

            return (
              <span
                key={`${lineIndex}-${charIndex}`}
                className="inline-block animate-letter-float"
                style={{ animationDelay: `${delay}s` }}
                aria-hidden="true"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
