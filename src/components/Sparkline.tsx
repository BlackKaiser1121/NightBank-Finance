import React from 'react';
import { Svg, Path } from 'react-native-svg';

export const Sparkline = ({ data, color, width, height }: { data: number[], color: string, width: number, height: number }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const dx = width / (data.length - 1);
  
  const points = data.map((d, i) => {
    const x = i * dx;
    const y = height - ((d - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <Svg width={width} height={height}>
      <Path d={points} stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
};