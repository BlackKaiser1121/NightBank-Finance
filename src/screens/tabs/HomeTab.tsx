import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Alert, TouchableOpacity, Modal, Platform } from 'react-native'; // <--- Import Platform
import { BankContext } from '../../context/BankContext';
import { CyberCard } from '../../components/CyberCard';
import { CyberButton } from '../../components/CyberButton';
import { CyberColors } from '../../constraints/colors';
import { formatCurrency } from '../../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

export const HomeTab = () => {
  const { currentUser, deposit, withdraw, transfer, payBill, repayLoan, register, requestLoan, logout } = useContext(BankContext);
  
  // Transaction States
  const [amt, setAmt] = useState('');
  
  // Transfer States
  const [toUser, setToUser] = useState('');
  const [transferAmt, setTransferAmt] = useState('');
  const [transferStatus, setTransferStatus] = useState('');
  const [transferColor, setTransferColor] = useState(CyberColors.cyan);
  
  // Service Modal States
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<{name: string, icon: any, color: string} | null>(null);
  const [billAmount, setBillAmount] = useState('');

  // Loan Request Modal States
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanReason, setLoanReason] = useState('');

  if (!currentUser) return null;

  // --- Handlers ---

  const handleLogout = () => {
    // WEB FIX: Alert.alert doesn't work well on web, use window.confirm
    if (Platform.OS === 'web') {
        const confirmLogout = window.confirm("Jack out of NightCity Bank?");
        if (confirmLogout) {
            logout();
        }
    } else {
        // MOBILE: Use Native Alert
        Alert.alert(
            "System Logout",
            "Jack out of NightCity Bank?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Jack Out", onPress: () => logout(), style: 'destructive' }
            ]
        );
    }
  };

  const handleDeposit = () => {
    const val = Number(amt);
    if (!isNaN(val) && val > 0) {
      deposit(val);
      setAmt('');
      Alert.alert("Success", "Credits Added");
    }
  };

  const handleWithdraw = () => {
    const val = Number(amt);
    if (!isNaN(val) && val > 0) {
      if (withdraw(val)) {
        setAmt('');
        Alert.alert("Success", "Credits Withdrawn");
      } else {
        Alert.alert("Error", "Insufficient Funds");
      }
    }
  };

  const handleTransfer = () => {
    const val = Number(transferAmt);
    const cleanUser = toUser.trim();

    setTransferStatus('');

    if (!cleanUser) {
        setTransferStatus("ERROR: RECIPIENT REQUIRED");
        setTransferColor(CyberColors.pink);
        return;
    }
    if (isNaN(val) || val <= 0) {
        setTransferStatus("ERROR: INVALID AMOUNT");
        setTransferColor(CyberColors.pink);
        return;
    }

    const res = transfer(cleanUser, val);
    
    if (res === "Success") {
        setTransferStatus(`SUCCESS: SENT ${formatCurrency(val)} >> ${cleanUser.toUpperCase()}`);
        setTransferColor(CyberColors.glitchGreen);
        setTransferAmt('');
        setToUser('');
        setTimeout(() => setTransferStatus(''), 4000);
    } else {
        setTransferStatus(`ERROR: ${res.toUpperCase()}`);
        setTransferColor(CyberColors.pink);
    }
  };

  const createTestUser = () => {
    const res = register("judy", "0000");
    if (res === "Success" || res === "User exists") {
        setToUser("judy");
        Alert.alert("Debug Info", "Created user 'judy'. You can now transfer money to her.");
    }
  };

  const openServiceModal = (name: string, icon: any, color: string) => {
    setSelectedService({ name, icon, color });
    setBillAmount('');
    setServiceModalVisible(true);
  };

  const handlePayBill = () => {
    if (!selectedService) return;
    const val = Number(billAmount);
    if (!isNaN(val) && val > 0) {
      const res = payBill(selectedService.name, val);
      if (res === "Success") {
        setServiceModalVisible(false);
        Alert.alert("Paid", `Transferred ${formatCurrency(val)} for ${selectedService.name}`);
      } else {
        Alert.alert("Error", res);
      }
    }
  };

  const handleRequestLoan = () => {
    const val = Number(loanAmount);
    const reason = loanReason.trim();

    if (isNaN(val) || val <= 0) {
        Alert.alert("Error", "Invalid Amount");
        return;
    }
    if (!reason) {
        Alert.alert("Error", "Please provide a reason");
        return;
    }

    requestLoan(val, reason);
    setLoanModalVisible(false);
    setLoanAmount('');
    setLoanReason('');
    Alert.alert("Request Sent", "Your loan request is now PENDING approval by admin.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* HEADER WITH LOGOUT */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>NIGHTCITY BANK</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="power" size={24} color={CyberColors.pink} />
        </TouchableOpacity>
      </View>
      
      {/* BALANCE CARD */}
      <CyberCard borderColor={CyberColors.yellow}>
        <Text style={{ color: CyberColors.yellow, letterSpacing: 2, textAlign: 'center' }}>AVAILABLE CREDITS</Text>
        <Text style={styles.balance}>{formatCurrency(currentUser.balance)}</Text>
        <Text style={{ color: 'grey', fontFamily: 'monospace', textAlign: 'center' }}>USER: {currentUser.username.toUpperCase()}</Text>
      </CyberCard>

      {/* TRANSACTIONS */}
      <Text style={styles.sectionTitle}>TRANSACTIONS</Text>
      <CyberCard>
        <TextInput 
          style={styles.input} 
          placeholder="AMOUNT $" 
          placeholderTextColor="#666" 
          keyboardType="numeric" 
          value={amt} 
          onChangeText={setAmt} 
        />
        <View style={styles.row}>
          <CyberButton text="DEPOSIT" color={CyberColors.glitchGreen} style={{ flex: 1, marginRight: 5 }} onPress={handleDeposit} />
          <CyberButton text="WITHDRAW" color={CyberColors.pink} style={{ flex: 1, marginLeft: 5 }} onPress={handleWithdraw} />
        </View>
      </CyberCard>

      {/* SERVICES */}
      <Text style={styles.sectionTitle}>SERVICES</Text>
      <View style={styles.row}>
        {[
            {name: 'ENERGY', icon: 'flash', color: CyberColors.yellow},
            {name: 'WATER', icon: 'water', color: CyberColors.cyan},
            {name: 'NET', icon: 'wifi', color: CyberColors.pink}
        ].map((s, i) => (
            <TouchableOpacity key={i} style={{ flex: 1, marginHorizontal: 2 }} onPress={() => openServiceModal(s.name, s.icon, s.color)}>
                <CyberCard borderColor={s.color} style={{ alignItems: 'center', marginVertical: 0, padding: 10 }}>
                    <Ionicons name={s.icon as any} size={24} color={s.color} />
                    <Text style={{ color: s.color, fontSize: 10, marginTop: 5, fontWeight: 'bold' }}>{s.name}</Text>
                </CyberCard>
            </TouchableOpacity>
        ))}
      </View>

      {/* LOANS */}
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 8}}>
        <Text style={{ color: CyberColors.pink, fontWeight: 'bold', letterSpacing: 2 }}>LOANS</Text>
        <TouchableOpacity onPress={() => setLoanModalVisible(true)} style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="add-circle" size={24} color={CyberColors.yellow} />
            <Text style={{color: CyberColors.yellow, fontWeight: 'bold', marginLeft: 5}}>REQUEST</Text>
        </TouchableOpacity>
      </View>

      {currentUser.loans.length === 0 ? (
        <Text style={{color:'grey', fontFamily: 'monospace'}}>No active contracts.</Text>
      ) : (
        currentUser.loans.map(l => (
          <View key={l.id} style={styles.loanItem}>
            <View>
                <Text style={{color:'white', fontFamily: 'monospace'}}>{l.reason}</Text>
                <Text style={{color:CyberColors.yellow, fontSize: 12}}>{formatCurrency(l.amount)}</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
                <Text style={{color: l.status === 'Approved' ? CyberColors.glitchGreen : (l.status === 'Rejected' ? CyberColors.pink : CyberColors.yellow), fontWeight: 'bold'}}>
                    {l.status}
                </Text>
                {l.status === 'Approved' && (
                    <TouchableOpacity onPress={() => repayLoan(l.id)}>
                        <Text style={{color: CyberColors.cyan, marginTop: 5, textDecorationLine: 'underline'}}>REPAY</Text>
                    </TouchableOpacity>
                )}
            </View>
          </View>
        ))
      )}

      {/* WIRE TRANSFER */}
      <Text style={styles.sectionTitle}>WIRE TRANSFER</Text>
      <CyberCard borderColor={CyberColors.cyan}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TextInput 
                style={[styles.input, {flex: 1, marginBottom: 0}]} 
                placeholder="RECIPIENT ID" 
                placeholderTextColor="#666" 
                value={toUser} 
                onChangeText={setToUser} 
                autoCapitalize="none"
            />
            <TouchableOpacity onPress={createTestUser} style={{marginLeft: 10}}>
                <Ionicons name="person-add" size={24} color={CyberColors.cyan} />
            </TouchableOpacity>
        </View>
        <Text style={{color: 'grey', fontSize: 10, marginBottom: 10, marginTop: 5}}>
            Tap icon to auto-create 'judy' for testing
        </Text>

        <TextInput 
            style={styles.input} 
            placeholder="AMOUNT $" 
            placeholderTextColor="#666" 
            keyboardType="numeric" 
            value={transferAmt} 
            onChangeText={setTransferAmt} 
        />

        {transferStatus ? (
            <View style={{marginBottom: 10, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: transferColor}}>
                <Text style={{color: transferColor, fontWeight: 'bold', textAlign: 'center', fontFamily: 'monospace'}}>
                    {transferStatus}
                </Text>
            </View>
        ) : null}

        <CyberButton text="SEND CREDITS" color={CyberColors.cyan} onPress={handleTransfer} />
      </CyberCard>

      {/* MODALS */}
      <Modal visible={serviceModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: selectedService?.color }]}>
            <Text style={[styles.modalTitle, { color: selectedService?.color }]}>PAY: {selectedService?.name}</Text>
            <TextInput style={styles.input} placeholder="BILL AMOUNT" placeholderTextColor="grey" keyboardType="numeric" value={billAmount} onChangeText={setBillAmount} autoFocus />
            <View style={styles.row}>
                <CyberButton text="CANCEL" color="grey" style={{flex: 1, marginRight: 5}} onPress={() => setServiceModalVisible(false)} />
                <CyberButton text="PAY" color={selectedService?.color} style={{flex: 1, marginLeft: 5}} onPress={handlePayBill} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={loanModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: CyberColors.yellow }]}>
            <Text style={[styles.modalTitle, { color: CyberColors.yellow }]}>REQUEST CREDIT</Text>
            <TextInput style={styles.input} placeholder="LOAN AMOUNT" placeholderTextColor="grey" keyboardType="numeric" value={loanAmount} onChangeText={setLoanAmount} autoFocus />
            <TextInput style={styles.input} placeholder="PURPOSE (e.g. Cyberware)" placeholderTextColor="grey" value={loanReason} onChangeText={setLoanReason} />
            <View style={styles.row}>
                <CyberButton text="CANCEL" color="grey" style={{flex: 1, marginRight: 5}} onPress={() => setLoanModalVisible(false)} />
                <CyberButton text="SUBMIT" color={CyberColors.yellow} style={{flex: 1, marginLeft: 5}} onPress={handleRequestLoan} />
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CyberColors.black, padding: 20 },
  
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20
  },
  header: { color: CyberColors.cyan, fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
  logoutBtn: { padding: 5, borderWidth: 1, borderColor: CyberColors.pink, borderRadius: 5 },

  balance: { color: 'white', fontSize: 36, fontWeight: 'bold', marginVertical: 8, fontFamily: 'monospace', textAlign: 'center' },
  sectionTitle: { color: CyberColors.pink, fontWeight: 'bold', letterSpacing: 2 },
  input: { backgroundColor: '#1A1A1A', color: 'white', padding: 12, marginBottom: 12, borderWidth: 1, borderColor: CyberColors.cyan, fontFamily: 'monospace' },
  row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  loanItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F0F0F', borderLeftWidth: 3, borderLeftColor: CyberColors.yellow, padding: 15, marginBottom: 8 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { width: '85%', backgroundColor: CyberColors.black, padding: 25, borderWidth: 2 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, fontFamily: 'monospace' }
});