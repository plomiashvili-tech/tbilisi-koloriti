import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import MapScreen from './src/screens/MapScreen';
import MyReportsScreen from './src/screens/MyReportsScreen';
import AboutScreen from './src/screens/AboutScreen';
import CameraScreen from './src/screens/CameraScreen';
import SubmitScreen from './src/screens/SubmitScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import { RootStackParamList, TabParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#8D99AE',
        tabBarStyle: { borderTopColor: '#e8e8e8' },
        headerStyle: { backgroundColor: '#1D3557' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Tbilisi koloriti',
          tabBarLabel: 'Map',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="MyReports"
        component={MyReportsScreen}
        options={{
          title: 'My Reports',
          tabBarLabel: 'My Reports',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'About',
          tabBarLabel: 'About',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>ℹ️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1D3557' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ headerShown: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Submit"
          component={SubmitScreen}
          options={{ title: 'New Report' }}
        />
        <Stack.Screen
          name="ReportDetail"
          component={ReportDetailScreen}
          options={{ title: 'Report Details' }}
        />
        <Stack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={{ title: 'Privacy Policy' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
