import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BankContext } from '../context/BankContext';
import { CyberButton } from '../components/CyberButton';
import { CyberColors } from '../constraints/colors';
import { Ionicons } from '@expo/vector-icons';

const ROWS = 8;
const { width } = Dimensions.get('window');
const PEG_SPACING = width / (ROWS + 2);
const ROW_HEIGHT = 40;
const START_Y = 50;

interface Ball {
  id: number;
  bet: number;
  path: { x: number; y: number }[]; 
  currentStep: number; 
  progress: number; 
}

export const Plinko = () => {
  const { updateGameBalance, currentUser } = useContext(BankContext);
  const navigation = useNavigation();
  const [bet, setBet] = useState('');
  const [balls, setBalls] = useState<Ball[]>([]);
  const [msg, setMsg] = useState('');
  
  const frameId = useRef<number>(0);

  // 1. The Game Loop
  useEffect(() => {
    const loop = () => {
      setBalls(prevBalls => {
        if (prevBalls.length === 0) return [];

        const nextBalls = prevBalls.map(b => {
          let newProgress = b.progress + 0.05; 
          let newStep = b.currentStep;

          if (newProgress >= 1) {
            newProgress = 0;
            newStep += 1;
          }

          return { ...b, currentStep: newStep, progress: newProgress };
        });

        const activeBalls: Ball[] = [];
        nextBalls.forEach(b => {
          if (b.currentStep >= b.path.length - 1) {
            finishBall(b);
          } else {
            activeBalls.push(b);
          }
        });

        return activeBalls;
      });

      frameId.current = requestAnimationFrame(loop);
    };

    frameId.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId.current);
  }, []);

  // 2. Logic to handle a finished ball
  const finishBall = (b: Ball) => {
    const multipliers = [10, 5, 2, 1, 0.5, 1, 2, 5, 10];
    
    // Get final bucket
    const finalNode = b.path[b.path.length - 1];
    const finalColIndex = Math.floor(finalNode.x + 4.5);
    const clampedIndex = Math.max(0, Math.min(8, finalColIndex));
    const mult = multipliers[clampedIndex];

    // Calculate Payout
    const payout = b.bet * mult;
    const netProfit = payout - b.bet;

    // UPDATE BALANCE: Add the payout amount (Profit + Original Bet portion)
    // We use 'true' (Win) because we are adding money back to the account.
    // Even if it's a loss (0.5x), we add back the 0.5 portion.
    if (payout > 0) {
        updateGameBalance(payout, true, "Plinko Payout");
    }

    // Update Message
    if (netProfit >= 0) {
      setMsg(`x${mult} | +${netProfit.toFixed(2)}`);
    } else {
      setMsg(`x${mult} | ${netProfit.toFixed(2)}`);
    }
  };

  // 3. Drop Logic 
  const drop = () => {
    const b = Number(bet);
    if (!currentUser || b > currentUser.balance || b <= 0) return;

    // UPDATE BALANCE: Deduct the bet IMMEDIATELY upon drop
    updateGameBalance(b, false, "Plinko Bet");

    // Generate Path
    const path = [{ x: 0, y: -1 }]; 
    let currentX = 0;

    for (let r = 0; r < ROWS; r++) {
      const dir = Math.random() > 0.5 ? 0.5 : -0.5;
      currentX += dir;
      path.push({ x: currentX, y: r });
    }
    path.push({ x: currentX, y: ROWS });

    const newBall: Ball = {
      id: Date.now(),
      bet: b,
      path: path,
      currentStep: 0,
      progress: 0,
    };

    setBalls(prev => [...prev, newBall]);
  };

  // 4. Rendering Helper
  const getBallPos = (b: Ball) => {
    const startNode = b.path[b.currentStep];
    const endNode = b.path[b.currentStep + 1] || startNode;

    const currentX = startNode.x + (endNode.x - startNode.x) * b.progress;
    const currentY = startNode.y + (endNode.y - startNode.y) * b.progress;

    const screenX = (width / 2) + (currentX * PEG_SPACING) - 6; 
    const screenY = (currentY * ROW_HEIGHT) + START_Y + (ROW_HEIGHT / 2);

    return { top: screenY, left: screenX };
  };

  const renderPegs = () => {
    let pegs = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= r; c++) {
        pegs.push(
          <View
            key={`${r}-${c}`}
            style={[
              styles.peg,
              {
                top: r * ROW_HEIGHT + START_Y,
                left: (width / 2) + (c - r / 2) * PEG_SPACING
              }
            ]}
          />
        );
      }
    }
    return pegs;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color={CyberColors.cyan} />
        </TouchableOpacity>
        <Text style={styles.title}>PLINKO</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Game Board */}
      <View style={styles.board}>
        {renderPegs()}

        {/* Render Balls */}
        {balls.map(b => (
          <View
            key={b.id}
            style={[styles.ball, getBallPos(b)]}
          />
        ))}

        {/* Render Buckets */}
        <View style={styles.buckets}>
          {[10, 5, 2, 1, 0.5, 1, 2, 5, 10].map((m, i) => (
            <Text
              key={i}
              style={[
                styles.bucketText,
                { left: (width / 2) + (i - 4) * PEG_SPACING }
              ]}
            >
              {m}x
            </Text>
          ))}
        </View>
      </View>

      <Text style={styles.msg}>{msg}</Text>

      <TextInput
        style={styles.input}
        placeholder="BET"
        placeholderTextColor="grey"
        keyboardType="numeric"
        value={bet}
        onChangeText={setBet}
      />

      <CyberButton text="DROP" onPress={drop} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CyberColors.black, alignItems: 'center' },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backBtn: { padding: 5 },
  title: { color: CyberColors.cyan, fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
  
  board: { height: 450, width: '100%', marginTop: 20 },
  
  peg: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginLeft: -3,
    marginTop: -3,
  },
  
  ball: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CyberColors.cyan,
    shadowColor: CyberColors.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'white',
  },

  buckets: {
    position: 'absolute',
    bottom: 50, 
    width: '100%',
    flexDirection: 'row',
    height: 20,
  },
  
  bucketText: {
    position: 'absolute',
    color: CyberColors.yellow,
    fontSize: 10,
    width: 30,
    textAlign: 'center',
    marginLeft: -15, 
  },
  
  input: {
    backgroundColor: '#222',
    color: 'white',
    width: 200,
    padding: 10,
    margin: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: CyberColors.cyan,
  },
  msg: { color: CyberColors.glitchGreen, fontSize: 20, fontWeight: 'bold' },
});