import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // <--- Import
import { BankContext } from '../context/BankContext';
import { CyberButton } from '../components/CyberButton';
import { SlotReel } from '../components/SlotReel';
import { CyberColors } from '../constraints/colors';
import { Ionicons } from '@expo/vector-icons'; // <--- Import

export const Slots = () => {
  const { currentUser, updateGameBalance } = useContext(BankContext);
  const navigation = useNavigation(); // <--- Init
  const [bet, setBet] = useState('');
  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState('INSERT CREDITS');
  const [isWinState, setIsWinState] = useState(false);

  const spin = () => {
    const b = Number(bet);
    if (!currentUser || b > currentUser.balance || b <= 0) return;
    
    setSpinning(true);
    setIsWinState(false);
    setMsg('SPINNING...');
    
    let iterations = 0;
    const interval = setInterval(() => {
        setReels([
            Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 6)
        ]);
        iterations++;
        if(iterations > 20) {
            clearInterval(interval);
            finishSpin(b);
        }
    }, 100);
  };

  const finishSpin = (b: number) => {
    const r1 = Math.floor(Math.random() * 6);
    const r2 = Math.floor(Math.random() * 6);
    const r3 = Math.floor(Math.random() * 6);
    setReels([r1, r2, r3]);
    setSpinning(false);
    const win = (r1 === r2 && r2 === r3);
    const jackpot = win && r1 === 5; 
    if (jackpot) {
        const payout = b * 50;
        updateGameBalance(payout, true, "Slots Jackpot");
        setMsg(`JACKPOT! +$${payout}`);
        setIsWinState(true);
    } else if (win) {
        const payout = b * 10;
        updateGameBalance(payout, true, "Slots Win");
        setMsg(`WINNER! +$${payout}`);
        setIsWinState(true);
    } else {
        updateGameBalance(b, false, "Slots");
        setMsg("NO MATCH");
    }
  };

  return (
    <View style={styles.container}>
        {/* --- Header --- */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={28} color={CyberColors.cyan} />
            </TouchableOpacity>
            <Text style={styles.headerText}>CYBER SLOTS</Text>
            <View style={{ width: 28 }} />
        </View>

        <View style={styles.content}>
            <View style={[styles.machine, isWinState && { borderColor: CyberColors.yellow }]}>
                {reels.map((r, i) => (
                    <SlotReel key={i} iconIndex={r} isWin={isWinState} />
                ))}
            </View>

            <Text style={[styles.msg, isWinState && { color: CyberColors.glitchGreen }]}>
                {msg}
            </Text>
            
            <TextInput 
                style={styles.input} 
                placeholder="BET" 
                placeholderTextColor="grey" 
                keyboardType="numeric" 
                value={bet} 
                onChangeText={setBet} 
            />
            
            <CyberButton text="SPIN" onPress={spin} disabled={spinning} />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CyberColors.black },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerText: { color: CyberColors.pink, fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
  backBtn: { padding: 5 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  machine: { 
    flexDirection: 'row', 
    padding: 20, 
    borderWidth: 2, 
    borderColor: CyberColors.pink, 
    borderRadius: 10, 
    backgroundColor: '#111',
    shadowColor: CyberColors.pink,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5
  },
  msg: { color: CyberColors.yellow, fontSize: 24, marginVertical: 30, fontWeight: 'bold', fontFamily: 'monospace' },
  input: { backgroundColor: '#222', color: 'white', width: 200, padding: 10, marginBottom: 20, textAlign: 'center', borderWidth: 1, borderColor: CyberColors.cyan },
});