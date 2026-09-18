/**
 * Base class for every Page Object in the suite.
 *
 * Centralizing navigation here means new pages only implement what makes them
 * different (elements and actions), avoiding duplicated `browser.url()` calls
 * across the Page Object layer.
 */
class BasePage {
  /**
   * Navigates to a path relative to the configured `baseUrl`.
   * @param {string} [path=''] - Relative path, e.g. '/login'.
   * @returns {Promise<void>}
   */
  async open(path = '') {
    await browser.url(path);
  }
}

module.exports = BasePage;
