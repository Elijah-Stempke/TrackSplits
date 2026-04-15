import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp, PREDEFINED_DISTANCES } from '../context/AppContext';
import { milesToMeters, METERS_PER_MILE, formatTime, parseTimeString } from '../utils/timeUtils';

// Convert pace (s/m) → "M:SS" per mile string
const paceToMileString = (secPerMeter) => {
  const secPerMile = secPerMeter * METERS_PER_MILE;
  const mins = Math.floor(secPerMile / 60);
  const secs = Math.round(secPerMile % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

// Parse "M:SS" per mile → s/m
const mileStringToPace = (str) => {
  const secs = parseTimeString(str);
  if (!secs || secs <= 0) return null;
  return secs / METERS_PER_MILE;
};

export default function SettingsScreen() {
  const {
    activeIds, toggleDistance,
    customDistances, addCustomDistance, removeCustomDistance,
    minPace, maxPace, updatePaceRange,
  } = useApp();

  const [customDist, setCustomDist]     = useState('');
  const [customLabel, setCustomLabel]   = useState('');
  const [isMiles, setIsMiles]           = useState(false);
  const [fastInput, setFastInput]       = useState(paceToMileString(minPace));
  const [slowInput, setSlowInput]       = useState(paceToMileString(maxPace));
  const [paceError, setPaceError]       = useState('');

  const applyPaceRange = () => {
    const newMin = mileStringToPace(fastInput);
    const newMax = mileStringToPace(slowInput);
    if (!newMin || !newMax) {
      setPaceError('Use M:SS format, e.g. 3:30');
      return;
    }
    if (newMin >= newMax) {
      setPaceError('Fastest must be quicker than slowest');
      return;
    }
    setPaceError('');
    updatePaceRange(newMin, newMax);
    Alert.alert('Saved', `Range set: ${fastInput} – ${slowInput} per mile`);
  };

  const handleAdd = () => {
    const val = parseFloat(customDist);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid Distance', 'Please enter a positive number.');
      return;
    }
    const meters = isMiles ? milesToMeters(val) : val;
    const label  = customLabel.trim() || `${val}${isMiles ? ' mi' : 'm'}`;
    addCustomDistance({ id: `custom_${Date.now()}`, label, meters, isCustom: true });
    setCustomDist('');
    setCustomLabel('');
  };

  const confirmRemove = (dist) => {
    Alert.alert('Remove Distance', `Remove "${dist.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeCustomDistance(dist.id) },
    ]);
  };

  const CheckBox = ({ active }) => (
    <View style={[styles.checkbox, active && styles.checkboxOn]}>
      {active && <Text style={styles.checkmark}>✓</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.header}>Settings</Text>

        {/* ── Pace Range ── */}
        <Text style={styles.section}>Slider Pace Range (per mile)</Text>
        <View style={styles.addCard}>
          <View style={styles.paceRow}>
            <View style={styles.paceField}>
              <Text style={styles.paceFieldLabel}>Fastest</Text>
              <TextInput
                style={styles.paceInput}
                value={fastInput}
                onChangeText={setFastInput}
                keyboardType="numbers-and-punctuation"
                placeholder="3:30"
                placeholderTextColor="#adb5bd"
              />
            </View>
            <Text style={styles.paceDash}>→</Text>
            <View style={styles.paceField}>
              <Text style={styles.paceFieldLabel}>Slowest</Text>
              <TextInput
                style={styles.paceInput}
                value={slowInput}
                onChangeText={setSlowInput}
                keyboardType="numbers-and-punctuation"
                placeholder="9:00"
                placeholderTextColor="#adb5bd"
              />
            </View>
          </View>
          {!!paceError && <Text style={styles.paceError}>{paceError}</Text>}
          <TouchableOpacity style={styles.addBtn} onPress={applyPaceRange}>
            <Text style={styles.addBtnTxt}>Apply Pace Range</Text>
          </TouchableOpacity>
        </View>

        {/* ── Predefined distances ── */}
        <Text style={styles.section}>Predefined Distances</Text>
        {PREDEFINED_DISTANCES.map(dist => (
          <TouchableOpacity key={dist.id} style={styles.row} onPress={() => toggleDistance(dist.id)}>
            <View>
              <Text style={styles.rowLabel}>{dist.label}</Text>
              <Text style={styles.rowSub}>{dist.meters.toFixed(dist.meters % 1 === 0 ? 0 : 3)}m</Text>
            </View>
            <CheckBox active={activeIds.includes(dist.id)} />
          </TouchableOpacity>
        ))}

        {/* ── Custom distances ── */}
        {customDistances.length > 0 && (
          <>
            <Text style={[styles.section, { marginTop: 28 }]}>Custom Distances</Text>
            {customDistances.map(dist => (
              <View key={dist.id} style={styles.row}>
                <TouchableOpacity style={styles.rowLeft} onPress={() => toggleDistance(dist.id)}>
                  <Text style={styles.rowLabel}>{dist.label}</Text>
                  <Text style={styles.rowSub}>
                    {dist.meters.toFixed(2)}m · {(dist.meters / METERS_PER_MILE).toFixed(4)} mi
                  </Text>
                </TouchableOpacity>
                <View style={styles.rowRight}>
                  <TouchableOpacity onPress={() => toggleDistance(dist.id)}>
                    <CheckBox active={activeIds.includes(dist.id)} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmRemove(dist)} style={styles.deleteBtn}>
                    <Text style={styles.deleteTxt}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── Add custom distance ── */}
        <Text style={[styles.section, { marginTop: 28 }]}>Add Custom Distance</Text>
        <View style={styles.addCard}>

          {/* Meters / Miles toggle */}
          <View style={styles.toggle}>
            <Text style={[styles.toggleLabel, !isMiles && styles.toggleActive]}>Meters</Text>
            <Switch
              value={isMiles}
              onValueChange={setIsMiles}
              trackColor={{ false: '#e63946', true: '#4a90e2' }}
              thumbColor="#fff"
            />
            <Text style={[styles.toggleLabel, isMiles && styles.toggleActive]}>Miles</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder={isMiles ? 'Distance in miles (e.g. 0.5)' : 'Distance in meters (e.g. 800)'}
            placeholderTextColor="#adb5bd"
            value={customDist}
            onChangeText={setCustomDist}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Label (optional, e.g. 5K)"
            placeholderTextColor="#adb5bd"
            value={customLabel}
            onChangeText={setCustomLabel}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnTxt}>+ Add Distance</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f8f9fa' },
  scroll:       { padding: 16, paddingBottom: 48 },
  header:       { fontSize: 26, fontWeight: '800', color: '#1a1a2e', marginBottom: 20 },
  section:      { fontSize: 11, fontWeight: '700', color: '#adb5bd', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 6,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  rowLeft:    { flex: 1 },
  rowRight:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel:   { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  rowSub:     { fontSize: 11, color: '#adb5bd', marginTop: 1 },
  checkbox:   { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#dee2e6', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: '#e63946', borderColor: '#e63946' },
  checkmark:  { color: '#fff', fontSize: 13, fontWeight: '800' },
  deleteBtn:  { padding: 4 },
  deleteTxt:  { color: '#ced4da', fontSize: 15, fontWeight: '700' },

  addCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  toggle:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 },
  toggleLabel:  { fontSize: 14, color: '#adb5bd', fontWeight: '500' },
  toggleActive: { color: '#1a1a2e', fontWeight: '700' },
  input: {
    borderWidth: 1.5, borderColor: '#e9ecef', borderRadius: 10,
    padding: 12, fontSize: 15, color: '#1a1a2e', marginBottom: 10,
  },
  paceRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  paceField:      { flex: 1 },
  paceFieldLabel: { fontSize: 11, fontWeight: '700', color: '#adb5bd', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  paceInput: {
    borderWidth: 1.5, borderColor: '#e9ecef', borderRadius: 10,
    padding: 12, fontSize: 18, fontWeight: '700', color: '#1a1a2e', textAlign: 'center',
  },
  paceDash:  { fontSize: 18, color: '#adb5bd', marginTop: 18 },
  paceError: { color: '#e63946', fontSize: 12, marginBottom: 8, textAlign: 'center' },
  addBtn:    { backgroundColor: '#e63946', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 2 },
  addBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});