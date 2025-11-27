/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200
  },
});

function App() {
  return (
  <SafeAreaProvider style={styles.container}>
      <HomeScreen />
  </SafeAreaProvider>
  );
}

export default App;
