import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CyberColors } from '../constraints/colors';

interface SlotReelProps {
  iconIndex: number;
  isWin?: boolean; // To highlight winning reels later if desired
}

// Map indices to Ionicon names
export const SLOT_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'star',           // 0
  'diamond',        // 1
  'heart',          // 2
  'flash',          // 3
  'beer',           // 4
  'logo-bitcoin',   // 5 (Jackpot)
];

export const SlotReel = ({ iconIndex, isWin = false }: SlotReelProps) => {
  // Ensure index is valid
  const safeIndex = iconIndex % SLOT_ICONS.length;
  const iconName = SLOT_ICONS[safeIndex];

  // Bitcoin (index 5) gets special coloring
  const iconColor = safeIndex === 5 
    ? CyberColors.glitchGreen 
    : (isWin ? CyberColors.yellow : CyberColors.cyan);

  return (
    <View style={[styles.reel, isWin && styles.winningReel]}>
      <Ionicons 
        name={iconName} 
        size={50} 
        color={iconColor} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  reel: {
    width: 80,
    height: 100,
    backgroundColor: '#000',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
  },
  winningReel: {
    borderColor: CyberColors.yellow,
    backgroundColor: '#111',
  }
});