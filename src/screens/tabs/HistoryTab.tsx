import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { BankContext } from '../../context/BankContext';
import { CyberColors } from '../../constraints/colors';
import { formatCurrency } from '../../utils/helpers';
import { Transaction } from '../../types';

export const HistoryTab = () => {
  const { currentUser } = useContext(BankContext);

  if (!currentUser) return null;

  // Create a reversed copy of the history array to show newest first
  const historyList = [...currentUser.history].reverse();

  const renderItem = ({ item }: { item: Transaction }) => {
    // Determine if the transaction added money or removed it
    const isPositive = 
      item.type === 'Deposit' || 
      item.type.includes('Win') || 
      item.type.includes('Received') || 
      item.type.includes('Sold') || 
      item.type.includes('Credit') ||
      item.type.includes('Loan Approved');

    const color = isPositive ? CyberColors.glitchGreen : CyberColors.pink;
    const sign = isPositive ? '+' : '-';

    // Format the date to be more readable
    const dateStr = new Date(item.date).toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
      <View style={[styles.card, { borderLeftColor: color }]}>
        <View style={styles.infoContainer}>
          <Text style={styles.type}>{item.type.toUpperCase()}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <Text style={[styles.amount, { color }]}>
          {sign}{formatCurrency(item.amount)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>DATA LOGS</Text>
      
      {historyList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>NO DATA FOUND</Text>
        </View>
      ) : (
        <FlatList
          data={historyList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CyberColors.black,
    padding: 20,
  },
  header: {
    color: CyberColors.yellow,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    padding: 16,
    marginVertical: 4,
    borderLeftWidth: 3,
    // Add subtle divider line
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  infoContainer: {
    flex: 1,
  },
  type: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    color: 'grey',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'grey',
    fontFamily: 'monospace',
    letterSpacing: 1,
  }
});