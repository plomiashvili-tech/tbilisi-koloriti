import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { register } from '../lib/auth.web';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await register(email, name, password);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e: any) {
      setError(e.message ?? 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <Text style={styles.appName}>Tbilisi koloriti</Text>
          <Text style={styles.tagline}>Join and help improve the city</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Free — no credit card needed</Text>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input} placeholder="e.g. Giorgi"
            placeholderTextColor="#aaa" value={name} onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input} placeholder="you@example.com"
            placeholderTextColor="#aaa" value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" autoComplete="email"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input} placeholder="Minimum 6 characters"
            placeholderTextColor="#aaa" value={password} onChangeText={setPassword}
            secureTextEntry autoComplete="new-password"
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input} placeholder="Repeat your password"
            placeholderTextColor="#aaa" value={confirm} onChangeText={setConfirm}
            secureTextEntry autoComplete="new-password" onSubmitEditing={handleRegister}
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Create Account →</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, backgroundColor: '#1D3557',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  hero: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 64, height: 64, borderRadius: 14, marginBottom: 10 },
  appName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  tagline: { fontSize: 13, color: '#A8DADC', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    width: '100%', maxWidth: 420,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1D3557', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#8D99AE', marginBottom: 16 },
  errorBox: { backgroundColor: '#FFE4E6', borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: '#E63946', fontSize: 13, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', color: '#1D3557', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 13, fontSize: 15, color: '#1D3557', backgroundColor: '#fafafa',
  },
  btn: {
    backgroundColor: '#E63946', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#457B9D', fontSize: 14, fontWeight: '600' },
});
