import React, { useRef, useCallback, useEffect, useState } from 'react';
import { View, Animated, PanResponder, StyleSheet } from 'react-native';

const THUMB_R       = 14;
const TRACK_H       = 5;
const ZOOM_DELAY    = 700;
const ZOOM_FRACTION = 0.03;  // precision mode moves at 3% of normal speed
const ZOOM_BUFFER   = 1.5;   // seconds of wobble allowed before zoom triggers

// ─── Styled slider ────────────────────────────────────────────────────────────
//
// Always draws thumb in the FULL coordinate space (minimumValue→maximumValue).
// The zoom wrapper passes a zoomFraction (1.0 normal, ZOOM_FRACTION precision).
// In precision mode, dx maps to a smaller dVal — thumb moves slowly both
// visually AND in value — with NO position jump when zoom activates.
//
function StyledSlider({
  minimumValue, maximumValue, value,
  zoomFraction,
  onValueChange, onSlidingStart, onSlidingComplete,
  accentColor = '#e63946',
}) {
  const trackRef       = useRef(300);
  const minRef         = useRef(minimumValue);
  const maxRef         = useRef(maximumValue);
  const zoomRef        = useRef(zoomFraction);
  const curRef         = useRef(value);
  const dragging       = useRef(false);
  const lastDx         = useRef(0);

  const thumbAnim = useRef(new Animated.Value(0)).current;

  const valToPx = (val, min, max, w) =>
    Math.max(0, Math.min(w, ((val - min) / (max - min)) * w));

  useEffect(() => { minRef.current = minimumValue; }, [minimumValue]);
  useEffect(() => { maxRef.current = maximumValue; }, [maximumValue]);
  useEffect(() => { zoomRef.current = zoomFraction; }, [zoomFraction]);

  // Sync visual from parent when thumb is not held
  useEffect(() => {
    if (!dragging.current) {
      curRef.current = value;
      thumbAnim.setValue(valToPx(value, minimumValue, maximumValue, trackRef.current));
    }
  }, [value, minimumValue, maximumValue]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,

    onPanResponderGrant: (e) => {
      dragging.current = true;
      lastDx.current   = 0;
      // Do NOT seek to tap position — start from current value.
      // The thumb moves relative to wherever it already is.
      onSlidingStart?.(curRef.current);
    },

    onPanResponderMove: (e, g) => {
      const dx = g.dx - lastDx.current;
      lastDx.current = g.dx;

      // Scale dVal by zoomFraction — in precision mode same finger movement
      // produces a proportionally smaller value change AND visual movement
      const fullRange = maxRef.current - minRef.current;
      const dVal = (dx / trackRef.current) * fullRange * zoomRef.current;

      const newVal = Math.max(minRef.current, Math.min(maxRef.current, curRef.current + dVal));
      curRef.current = newVal;

      // Visual always in full coordinate space — no jump ever
      thumbAnim.setValue(valToPx(newVal, minRef.current, maxRef.current, trackRef.current));
      onValueChange?.(newVal);
    },

    onPanResponderRelease: () => {
      dragging.current = false;
      onSlidingComplete?.(curRef.current);
    },
  })).current;

  const handleLayout = (e) => {
    const w = e.nativeEvent.layout.width - THUMB_R * 2;
    trackRef.current = w;
    thumbAnim.setValue(valToPx(curRef.current, minRef.current, maxRef.current, w));
  };

  return (
    <View
      style={styles.container}
      onLayout={handleLayout}
      pointerEvents="box-only"
      {...panResponder.panHandlers}
    >
      <View style={[styles.trackBg, { left: THUMB_R, right: THUMB_R }]} />
      <Animated.View style={[styles.trackFill, {
        left:            THUMB_R,
        width:           thumbAnim,
        backgroundColor: accentColor,
      }]} />
      <Animated.View style={[styles.thumb, {
        left:            thumbAnim,
        backgroundColor: accentColor,
      }]} />
    </View>
  );
}

// ─── Zoom wrapper ─────────────────────────────────────────────────────────────
export default function ZoomSlider({
  minimumValue, maximumValue, value, onValueChange, style,
}) {
  const [zoomed, setZoomed]         = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const isSliding  = useRef(false);
  const canZoom    = useRef(false);
  const history    = useRef([]);
  const checkTimer = useRef(null);

  useEffect(() => {
    if (!isSliding.current) setLocalValue(value);
  }, [value]);

  const enterZoom = useCallback(() => {
    if (!canZoom.current) return;
    setZoomed(true);
  }, []);

  const exitZoom = useCallback(() => setZoomed(false), []);

  const startChecking = useCallback(() => {
    clearInterval(checkTimer.current);
    checkTimer.current = setInterval(() => {
      const now    = Date.now();
      const cutoff = now - ZOOM_DELAY;
      history.current = history.current.filter(p => p.t >= cutoff);
      if (history.current.length < 3) return;
      if (now - history.current[0].t < ZOOM_DELAY * 0.85) return;
      const vals   = history.current.map(p => p.v);
      const spread = Math.max(...vals) - Math.min(...vals);
      if (spread <= ZOOM_BUFFER) {
        enterZoom();
        clearInterval(checkTimer.current);
      }
    }, 80);
  }, [enterZoom]);

  const stopChecking = useCallback(() => {
    clearInterval(checkTimer.current);
    history.current = [];
  }, []);

  const handleSlidingStart = (v) => {
    isSliding.current = true;
    canZoom.current   = true;
    history.current   = [{ t: Date.now(), v }];
    startChecking();
  };

  const handleValueChange = useCallback((v) => {
    setLocalValue(v);
    onValueChange(v);
    const now    = Date.now();
    const cutoff = now - ZOOM_DELAY;
    history.current = history.current.filter(p => p.t >= cutoff);
    history.current.push({ t: now, v });
  }, [onValueChange]);

  const handleSlidingComplete = (v) => {
    canZoom.current   = false;
    isSliding.current = false;
    stopChecking();
    setLocalValue(v);
    onValueChange(v);
    exitZoom();
  };

  const color = zoomed ? '#2ecc71' : '#e63946';

  return (
    <StyledSlider
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      value={localValue}
      zoomFraction={zoomed ? ZOOM_FRACTION : 1.0}
      onSlidingStart={handleSlidingStart}
      onValueChange={handleValueChange}
      onSlidingComplete={handleSlidingComplete}
      accentColor={color}
      style={style}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    height:         THUMB_R * 2 + 8,
    justifyContent: 'center',
  },
  trackBg: {
    position:        'absolute',
    height:          TRACK_H,
    borderRadius:    TRACK_H / 2,
    backgroundColor: '#dee2e6',
  },
  trackFill: {
    position:     'absolute',
    height:       TRACK_H,
    borderRadius: TRACK_H / 2,
  },
  thumb: {
    position:     'absolute',
    top:           4,
    width:         THUMB_R * 2,
    height:        THUMB_R * 2,
    borderRadius:  THUMB_R,
    elevation:     4,
    shadowColor:  '#000',
    shadowOpacity: 0.2,
    shadowRadius:  3,
    shadowOffset: { width: 0, height: 2 },
  },
});