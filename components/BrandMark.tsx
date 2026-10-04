import Image from 'next/image';

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export default function BrandMark({ size = 32, className = '' }: BrandMarkProps) {
  return (
    <Image
      src="/outranka-mark.svg"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
      unoptimized
    />
  );
}
