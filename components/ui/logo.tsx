import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Logo = ({ className = '', width = 157, height = 33 }: LogoProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/Logo/Horizontal-logo.svg"
        alt="Parcego Logo"
        width={width}
        height={height}
        priority
        unoptimized
        className="transition-opacity duration-200 hover:opacity-90"
      />
    </div>
  );
};
