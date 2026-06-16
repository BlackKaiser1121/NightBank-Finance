import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { BankContext } from '../../context/BankContext';
import { CyberCard } from '../../components/CyberCard';
import { CyberColors } from '../../constraints/colors';
import { Ionicons } from '@expo/vector-icons';

export const ProfileTab = () => {
  const { currentUser, logout } = useContext(BankContext);
  const [showAccount, setShowAccount] = useState(false);

  if (!currentUser) return null;

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

  const masked = "**** **** **** " + currentUser.accountNumber.slice(-3);
  const displayed = showAccount ? currentUser.accountNumber.replace(/(.{4})/g, '$1 ') : masked;

  return (
    <View style={styles.container}>
      {/* HEADER WITH LOGOUT */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>IDENTITY</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="power" size={24} color={CyberColors.pink} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.avatar}>
            <Ionicons name="finger-print" size={60} color={CyberColors.yellow} />
        </View>
        
        <Text style={styles.username}>{currentUser.username.toUpperCase()}</Text>

        <CyberCard borderColor={CyberColors.pink} style={{ width: '100%', marginTop: 30 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
                <Text style={{ color: CyberColors.pink, fontSize: 10 }}>ACCOUNT ID</Text>
                <Text style={styles.accountNum}>{displayed}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAccount(!showAccount)}>
                <Ionicons name={showAccount ? "eye-off" : "eye"} size={24} color={CyberColors.pink} />
            </TouchableOpacity>
            </View>
        </CyberCard>

        <CyberCard borderColor={CyberColors.glitchGreen} style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="shield-checkmark" size={32} color={CyberColors.glitchGreen} style={{ marginRight: 15 }} />
            <View>
                <Text style={{ color: CyberColors.glitchGreen, fontSize: 10 }}>STATUS</Text>
                <Text style={{ color: 'white', fontFamily: 'monospace' }}>CITIZEN [VERIFIED]</Text>
            </View>
            </View>
        </CyberCard>

        <View style={{ flex: 1 }} />
        <Text style={{ color: '#444', fontFamily: 'monospace' }}>SYS_ID: {Date.now()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CyberColors.black },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 0, marginTop: 10 },
  headerTitle: { color: CyberColors.cyan, fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
  logoutBtn: { padding: 5, borderWidth: 1, borderColor: CyberColors.pink, borderRadius: 5 },
  content: { flex: 1, padding: 30, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: CyberColors.yellow, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  username: { color: 'white', fontSize: 28, fontWeight: 'bold', letterSpacing: 4 },
  accountNum: { color: 'white', fontSize: 18, fontFamily: 'monospace', marginTop: 5, letterSpacing: 2 }
});