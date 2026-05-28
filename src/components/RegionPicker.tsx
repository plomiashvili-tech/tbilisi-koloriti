import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  FlatList, TextInput, SafeAreaView,
} from 'react-native';
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

  // Group header tracking
  let lastGroup = '';

  return (
    <>
      <TouchableOpacity style={styles.selector} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={value ? styles.selectorValue : styles.selectorPlaceholder}>
          {value || 'Select region / neighbourhood…'}
        </Text>
        <Text style={styles.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Region</Text>
            <TouchableOpacity onPress={() => { setOpen(false); setSearch(''); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.search}
            placeholder="Search…"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
            autoFocus
          />

          <FlatList
            data={filtered}
            keyExtractor={(r) => r.label}
            renderItem={({ item }) => {
              const showHeader = item.group !== lastGroup;
              lastGroup = item.group;
              return (
                <>
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
                </>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#e0e0e0', paddingHorizontal: 14, paddingVertical: 13,
  },
  selectorPlaceholder: { fontSize: 15, color: '#aaa', flex: 1 },
  selectorValue: { fontSize: 15, color: '#1D3557', fontWeight: '600', flex: 1 },
  arrow: { color: '#8D99AE', fontSize: 16 },
  modal: { flex: 1, backgroundColor: '#F1FAEE' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1D3557' },
  modalClose: { fontSize: 20, color: '#8D99AE', paddingHorizontal: 4 },
  search: {
    margin: 12, backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#e0e0e0',
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: '#1D3557',
  },
  groupHeader: {
    fontSize: 11, fontWeight: '800', color: '#8D99AE', textTransform: 'uppercase',
    letterSpacing: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  itemSelected: { backgroundColor: '#E63946' + '12' },
  itemText: { fontSize: 15, color: '#1D3557' },
  itemTextSelected: { fontWeight: '700', color: '#E63946' },
  check: { color: '#E63946', fontWeight: '700', fontSize: 16 },
});
