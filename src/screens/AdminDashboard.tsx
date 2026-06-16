import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { BankContext } from '../context/BankContext';
import { CyberButton } from '../components/CyberButton';
import { CyberColors } from '../constraints/colors';
import { formatCurrency } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Tab = 'USERS' | 'MARKET' | 'LOANS';

export const AdminDashboard = () => {
  const { users, market, adminProcessLoan, adminRemoveStock, adminAddStock, adminAdjustBalance, logout } = useContext(BankContext);
  const [activeTab, setActiveTab] = useState<Tab>('USERS');
  const nav = useNavigation<any>();

  // Temporary state for adding stock
  const [sym, setSym] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleLogout = () => {
    logout();
    nav.replace('Auth');
  };

  const renderUsers = () => {
    const userList = Object.values(users).filter(u => !u.isAdmin);
    return (
      <FlatList
        data={userList}
        keyExtractor={item => item.username}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View>
              <Text style={{ color: 'white' }}>{item.username}</Text>
              <Text style={{ color: CyberColors.yellow }}>{formatCurrency(item.balance)}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => adminAdjustBalance(item.username, 1000, true)}>
                <Ionicons name="add-circle" size={28} color={CyberColors.glitchGreen} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => adminAdjustBalance(item.username, 1000, false)}>
                <Ionicons name="remove-circle" size={28} color={CyberColors.pink} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    );
  };

  const renderLoans = () => {
    const loans = Object.values(users).flatMap(u => 
      u.loans.filter(l => l.status === 'Pending').map(l => ({ ...l, username: u.username }))
    );

    if (loans.length === 0) return <Text style={{ color: 'grey', textAlign: 'center', marginTop: 20 }}>NO PENDING REQUESTS</Text>;

    return (
      <FlatList
        data={loans}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.listItem, { borderColor: CyberColors.yellow }]}>
            <View>
              <Text style={{ color: 'white' }}>{item.username} req {formatCurrency(item.amount)}</Text>
              <Text style={{ color: 'grey', fontSize: 12 }}>{item.reason}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => adminProcessLoan(item.username, item.id, true)}>
                <Ionicons name="checkmark-circle" size={30} color={CyberColors.glitchGreen} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => adminProcessLoan(item.username, item.id, false)}>
                <Ionicons name="close-circle" size={30} color={CyberColors.pink} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    );
  };

  const renderMarket = () => (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 10, backgroundColor: '#111', marginBottom: 10 }}>
        <Text style={{ color: CyberColors.cyan }}>ADD ASSET</Text>
        <TextInput style={styles.input} placeholder="SYMBOL (BTC)" placeholderTextColor="grey" value={sym} onChangeText={setSym} />
        <TextInput style={styles.input} placeholder="NAME (Bitcoin)" placeholderTextColor="grey" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="PRICE" placeholderTextColor="grey" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <CyberButton text="CREATE" onPress={() => {
            if(sym && name && price) {
                adminAddStock(sym, name, Number(price));
                setSym(''); setName(''); setPrice('');
            }
        }} />
      </View>
      <FlatList
        data={market}
        keyExtractor={item => item.symbol}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={{ color: 'white' }}>{item.symbol} - {formatCurrency(item.price)}</Text>
            <TouchableOpacity onPress={() => adminRemoveStock(item.symbol)}>
              <Ionicons name="trash" size={24} color={CyberColors.pink} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ADMIN CONSOLE</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="power" size={24} color={CyberColors.pink} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabs}>
        {(['USERS', 'MARKET', 'LOANS'] as Tab[]).map(t => (
          <TouchableOpacity 
            key={t} 
            onPress={() => setActiveTab(t)}
            style={[styles.tab, activeTab === t && { borderBottomColor: CyberColors.pink }]}
          >
            <Text style={{ color: activeTab === t ? CyberColors.pink : 'grey', fontWeight: 'bold' }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'USERS' && renderUsers()}
        {activeTab === 'MARKET' && renderMarket()}
        {activeTab === 'LOANS' && renderLoans()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CyberColors.black },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111' },
  title: { color: CyberColors.cyan, fontSize: 20, fontWeight: 'bold', fontFamily: 'monospace' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#333' },
  tab: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  content: { flex: 1, padding: 10 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#333', marginBottom: 5 },
  input: { backgroundColor: '#222', color: 'white', padding: 8, marginVertical: 4, borderWidth: 1, borderColor: '#444' }
});