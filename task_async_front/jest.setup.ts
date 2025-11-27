import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  removeEventListeners: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  getCurrentConnectivity: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);