import skdLogo from '../assets/skd-logo.svg';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = '', width = 200, height = 133 }: LogoProps) {
  return (
    <img
      src={skdLogo}
      alt="SKD GROUP Logo"
      width={width}
      height={height}
      className={`object-contain ${className}`}
    />
  );
}
