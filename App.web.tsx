import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import MapScreen from './src/screens/MapScreen';
import MyReportsScreen from './src/screens/MyReportsScreen';
import AboutScreen from './src/screens/AboutScreen';
import CameraScreen from './src/screens/CameraScreen';
import SubmitScreen from './src/screens/SubmitScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import LoginScreen from './src/screens/LoginScreen.web';
import RegisterScreen from './src/screens/RegisterScreen.web';

import { getCurrentUser, logout, ensureAdmin } from './src/lib/auth.web';
import { AuthContext } from './src/lib/authContext.web';
import { RootStackParamList, TabParamList } from './src/types';
import type { AuthUser } from './src/lib/auth.web';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs({ user, signOut }: { user: AuthUser; signOut: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#8D99AE',
        tabBarStyle: { borderTopColor: '#e8e8e8' },
        headerStyle: { backgroundColor: '#1D3557' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => (
          <TouchableOpacity onPress={signOut} style={{ marginRight: 16 }}>
            <Text style={{ color: '#A8DADC', fontSize: 13, fontWeight: '600' }}>
              {user.isAdmin ? '⚙️ Admin' : user.name} ↩
            </Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'Tbilisi koloriti', tabBarLabel: 'Map', tabBarIcon: () => <Text style={{ fontSize: 18 }}>🗺️</Text> }}
      />
      <Tab.Screen
        name="MyReports"
        component={MyReportsScreen}
        options={{ title: 'My Reports', tabBarLabel: 'My Reports', tabBarIcon: () => <Text style={{ fontSize: 18 }}>📋</Text> }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About', tabBarLabel: 'About', tabBarIcon: () => <Text style={{ fontSize: 18 }}>ℹ️</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    ensureAdmin().then(() => {
      setUser(getCurrentUser());
      setChecked(true);
    });
  }, []);

  function signOut() {
    logout();
    setUser(null);
  }

  function refreshUser() {
    setUser(getCurrentUser());
  }

  if (!checked) return null;

  return (
    <AuthContext.Provider value={{ user, signOut, refreshUser }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1D3557' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          {!user ? (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
                listeners={{ focus: () => { const u = getCurrentUser(); if (u) setUser(u); } }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
                listeners={{ focus: () => { const u = getCurrentUser(); if (u) setUser(u); } }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Main"
                options={{ headerShown: false }}
              >
                {() => <Tabs user={user} signOut={signOut} />}
              </Stack.Screen>
              <Stack.Screen
                name="Camera"
                component={CameraScreen}
                options={{ headerShown: false, animation: 'slide_from_bottom' }}
              />
              <Stack.Screen name="Submit" component={SubmitScreen} options={{ title: 'New Report' }} />
              <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Report Details' }} />
              <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy Policy' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
