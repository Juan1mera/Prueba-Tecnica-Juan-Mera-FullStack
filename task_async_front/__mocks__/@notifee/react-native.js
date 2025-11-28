const notifee = {
  requestPermission: jest.fn(() => Promise.resolve({})),
  createChannel: jest.fn(() => Promise.resolve('channel_id')),
  cancelNotification: jest.fn(() => Promise.resolve()),
  cancelAllNotifications: jest.fn(() => Promise.resolve()),
  scheduleNotification: jest.fn(() => Promise.resolve('notification_id')),
  displayNotification: jest.fn(() => Promise.resolve()),
  getTriggerNotifications: jest.fn(() => Promise.resolve([])),
  onForegroundEvent: jest.fn(),
  onBackgroundEvent: jest.fn(),
};

module.exports = notifee;