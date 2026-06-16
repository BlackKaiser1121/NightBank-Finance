import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // <--- Import
import { BankContext } from '../context/BankContext';
import { CyberButton } from '../components/CyberButton';
import { CyberColors } from '../constraints/colors';
import { PlayingCard } from '../types';
import { Ionicons } from '@expo/vector-icons'; // <--- Import

export const Blackjack = () => {
  const { currentUser, updateGameBalance } = useContext(BankContext);
  const navigation = useNavigation(); // <--- Init
  const [bet, setBet] = useState('');
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [active, setActive] = useState(false);
  const [msg, setMsg] = useState('');

  // ... (Helper functions: createDeck, getScore, end - keep these exactly as they were) ...
  const createDeck = () => {
    const suits = ['♥', '♦', '♣', '♠'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let newDeck: PlayingCard[] = [];
    for(let s of suits) {
      for(let r of ranks) {
        let val = parseInt(r);
        if (r === 'J' || r === 'Q' || r === 'K') val = 10;
        if (r === 'A') val = 11;
        newDeck.push({
            rank: r, suit: s, value: val, 
            color: (s === '♥' || s === '♦') ? CyberColors.pink : CyberColors.cyan
        });
      }
    }
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const getScore = (hand: PlayingCard[]) => {
    let score = hand.reduce((acc, card) => acc + card.value, 0);
    let aces = hand.filter(c => c.rank === 'A').length;
    while(score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  };

  const end = (win: boolean, amt: number) => {
    setActive(false);
    if(win && amt > 0) updateGameBalance(amt, true, "Blackjack");
    setMsg(win ? (amt > 0 ? "WINNER" : "PUSH") : "DEALER WINS");
  };

  const deal = () => {
    const b = Number(bet);
    if(!currentUser || b > currentUser.balance || b <= 0) return;
    
    updateGameBalance(b, false, "Entry"); 
    const d = createDeck();
    const pHand = [d.pop()!, d.pop()!];
    const dHand = [d.pop()!, d.pop()!];
    
    setDeck(d);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setActive(true);
    setMsg('');

    if(getScore(pHand) === 21) end(true, b * 2.5);
  };

  const hit = () => {
    const newCard = deck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    if(getScore(newHand) > 21) end(false, 0);
  };

  const stand = async () => {
    let dHand = [...dealerHand];
    let dDeck = [...deck];
    while(getScore(dHand) < 17) {
       dHand.push(dDeck.pop()!);
    }
    setDealerHand(dHand);
    const pScore = getScore(playerHand);
    const dScore = getScore(dHand);
    const b = Number(bet);
    if (dScore > 21 || pScore > dScore) {
        end(true, b * 2);
    } else if (pScore === dScore) {
        end(true, b);
    } else {
        end(false, 0);
    }
  };

  const renderCard = (c: PlayingCard, idx: number) => (
    <View key={idx} style={[styles.card, { borderColor: c.color }]}>
        <Text style={{color: c.color, fontWeight:'bold', fontSize: 16}}>{c.rank}</Text>
        <Text style={{color: c.color, fontSize: 24}}>{c.suit}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{alignItems: 'center'}}>
        {/* --- Header --- */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={28} color={CyberColors.cyan} />
            </TouchableOpacity>
            <Text style={styles.headerText}>BLACKJACK</Text>
            <View style={{ width: 28 }} />
        </View>
        
        {!active ? (
            <View style={{width: '100%', alignItems: 'center', marginTop: 50}}>
                <TextInput style={styles.input} placeholder="BET" placeholderTextColor="grey" keyboardType="numeric" value={bet} onChangeText={setBet} />
                <CyberButton text="DEAL" onPress={deal} />
                <Text style={styles.msg}>{msg}</Text>
            </View>
        ) : (
            <View style={{width: '100%', alignItems: 'center'}}>
                <Text style={{color: 'white', marginTop: 20}}>DEALER: {getScore(dealerHand)}</Text>
                <View style={styles.hand}>{dealerHand.map(renderCard)}</View>
                
                <Text style={{color: CyberColors.yellow, marginTop: 20}}>PLAYER: {getScore(playerHand)}</Text>
                <View style={styles.hand}>{playerHand.map(renderCard)}</View>

                <View style={{flexDirection: 'row', marginTop: 30}}>
                    <CyberButton text="HIT" onPress={hit} style={{marginRight: 10}} />
                    <CyberButton text="STAND" color={CyberColors.pink} onPress={stand} />
                </View>
            </View>
        )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CyberColors.black },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerText: { color: CyberColors.yellow, fontSize: 24, fontWeight: 'bold', letterSpacing: 3 },
  backBtn: { padding: 5 },
  input: { backgroundColor: '#222', color: 'white', width: 200, padding: 10, marginBottom: 20, textAlign: 'center', borderWidth: 1, borderColor: CyberColors.cyan },
  hand: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 10 },
  card: { width: 60, height: 90, backgroundColor: 'black', borderWidth: 2, borderRadius: 5, alignItems: 'center', justifyContent: 'center', margin: 5 },
  msg: { color: CyberColors.glitchGreen, fontSize: 24, marginTop: 20, fontWeight: 'bold' }
});