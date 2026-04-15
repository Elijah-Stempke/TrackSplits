import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PREDEFINED_DISTANCES = [
  { id: 'p_100',   label: '100m',    meters: 100 },
  { id: 'p_200',   label: '200m',    meters: 200 },
  { id: 'p_300',   label: '300m',    meters: 300 },
  { id: 'p_400',   label: '400m',    meters: 400 },
  { id: 'p_600',   label: '600m',    meters: 600 },
  { id: 'p_800',   label: '800m',    meters: 800 },
  { id: 'p_1000',  label: '1000m',   meters: 1000 },
  { id: 'p_1200',  label: '1200m',   meters: 1200 },
  { id: 'p_1500',  label: '1500m',   meters: 1500 },
  { id: 'p_1600',  label: '1600m',   meters: 1600 },
  { id: 'p_mile',  label: '1 Mile',  meters: 1609.344 },
  { id: 'p_2000',  label: '2000m',   meters: 2000 },
  { id: 'p_3200',  label: '3200m',   meters: 3200 },
  { id: 'p_2mile', label: '2 Miles', meters: 3218.688 },
  { id: 'p_5000',  label: '5000m',   meters: 5000 },
  { id: 'p_10000', label: '10000m',  meters: 10000 },
];

const DEFAULT_ACTIVE_IDS = ['p_100', 'p_200', 'p_400', 'p_800', 'p_1600'];
// Default pace: ~1:40/400m, ~6:40/mile
const DEFAULT_PACE = 0.25;

// Pace range in seconds-per-meter
// 3:30/mile = 210s ÷ 1609.344m,  9:00/mile = 540s ÷ 1609.344m
export const DEFAULT_MIN_PACE = 210 / 1609.344;
export const DEFAULT_MAX_PACE = 540 / 1609.344;

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [paceSecPerMeter, setPaceSecPerMeter] = useState(DEFAULT_PACE);
  const [customDistances, setCustomDistances] = useState([]);
  const [activeIds, setActiveIds]             = useState(DEFAULT_ACTIVE_IDS);
  const [minPace, setMinPace]                 = useState(DEFAULT_MIN_PACE);
  const [maxPace, setMaxPace]                 = useState(DEFAULT_MAX_PACE);
  const [loaded, setLoaded]                   = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const raw = await AsyncStorage.getItem('trackSplitsSettings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.pace)            setPaceSecPerMeter(s.pace);
        if (s.customDistances) setCustomDistances(s.customDistances);
        if (s.activeIds)       setActiveIds(s.activeIds);
        if (s.minPace)         setMinPace(s.minPace);
        if (s.maxPace)         setMaxPace(s.maxPace);
      }
    } catch (e) {
      console.log('Load error:', e);
    } finally {
      setLoaded(true);
    }
  };

  const persist = async (pace, custom, active, min, max) => {
    try {
      await AsyncStorage.setItem('trackSplitsSettings', JSON.stringify({
        pace:            pace   ?? paceSecPerMeter,
        customDistances: custom ?? customDistances,
        activeIds:       active ?? activeIds,
        minPace:         min    ?? minPace,
        maxPace:         max    ?? maxPace,
      }));
    } catch (e) {}
  };

  const updatePace = (newPace) => {
    setPaceSecPerMeter(newPace);
    persist(newPace, null, null, null, null);
  };

  const updatePaceRange = (newMin, newMax) => {
    setMinPace(newMin);
    setMaxPace(newMax);
    const clamped = Math.max(newMin, Math.min(newMax, paceSecPerMeter));
    if (clamped !== paceSecPerMeter) setPaceSecPerMeter(clamped);
    persist(clamped, null, null, newMin, newMax);
  };

  const toggleDistance = (id) => {
    const next = activeIds.includes(id)
      ? activeIds.filter(a => a !== id)
      : [...activeIds, id];
    setActiveIds(next);
    persist(null, null, next, null, null);
  };

  const addCustomDistance = (dist) => {
    const nextCustom = [...customDistances, dist];
    const nextActive = [...activeIds, dist.id];
    setCustomDistances(nextCustom);
    setActiveIds(nextActive);
    persist(null, nextCustom, nextActive, null, null);
  };

  const removeCustomDistance = (id) => {
    const nextCustom = customDistances.filter(d => d.id !== id);
    const nextActive = activeIds.filter(a => a !== id);
    setCustomDistances(nextCustom);
    setActiveIds(nextActive);
    persist(null, nextCustom, nextActive, null, null);
  };

  const allDistances    = [...PREDEFINED_DISTANCES, ...customDistances];
  const activeDistances = activeIds
    .map(id => allDistances.find(d => d.id === id))
    .filter(Boolean);

  const reorderDistances = (newIds) => {
    setActiveIds(newIds);
    persist(null, null, newIds, null, null);
  };

  return (
    <AppContext.Provider value={{
      paceSecPerMeter,
      updatePace,
      minPace,
      maxPace,
      updatePaceRange,
      allDistances,
      activeDistances,
      activeIds,
      customDistances,
      toggleDistance,
      addCustomDistance,
      removeCustomDistance,
      reorderDistances,
      loaded,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);