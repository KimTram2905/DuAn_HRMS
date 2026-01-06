module.exports = {
  launch: {
    headless: false, // Để false để bạn thấy browser bật lên chạy (dễ debug)
    slowMo: 50,      // Chậm lại xíu để nhìn cho kịp
    defaultViewport: null,
    args: ['--start-maximized'] // Mở full màn hình
  },
  browserContext: 'default',
};