import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { METERS_PER_MILE } from '../utils/timeUtils';

const QUICK_REFS = [
  { label: '100m',    meters: 100 },
  { label: '200m',    meters: 200 },
  { label: '300m',    meters: 300 },
  { label: '400m',    meters: 400 },
  { label: '600m',    meters: 600 },
  { label: '800m',    meters: 800 },
  { label: '1000m',   meters: 1000 },
  { label: '1500m',   meters: 1500 },
  { label: '1600m',   meters: 1600 },
  { label: '1 Mile',  meters: 1609.344 },
  { label: '2000m',   meters: 2000 },
  { label: '3200m',   meters: 3200 },
  { label: '2 Miles', meters: 3218.688 },
  { label: '5000m',   meters: 5000 },
  { label: '10000m',  meters: 10000 },
];

const fmt = (n, decimals) => {
  if (isNaN(n)) return '';
  return n.toFixed(decimals);
};

export default function ConversionScreen() {
  const [metersVal, setMetersVal] = useState('');
  const [milesVal,  setMilesVal]  = useState('');

  const onMetersChange = (val) => {
    setMetersVal(val);
    const n = parseFloat(val);
    setMilesVal(isNaN(n) ? '' : fmt(n / METERS_PER_MILE, 6));
  };

  const onMilesChange = (val) => {
    setMilesVal(val);
    const n = parseFloat(val);
    setMetersVal(isNaN(n) ? '' : fmt(n * METERS_PER_MILE, 4));
  };

  const loadRef = (meters) => {
    setMetersVal(String(meters));
    setMilesVal(fmt(meters / METERS_PER_MILE, 6));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Distance Converter</Text>

        {/* Converter card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Meters</Text>
          <TextInput
            style={styles.input}
            value={metersVal}
            onChangeText={onMetersChange}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#ced4da"
          />

          <View style={styles.swapRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.swapIcon}>⇅</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.fieldLabel}>Miles</Text>
          <TextInput
            style={[styles.input, styles.inputBlue]}
            value={milesVal}
            onChangeText={onMilesChange}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#ced4da"
          />
        </View>

        {/* Conversion factor note */}
        <Text style={styles.factorNote}>1 mile = 1,609.344 meters exactly</Text>

        {/* Quick reference grid */}
        <Text style={styles.section}>Quick Reference</Text>
        <View style={styles.grid}>
          {QUICK_REFS.map(ref => (
            <TouchableOpacity key={ref.label} style={styles.chip} onPress={() => loadRef(ref.meters)}>
              <Text style={styles.chipLabel}>{ref.label}</Text>
              <Text style={styles.chipMeters}>
                {Number.isInteger(ref.meters) ? ref.meters : ref.meters.toFixed(3)}m
              </Text>
              <Text style={styles.chipMiles}>
                {(ref.meters / METERS_PER_MILE).toFixed(4)} mi
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f8f9fa' },
  scroll:      { padding: 16, paddingBottom: 48 },
  header:      { fontSize: 26, fontWeight: '800', color: '#1a1a2e', marginBottom: 20 },

  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 20, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#adb5bd', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  input: {
    borderWidth: 2, borderColor: '#e63946', borderRadius: 12,
    padding: 14, fontSize: 24, fontWeight: '700', color: '#1a1a2e',
  },
  inputBlue: { borderColor: '#4a90e2' },
  swapRow:     { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#f1f3f5' },
  swapIcon:    { fontSize: 22, color: '#adb5bd', marginHorizontal: 10 },

  factorNote:  { fontSize: 12, color: '#adb5bd', textAlign: 'center', marginBottom: 24 },
  section:     { fontSize: 11, fontWeight: '700', color: '#adb5bd', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },

  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12, width: '47.5%',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  chipLabel:   { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 3 },
  chipMeters:  { fontSize: 11, color: '#6c757d' },
  chipMiles:   { fontSize: 11, color: '#e63946', fontWeight: '600' },
});
