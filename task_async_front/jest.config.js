module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],

  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '@react-navigation|' +
      '@react-native|' +
      'react-native|' +
      'react-native-.*|' +
      '@react-native-community|' +
      '@notifee|' +
      'notifee|' +
      'zustand|' +
      '@react-native-async-storage' +
    ')/)',
  ],

  moduleNameMapper: {
    '^@notifee/react-native$': '<rootDir>/__mocks__/@notifee/react-native.js',
    '^notifee$': '<rootDir>/__mocks__/@notifee/react-native.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '^@react-native-community/netinfo$': '<rootDir>/__mocks__/@react-native-community/netinfo.js',
  },

  clearMocks: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};