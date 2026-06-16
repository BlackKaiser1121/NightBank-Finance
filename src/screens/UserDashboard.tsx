import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeTab } from './tabs/HomeTab';
import { GamesTab } from './tabs/GamesTab';
import { InvestTab } from './tabs/InvestTab';
import { ProfileTab } from './tabs/ProfileTab';
import { CyberColors } from '../constraints/colors';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const UserDashboard = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: 'black', borderTopColor: CyberColors.pink, borderTopWidth: 1 },
        tabBarActiveTintColor: CyberColors.yellow,
        tabBarInactiveTintColor: 'white',
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'square';
          if (route.name === 'Dashboard') iconName = 'grid';
          else if (route.name === 'Arcade') iconName = 'game-controller';
          else if (route.name === 'Market') iconName = 'trending-up';
          else if (route.name === 'ID') iconName = 'finger-print';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeTab} />
      <Tab.Screen name="Arcade" component={GamesTab} />
      <Tab.Screen name="Market" component={InvestTab} />
      <Tab.Screen name="ID" component={ProfileTab} />
    </Tab.Navigator>
  );
};