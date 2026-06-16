import React from 'react';
import { Svg, Path, G } from 'react-native-svg';
import { CyberColors } from '../constraints/colors';

interface WheelProps {
  size?: number;
}

export const Wheel = ({ size = 300 }: WheelProps) => {
  const slices = [0, 1, 2, 3, 4, 5];
  const radius = 50;
  const center = 50;

  // Helper to calculate arc path
  const createSlicePath = (index: number) => {
    // 60 degrees per slice (360 / 6) converted to radians
    const startAngle = index * (Math.PI / 3);
    const endAngle = (index + 1) * (Math.PI / 3);

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    return `M${center} ${center} L${x1} ${y1} A${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <Svg height={size} width={size} viewBox="0 0 100 100">
      <G rotation="-30" origin="50, 50">
        {slices.map((i) => (
          <Path
            key={i}
            d={createSlicePath(i)}
            fill={i % 2 === 0 ? CyberColors.yellow : CyberColors.pink}
            stroke="black"
            strokeWidth="0.5"
          />
        ))}
      </G>
    </Svg>
  );
};