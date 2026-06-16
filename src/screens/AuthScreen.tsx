import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { CyberColors } from '../constraints/colors';
import { CyberCard } from '../components/CyberCard';
import { CyberButton } from '../components/CyberButton';
import { BankContext } from '../context/BankContext';
import { Ionicons } from '@expo/vector-icons';

export const AuthScreen = () => {
  const { login, register } = useContext(BankContext);
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState('');
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');

  const submit = () => {
    if (!user || !pin) return;
    if (isLogin) {
      if (!login(user, pin)) setMsg("ACCESS DENIED");
    } else {
      const res = register(user, pin);
      setMsg(res);
      if (res === "Success") {
        setIsLogin(true);
        setPin('');
      }
    }
  };

  return (
    <View style={styles.container}>
      <CyberCard borderColor={CyberColors.yellow} style={{ width: '90%' }}>
        <Ionicons name="hardware-chip" size={64} color={CyberColors.cyan} style={{ alignSelf: 'center' }} />
        <Text style={styles.title}>NIGHTCITY{'\n'}FINANCE</Text>
        <Text style={styles.sub}>{isLogin ? "AUTHENTICATE" : "NEW IDENTITY"}</Text>
        
        <TextInput 
          style={styles.input} placeholder="NET_ID" placeholderTextColor="#666" 
          value={user} onChangeText={setUser} autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} placeholder="PASSCODE" placeholderTextColor="#666" 
          value={pin} onChangeText={setPin} secureTextEntry keyboardType="numeric"
        />
        
        {msg ? <Text style={styles.err}>{msg}</Text> : null}
        
        <CyberButton text={isLogin ? "JACK IN" : "REGISTER"} onPress={submit} style={{ marginTop: 20 }} />
        
        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setMsg(''); }}>
          <Text style={styles.link}>{isLogin ? "Create New Identity >" : "< Return to Login"}</Text>
        </TouchableOpacity>
      </CyberCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CyberColors.black },
  title: { fontSize: 28, fontFamily: 'monospace', fontWeight: 'bold', color: CyberColors.yellow, textAlign: 'center', marginVertical: 16, letterSpacing: 3 },
  sub: { color: 'white', textAlign: 'center', letterSpacing: 2, marginBottom: 20 },
  input: { backgroundColor: '#1A1A1A', color: 'white', padding: 12, marginVertical: 8, borderWidth: 1, borderColor: CyberColors.cyan },
  err: { color: CyberColors.pink, textAlign: 'center', marginTop: 10 },
  link: { color: CyberColors.pink, textAlign: 'center', marginTop: 15 },
});