import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { CATEGORIES, ReportCategory } from '../types';

interface Props {
  selected: ReportCategory | null;
  onSelect: (category: ReportCategory) => void;
}

export default function CategoryPicker({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CATEGORIES.map((cat) => {
        const active = selected === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.chip,
              { borderColor: cat.color },
              active && { backgroundColor: cat.color },
            ]}
            onPress={() => onSelect(cat.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{cat.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#fff',
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D3557',
  },
  labelActive: {
    color: '#fff',
  },
});
