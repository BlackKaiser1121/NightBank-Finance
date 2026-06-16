import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { CyberColors } from '../constraints/colors';

interface Props {
  children: React.ReactNode;
  borderColor?: string;
  style?: ViewStyle;
}

export const CyberCard = ({ children, borderColor = CyberColors.cyan, style }: Props) => {
  return (
    <View style={[styles.card, { borderColor, shadowColor: borderColor }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CyberColors.darkGrey,
    borderWidth: 2,
    padding: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
});