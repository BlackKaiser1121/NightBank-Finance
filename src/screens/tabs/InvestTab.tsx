import React, { useContext, useState } from 'react';
import { View, Text, FlatList, Modal, TextInput, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { BankContext } from '../../context/BankContext';
import { Sparkline } from '../../components/Sparkline';
import { CyberButton } from '../../components/CyberButton';
import { CyberColors } from '../../constraints/colors';
import { formatCurrency } from '../../utils/helpers';
import { Stock } from '../../types';
import { Ionicons } from '@expo/vector-icons';

export const InvestTab = () => {
  const { market, currentUser, getPortfolioValue, buyStock, sellStock, logout } = useContext(BankContext);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [qty, setQty] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isBuy, setIsBuy] = useState(true);

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

  const handleTrade = () => {
    if (!selectedStock) return;
    const quantity = Number(qty);
    if (isNaN(quantity) || quantity <= 0) return;

    const res = isBuy ? buyStock(selectedStock.symbol, quantity) : sellStock(selectedStock.symbol, quantity);
    Alert.alert(res);
    if (res === 'Success') {
      setModalVisible(false);
      setQty('');
    }
  };

  const openTrade = (stock: Stock, buying: boolean) => {
    setSelectedStock(stock);
    setIsBuy(buying);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Stock }) => {
    const owned = currentUser?.stocks[item.symbol] || 0;
    const color = item.change >= 0 ? CyberColors.glitchGreen : CyberColors.pink;

    return (
      <View style={[styles.stockItem, { borderLeftColor: color }]}>
        <View style={styles.stockInfo}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.owned}>{owned.toFixed(2)} UNITS</Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <Sparkline data={item.history} color={color} width={100} height={40} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <Text style={{ color, fontSize: 10 }}>{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%</Text>
          <TouchableOpacity onPress={() => openTrade(item, true)}>
            <Ionicons name="swap-horizontal" size={20} color="white" style={{ marginTop: 5 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER WITH LOGOUT */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>MARKET</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="power" size={24} color={CyberColors.pink} />
        </TouchableOpacity>
      </View>

      <View style={styles.navContainer}>
        <Text style={{ color: 'grey', letterSpacing: 2 }}>NET ASSET VALUE</Text>
        <Text style={styles.nav}>{formatCurrency(getPortfolioValue())}</Text>
      </View>

      <FlatList 
        data={market} 
        keyExtractor={i => i.symbol} 
        renderItem={renderItem} 
        contentContainerStyle={{ padding: 10 }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: isBuy ? CyberColors.glitchGreen : CyberColors.pink }]}>
            <Text style={[styles.modalTitle, { color: isBuy ? CyberColors.glitchGreen : CyberColors.pink }]}>
              {isBuy ? "BUY ASSET" : "LIQUIDATE ASSET"}
            </Text>
            <Text style={{ color: 'white', marginVertical: 10 }}>{selectedStock?.name} [{selectedStock?.symbol}]</Text>
            <Text style={{ color: CyberColors.yellow, fontSize: 18, fontFamily: 'monospace' }}>{formatCurrency(selectedStock?.price || 0)}</Text>
            <TextInput style={styles.input} placeholder="QUANTITY" placeholderTextColor="grey" keyboardType="numeric" value={qty} onChangeText={setQty} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <CyberButton text="CANCEL" color="grey" onPress={() => setModalVisible(false)} />
              <CyberButton text="CONFIRM" color={isBuy ? CyberColors.glitchGreen : CyberColors.pink} onPress={handleTrade} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CyberColors.black },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerTitle: { color: CyberColors.cyan, fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
  logoutBtn: { padding: 5, borderWidth: 1, borderColor: CyberColors.pink, borderRadius: 5 },
  navContainer: { padding: 20, paddingTop: 5, backgroundColor: CyberColors.darkGrey, borderBottomWidth: 1, borderColor: '#333' },
  nav: { fontSize: 28, fontWeight: 'bold', color: CyberColors.cyan, fontFamily: 'monospace', marginTop: 5 },
  stockItem: { flexDirection: 'row', backgroundColor: 'black', padding: 15, marginVertical: 5, borderLeftWidth: 4, alignItems: 'center' },
  stockInfo: { width: 80 },
  symbol: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  name: { color: 'grey', fontSize: 10 },
  owned: { color: 'grey', fontSize: 10, marginTop: 4, fontFamily: 'monospace' },
  price: { color: 'white', fontWeight: 'bold', fontFamily: 'monospace' },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 20 },
  modalContent: { backgroundColor: 'black', padding: 20, borderWidth: 2, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', letterSpacing: 2, fontFamily: 'monospace' },
  input: { backgroundColor: '#222', color: 'white', width: '100%', padding: 10, marginVertical: 20, borderWidth: 1, borderColor: CyberColors.cyan }
});