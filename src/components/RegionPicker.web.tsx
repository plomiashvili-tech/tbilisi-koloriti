import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { TBILISI_REGIONS } from '../types';

interface Props {
  value: string;
  onChange: (region: string) => void;
}

export default function RegionPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = TBILISI_REGIONS.filter((r) =>
    r.label.toLowerCase().includes(search.toLowerCase())
  );

  let lastGroup = '';

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.7}
      >
        <Text style={value ? styles.selectorValue : styles.selectorPlaceholder}>
          {value || 'Select region / neighbourhood…'}
        </Text>
        <Text style={styles.arrow}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          <TextInput
            style={styles.search}
            placeholder="Search…"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {filtered.map((item) => {
              const showHeader = item.group !== lastGroup;
              lastGroup = item.group;
              return (
                <View key={item.label}>
                  {showHeader && (
                    <Text style={styles.groupHeader}>{item.group}</Text>
                  )}
                  <TouchableOpacity
                    style={[styles.item, item.label === value && styles.itemSelected]}
                    onPress={() => { onChange(item.label); setOpen(false); setSearch(''); }}
                  >
                    <Text style={[styles.itemText, item.label === value && styles.itemTextSelected]}>
                      {item.label}
                    </Text>
                    {item.label === value && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, zIndex: 100 } as any,
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#e0e0e0', paddingHorizontal: 14, paddingVertical: 13,
  },
  selectorPlaceholder: { fontSize: 15, color: '#aaa', flex: 1 },
  selectorValue: { fontSize: 15, color: '#1D3557', fontWeight: '600', flex: 1 },
  arrow: { color: '#8D99AE', fontSize: 14 },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#e0e0e0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
    maxHeight: 280, overflow: 'hidden', zIndex: 200,
  } as any,
  search: {
    margin: 8, backgroundColor: '#f5f5f5', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: '#1D3557',
  },
  list: { maxHeight: 220 },
  groupHeader: {
    fontSize: 10, fontWeight: '800', color: '#8D99AE', textTransform: 'uppercase',
    letterSpacing: 1, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0',
  },
  itemSelected: { backgroundColor: '#E63946' + '12' },
  itemText: { fontSize: 14, color: '#1D3557' },
  itemTextSelected: { fontWeight: '700', color: '#E63946' },
  check: { color: '#E63946', fontWeight: '700' },
});
