import { initials, resolveMediaUrl } from '../../lib/utils';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, src, size = 44, className = '' }: AvatarProps) {
  const resolved = resolveMediaUrl(src);
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(12, size / 3.4) }}
      aria-label={name}
    >
      {resolved ? <img src={resolved} alt={name} className="h-full w-full object-cover" /> : initials(name)}
    </div>
  );
}
