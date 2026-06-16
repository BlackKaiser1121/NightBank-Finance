import React, { useState, useContext, useRef } from 'react';
import { View, Text, Animated, Easing, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // <--- Import
import { BankContext } from '../context/BankContext';
import { CyberButton } from '../components/CyberButton';
import { Wheel } from '../components/Wheel';
import { CyberColors } from '../constraints/colors';
import { Ionicons } from '@expo/vector-icons'; // <--- Import

export const SpinWheel = () => {
  const { updateGameBalance, currentUser } = useContext(BankContext);
  const navigation = useNavigation(); // <--- Init
  const [bet, setBet] = useState('');
  const [res, setRes] = useState('');
  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = () => {
    const b = Number(bet);
    if (!currentUser || b > currentUser.balance || b <= 0) return;
    
    setRes('');
    const randomRot = 5 + Math.random(); 
    
    Animated.timing(spinValue, {
      toValue: randomRot,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(() => {
      const finalAngle = (randomRot % 1) * 360; 
      const slice = Math.floor(finalAngle / 60);
      const isWin = slice % 2 !== 0; 
      
      updateGameBalance(b, isWin, "Spin");
      setRes(isWin ? "WINNER" : "LOSS");
      spinValue.setValue(randomRot % 1); 
    });
  };

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color={CyberColors.cyan} />
        </TouchableOpacity>
        <Text style={styles.headerText}>SPIN & WIN</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
            <Wheel size={300} />
        </Animated.View>
        
        <Text style={[styles.res, { color: res === 'WINNER' ? CyberColors.glitchGreen : CyberColors.pink }]}>
            {res}
        </Text>
        
        <TextInput 
            style={styles.input} 
            placeholder="BET" 
            placeholderTextColor="grey" 
            keyboardType="numeric" 
            value={bet} 
            onChangeText={setBet} 
        />
        
        <CyberButton text="SPIN" onPress={spin} />
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
    paddingBottom: 10,
  },
  headerText: { color: CyberColors.cyan, fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
  backBtn: { padding: 5 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  input: { backgroundColor: '#222', color: 'white', width: 200, padding: 10, margin: 20, textAlign: 'center', borderWidth: 1, borderColor: CyberColors.cyan },
  res: { fontSize: 32, fontWeight: 'bold', margin: 20, fontFamily: 'monospace' }
});