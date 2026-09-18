const { join } = require('node:path');
const { rmSync } = require('node:fs');

/**
 * Whether the browser should run headless.
 * Headless is the default (required for CI); pass HEADLESS=false to watch the browser locally.
 */
const isHeadless = process.env.HEADLESS !== 'false';

/** Chrome flags applied only when running headless (CI and default local runs). */
const headlessArgs = ['--headless=new', '--window-size=1366,768', '--disable-gpu'];

/** Chrome flags applied on every run, headless or not. */
const commonArgs = ['--no-sandbox', '--disable-dev-shm-usage', '--disable-infobars'];

exports.config = {
  //
  // ==================
  // Runner Configuration
  // ==================
  runner: 'local',

  //
  // ==================
  // Specs & Suites
  // ==================
  // The challenge scopes automation to a single test case (TC01). `suites`
  // still names that group explicitly - satisfying "tests organized in
  // suites" without inventing extra suites that would just duplicate it.
  specs: ['./test/specs/registration/*.spec.js'],
  suites: {
    registration: ['./test/specs/registration/*.spec.js'],
  },
  exclude: [],

  //
  // ============
  // Capabilities
  // ============
  maxInstances: 5,
  capabilities: [
    {
      browserName: 'chrome',
      acceptInsecureCerts: true,
      // The app under test is a fast-navigating SPA-like site; WebDriver Bidi's
      // context tracking occasionally races those navigations ("execution
      // contexts cleared"). Classic WebDriver avoids that flakiness and is all
      // this suite needs.
      'wdio:enforceWebDriverClassic': true,
      'goog:chromeOptions': {
        args: [...commonArgs, ...(isHeadless ? headlessArgs : [])],
      },
    },
  ],

  //
  // ===================
  // Test Configurations
  // ===================
  logLevel: 'info',
  bail: 0,
  baseUrl: process.env.BASE_URL || 'https://automationexercise.com',
  // The app under test is a shared, public practice site: an occasional
  // one-off network/server blip is possible and unrelated to the code under
  // test. One automatic re-run of the whole spec file absorbs that noise
  // without masking a genuine, repeatable failure.
  specFileRetries: 1,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  //
  // ==================
  // Reporters
  // ==================
  // 'spec' prints live progress to the console; Allure is the persisted,
  // detailed report (raw results in reports/allure-results -
  // `npm run allure:generate`/`allure:open` build and view it - see README
  // for why that step needs Java, unlike running the tests themselves).
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: join('reports', 'allure-results'),
        // Verbose per-webdriver-command steps/screenshots add noise and slow
        // runs down; the suite's own addFeature/addDescription/step calls
        // plus the failure screenshot from `afterTest` are enough to debug a report.
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: true,
        useCucumberStepReporter: false,
      },
    ],
  ],

  //
  // =====
  // Hooks
  // =====

  /**
   * Clears stale Allure results from previous local runs so each execution
   * produces a single, unambiguous report instead of accumulating history
   * from earlier runs.
   */
  onPrepare: function cleanPreviousAllureResults() {
    rmSync(join(__dirname, 'reports', 'allure-results'), { recursive: true, force: true });
  },

  /**
   * Maximizes the browser window before each test file when running with a visible browser.
   * Headless runs already use a fixed viewport, so resizing is skipped there.
   */
  before: async function beforeEachSpec() {
    if (!isHeadless) {
      await browser.maximizeWindow();
    }
  },

  /**
   * Attaches a screenshot to the Allure report whenever a test fails, so failures
   * captured in CI (where there is no visible browser to inspect) remain debuggable.
   */
  afterTest: async function attachScreenshotOnFailure(test, context, result) {
    if (result.passed) {
      return;
    }

    const allureReporter = require('@wdio/allure-reporter').default;
    const screenshot = await browser.takeScreenshot();
    allureReporter.addAttachment('Screenshot on failure', Buffer.from(screenshot, 'base64'), 'image/png');
  },
};
