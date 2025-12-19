const buildCtx = host => ({
  req: {
    headers: {
      host,
      'x-forwarded-proto': 'http',
    },
    url: '/signin',
  },
});

describe('getWhitelabelProps localhost detection', () => {
  const originalWebsiteUrl = process.env.WEBSITE_URL;

  beforeAll(() => {
    process.env.WEBSITE_URL = 'https://opencollective.com';
  });

  afterAll(() => {
    process.env.WEBSITE_URL = originalWebsiteUrl;
  });

  it('does not treat domains containing "localhost" as localhost', () => {
    jest.isolateModules(() => {
      const { getWhitelabelProps } = require('../whitelabel');
      expect(getWhitelabelProps(buildCtx('evil-localhost.com')).isNonPlatformDomain).toBe(true);
      expect(getWhitelabelProps(buildCtx('phishing-localhost.attacker.com')).isNonPlatformDomain).toBe(true);
    });
  });

  it('treats loopback hostnames as localhost', () => {
    jest.isolateModules(() => {
      const { getWhitelabelProps } = require('../whitelabel');
      expect(getWhitelabelProps(buildCtx('localhost:3000')).isNonPlatformDomain).toBe(false);
      expect(getWhitelabelProps(buildCtx('127.0.0.1:3000')).isNonPlatformDomain).toBe(false);
      expect(getWhitelabelProps(buildCtx('[::1]:3000')).isNonPlatformDomain).toBe(false);
      expect(getWhitelabelProps(buildCtx('foo.localhost:3000')).isNonPlatformDomain).toBe(false);
    });
  });
});
