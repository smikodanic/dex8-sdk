module.exports = {
  viewport: {
    width: 2100,
    height: 800
  },
  puppeteer: {
    executablePath: '/usr/bin/google-chrome',
    headless: false,
    devtools: false,
    dumpio: false,
    slowMo: 25,
    args: [
      '--ash-host-window-bounds=1300x800',
      '--window-size=1300,800',
      '--window-position=700,100'
    ]
  }
};
