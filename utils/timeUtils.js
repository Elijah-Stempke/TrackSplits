// Format total seconds into readable time string
export const formatTime = (totalSeconds) => {
  if (totalSeconds <= 0) return '0.00s';

  if (totalSeconds < 60) {
    return totalSeconds.toFixed(2) + 's';
  }

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (totalSeconds < 3600) {
    const secStr = secs.toFixed(2).padStart(5, '0');
    return `${mins}:${secStr}`;
  }

  const hrs = Math.floor(totalSeconds / 3600);
  const remainMins = Math.floor((totalSeconds % 3600) / 60);
  const secStr = secs.toFixed(2).padStart(5, '0');
  return `${hrs}:${remainMins.toString().padStart(2, '0')}:${secStr}`;
};

// Parse time strings: "70", "1:10", "1:10.5", "1:01:10.5"
export const parseTimeString = (str) => {
  if (!str) return null;
  str = str.trim().replace(/s$/i, '');
  const parts = str.split(':');

  if (parts.length === 1) {
    const val = parseFloat(parts[0]);
    return isNaN(val) ? null : val;
  } else if (parts.length === 2) {
    const mins = parseInt(parts[0]);
    const secs = parseFloat(parts[1]);
    if (isNaN(mins) || isNaN(secs)) return null;
    return mins * 60 + secs;
  } else if (parts.length === 3) {
    const hrs = parseInt(parts[0]);
    const mins = parseInt(parts[1]);
    const secs = parseFloat(parts[2]);
    if (isNaN(hrs) || isNaN(mins) || isNaN(secs)) return null;
    return hrs * 3600 + mins * 60 + secs;
  }

  return null;
};

export const METERS_PER_MILE = 1609.344;
export const metersToMiles = (m) => m / METERS_PER_MILE;
export const milesToMeters = (mi) => mi * METERS_PER_MILE;
