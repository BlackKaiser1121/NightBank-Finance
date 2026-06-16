import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { CyberColors } from '../constraints/colors';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  text: string;
  onPress?: () => void;
  color?: string;
  textColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  disabled?: boolean;
}

export const CyberButton = ({ text, onPress, color = CyberColors.yellow, textColor = 'black', icon, style, disabled }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: color, borderColor: 'white', opacity: disabled ? 0.5 : 1 },
        style
      ]}
    >
      {icon && <Ionicons name={icon} size={20} color={textColor} style={{ marginRight: 8 }} />}
      <Text style={[styles.text, { color: textColor }]}>{text.toUpperCase()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  text: {
    fontWeight: 'bold',
    letterSpacing: 1.5,
  }
});