import React from 'react';

interface FractionProps {
  num: number | string;
  den: number | string;
  whole?: number | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Fraction: React.FC<FractionProps> = ({
  num,
  den,
  whole,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    xs: {
      container: 'text-[11px]',
      whole: 'text-xs font-bold mr-1',
      line: 'border-b',
      num: 'px-1 pb-0.5',
      den: 'px-1 pt-0.5',
    },
    sm: {
      container: 'text-xs',
      whole: 'text-sm font-bold mr-1.5',
      line: 'border-b',
      num: 'px-1.5 pb-0.5',
      den: 'px-1.5 pt-0.5',
    },
    md: {
      container: 'text-sm',
      whole: 'text-base font-bold mr-1.5',
      line: 'border-b-1.5 sm:border-b-2',
      num: 'px-2 pb-0.5',
      den: 'px-2 pt-0.5',
    },
    lg: {
      container: 'text-base',
      whole: 'text-xl font-bold mr-2',
      line: 'border-b-2',
      num: 'px-2.5 pb-0.5',
      den: 'px-2.5 pt-0.5',
    },
    xl: {
      container: 'text-xl',
      whole: 'text-2xl font-bold mr-2.5',
      line: 'border-b-2',
      num: 'px-3 pb-1',
      den: 'px-3 pt-1',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center align-middle font-mono font-bold select-none ${currentSize.container} ${className}`}
    >
      {whole !== undefined && whole !== null && whole !== '' && (
        <span className={`${currentSize.whole}`}>{whole}</span>
      )}
      <span className="inline-flex flex-col items-center justify-center leading-none text-center">
        <span className={`block w-full border-current ${currentSize.line} ${currentSize.num}`}>
          {num}
        </span>
        <span className={`block w-full ${currentSize.den}`}>
          {den}
        </span>
      </span>
    </span>
  );
};
