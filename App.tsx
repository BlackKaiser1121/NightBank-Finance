import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BankProvider, BankContext } from './src/context/BankContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { UserDashboard } from './src/screens/UserDashboard';
import { AdminDashboard } from './src/screens/AdminDashboard';
import { SpinWheel } from './src/games/SpinWheel';
import { Plinko } from './src/games/Plinko';
import { Blackjack } from './src/games/Blackjack';
import { Slots } from './src/games/Slots';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { CyberColors } from './src/constraints/colors';

const Stack = createNativeStackNavigator();

const RootNav = () => {
  // We use the context to determine which screen to show
  const { currentUser, isLoading } = React.useContext(BankContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: CyberColors.black, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={CyberColors.cyan} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#050505' } }}>
        {/* If no user is logged in, show Auth Screen */}
        {!currentUser ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : currentUser.isAdmin ? (
          // If Admin, show Admin Dashboard
          <Stack.Screen name="Admin" component={AdminDashboard} />
        ) : (
          // If User, show User Dashboard and allow navigation to games
          <>
            <Stack.Screen name="User" component={UserDashboard} />
            <Stack.Screen name="SpinWheel" component={SpinWheel} />
            <Stack.Screen name="Plinko" component={Plinko} />
            <Stack.Screen name="Blackjack" component={Blackjack} />
            <Stack.Screen name="Slots" component={Slots} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    // Wrap the entire app in the BankProvider so data is accessible everywhere
    <BankProvider>
      <RootNav />
    </BankProvider>
  );
}