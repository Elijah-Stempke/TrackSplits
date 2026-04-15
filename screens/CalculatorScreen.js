import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { formatTime, parseTimeString, METERS_PER_MILE } from '../utils/timeUtils';
import ZoomSlider from '../components/ZoomSlider';

export default function CalculatorScreen() {
  const { paceSecPerMeter, updatePace, activeDistances, minPace, maxPace } = useApp();
  const [editTarget, setEditTarget] = useState(null);
  const [editText, setEditText]     = useState('');

  const getTime = (meters) => paceSecPerMeter * meters;

  const handleSlider = useCallback((meters, sliderValue) => {
    const newPace = sliderValue / meters;
    updatePace(Math.max(minPace, Math.min(maxPace, newPace)));
  }, [updatePace, minPace, maxPace]);

  const openEdit = (distance) => {
    const t = formatTime(getTime(distance.meters));
    setEditTarget(distance);
    setEditText(t.replace(/s$/, ''));
  };

  const submitEdit = () => {
    if (!editTarget) return;
    const seconds = parseTimeString(editText);
    if (!seconds || seconds <= 0) {
      Alert.alert('Invalid Time', 'Use M:SS.ss (e.g. 1:10.5) or total seconds (e.g. 70.5)');
      return;
    }
    const newPace = seconds / editTarget.meters;
    updatePace(Math.max(minPace, Math.min(maxPace, newPace)));
    setEditTarget(null);
  };

  const pacePerMile = paceSecPerMeter * METERS_PER_MILE;
  const pacePerKm   = paceSecPerMeter * 1000;

  if (activeDistances.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏃</Text>
          <Text style={styles.emptyTitle}>No distances selected</Text>
          <Text style={styles.emptySub}>Go to the Settings tab to choose distances.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.header}>Split Calculator</Text>

        {/* Global pace display */}
        <View style={styles.paceCard}>
          <View style={styles.paceItem}>
            <Text style={styles.paceLabel}>per mile</Text>
            <Text style={styles.paceValue}>{formatTime(pacePerMile)}</Text>
          </View>
          <View style={styles.paceDivider} />
          <View style={styles.paceItem}>
            <Text style={styles.paceLabel}>per km</Text>
            <Text style={styles.paceValue}>{formatTime(pacePerKm)}</Text>
          </View>
        </View>

        <Text style={styles.hint}>Hold slider to zoom in · Tap time to type</Text>

        {activeDistances.map((dist) => {
          const timeVal  = getTime(dist.meters);
          const sliderMin = minPace * dist.meters;
          const sliderMax = maxPace * dist.meters;

          return (
            <View key={dist.id} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.distLabel}>{dist.label}</Text>
                <TouchableOpacity onPress={() => openEdit(dist)} style={styles.timeBtn}>
                  <Text style={styles.timeText}>{formatTime(timeVal)}</Text>
                </TouchableOpacity>
              </View>
              <ZoomSlider
                minimumValue={sliderMin}
                maximumValue={sliderMax}
                value={timeVal}
                onValueChange={(v) => handleSlider(dist.meters, v)}
                style={styles.slider}
              />
            </View>
          );
        })}

      </ScrollView>

      {/* Edit time modal */}
      <Modal visible={!!editTarget} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBg}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Set {editTarget?.label} time</Text>
            <Text style={styles.modalHint}>Format: 1:10.5  or  70.5 (seconds)</Text>
            <TextInput
              style={styles.modalInput}
              value={editText}
              onChangeText={setEditText}
              keyboardType="numbers-and-punctuation"
              autoFocus
              selectTextOnFocus
              onSubmitEditing={submitEdit}
              returnKeyType="done"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setEditTarget(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitEdit} style={styles.applyBtn}>
                <Text style={styles.applyTxt}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f8f9fa' },
  scroll:      { padding: 16, paddingBottom: 48 },
  header:      { fontSize: 26, fontWeight: '800', color: '#1a1a2e', marginBottom: 14 },
  hint:        { fontSize: 12, color: '#adb5bd', marginBottom: 14, textAlign: 'center' },

  paceCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  paceItem:    { flex: 1, alignItems: 'center' },
  paceLabel:   { fontSize: 11, color: '#adb5bd', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  paceValue:   { fontSize: 20, fontWeight: '700', color: '#fff' },
  paceDivider: { width: 1, height: 36, backgroundColor: '#2e2e4e' },

  row: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  rowHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  distLabel:  { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  timeBtn:    { backgroundColor: '#e63946', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  timeText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  slider:     { width: '100%', height: 36 },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon:  { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#495057', marginBottom: 8 },
  emptySub:   { fontSize: 14, color: '#adb5bd', textAlign: 'center' },

  modalBg:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  modalBox:   { backgroundColor: '#fff', borderRadius: 18, padding: 24, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  modalHint:  { fontSize: 12, color: '#adb5bd', marginBottom: 14 },
  modalInput: {
    borderWidth: 2, borderColor: '#e63946', borderRadius: 10,
    padding: 14, fontSize: 22, textAlign: 'center',
    fontWeight: '600', color: '#1a1a2e', marginBottom: 16,
  },
  modalBtns:  { flexDirection: 'row', gap: 10 },
  cancelBtn:  { flex: 1, padding: 13, borderRadius: 10, backgroundColor: '#f1f3f5', alignItems: 'center' },
  cancelTxt:  { color: '#495057', fontWeight: '600', fontSize: 15 },
  applyBtn:   { flex: 1, padding: 13, borderRadius: 10, backgroundColor: '#e63946', alignItems: 'center' },
  applyTxt:   { color: '#fff', fontWeight: '700', fontSize: 15 },
});