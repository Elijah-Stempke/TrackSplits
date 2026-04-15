# Track Splits — Build Instructions

## What this app does
- **Calculator tab**: Linked sliders + tap-to-type for 100m, 200m, 400m, 800m, 1600m (and more).
  Drag any slider → all other distances scale to match the same pace.
- **Settings tab**: Toggle predefined distances on/off. Add your own in meters or miles.
- **Converter tab**: Live meters ↔ miles converter with quick-reference chips.

All settings and pace persist between app launches.

---

## Prerequisites (one-time setup)

1. **Install Node.js** (v18 or newer)
   → https://nodejs.org  (download the LTS version)

2. **Install Expo CLI**
   ```
   npm install -g expo-cli eas-cli
   ```

3. **Create a free Expo account** at https://expo.dev (needed for cloud builds)

4. **Log in**
   ```
   eas login
   ```

---

## Setting up the project

1. Create a new Expo project:
   ```
   npx create-expo-app TrackSplits
   cd TrackSplits
   ```

2. **Replace** these files with the ones from the zip you downloaded:
   - `App.js`
   - `package.json`
   - `app.json`
   - `eas.json`
   - `babel.config.js`

3. **Copy these new folders** into the project root:
   - `context/` (contains AppContext.js)
   - `screens/` (contains CalculatorScreen.js, SettingsScreen.js, ConversionScreen.js)
   - `utils/`   (contains timeUtils.js)

4. Install dependencies:
   ```
   npm install
   ```

---

## Building the APK

```
eas build -p android --profile preview
```

- Expo builds it in the cloud (takes ~5–10 minutes)
- When done, you get a **download link** for the `.apk` file
- Transfer it to your phone, tap to install
  (You may need to enable "Install from unknown sources" in Android settings)

---

## Running locally for testing (optional)

Install the **Expo Go** app on your phone, then:
```
npx expo start
```
Scan the QR code. The app runs live on your phone — no build needed.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `eas: command not found` | Run `npm install -g eas-cli` again |
| Slider not working | Make sure `@react-native-community/slider` installed correctly |
| Build fails | Try `npm install --legacy-peer-deps` |
| Settings not saving | AsyncStorage needs a rebuild after first install |
