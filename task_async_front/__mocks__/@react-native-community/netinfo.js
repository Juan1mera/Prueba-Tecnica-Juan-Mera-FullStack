const NetInfo = {
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: null,
  })),
  addEventListener: jest.fn(() => jest.fn()), 
  removeEventListener: jest.fn(),
  configure: jest.fn(),
  useNetInfo: () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: null,
  }),
};

module.exports = NetInfo;