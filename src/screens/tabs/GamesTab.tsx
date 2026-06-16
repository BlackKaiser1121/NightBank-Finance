import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BankContext } from '../../context/BankContext';
import { CyberColors } from '../../constraints/colors';
import { Ionicons } from '@expo/vector-icons';

export const GamesTab = () => {
  const nav = useNavigation<any>();
  const { logout } = useContext(BankContext);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Jack out of NightCity Bank?")) logout();
    } else {
      Alert.alert(
        "System Logout", "Jack out of NightCity Bank?",
        [{ text: "Cancel", style: "cancel" }, { text: "Jack Out", onPress: logout, style: 'destructive' }]
      );
    }
  };

  const GameCard = ({ name, icon, color, route }: { name: string, icon: keyof typeof Ionicons.glyphMap, color: string, route: string }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => nav.navigate(route)} 
      style={[styles.card, { borderColor: color }]}
    >
        <View style={styles.cardContent}>
            <Ionicons name={icon} size={32} color={color} />
            <Text style={[styles.cardText, { color: color }]}>{name}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={color} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* HEADER WITH LOGOUT */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>ARCADE ZONE</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="power" size={24} color={CyberColors.pink} />
        </TouchableOpacity>
      </View>
      
      <GameCard name="SPIN & WIN" icon="pie-chart" color={CyberColors.pink} route="SpinWheel" />
      <GameCard name="BLACKJACK" icon="albums" color={CyberColors.yellow} route="Blackjack" />
      <GameCard name="CYBER SLOTS" icon="hardware-chip" color={CyberColors.glitchGreen} route="Slots" />
      <GameCard name="PLINKO" icon="grid" color={CyberColors.cyan} route="Plinko" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CyberColors.black, padding: 20 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  header: { color: CyberColors.cyan, fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
  logoutBtn: { padding: 5, borderWidth: 1, borderColor: CyberColors.pink, borderRadius: 5 },
  card: {
    backgroundColor: '#050505', borderWidth: 1, padding: 20, marginVertical: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, elevation: 3,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  cardText: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, letterSpacing: 2 },
});