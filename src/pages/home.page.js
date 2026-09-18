const BasePage = require('./base.page');

/**
 * Page Object for the application landing page (`/`).
 * Exposes only the entry points TC01 needs from here: heading to the
 * signup/login area and, once authenticated, deleting the account.
 */
class HomePage extends BasePage {
  get signupLoginLink() {
    return $('a[href="/login"]');
  }

  get deleteAccountLink() {
    return $('a[href="/delete_account"]');
  }

  /**
   * Opens the home page.
   * @returns {Promise<void>}
   */
  async open() {
    await super.open('/');
  }

  /**
   * Navigates from the home page to the Signup / Login page.
   * @returns {Promise<void>}
   */
  async goToSignupLogin() {
    await this.signupLoginLink.click();
  }

  /**
   * Triggers account deletion for the currently logged-in user.
   * @returns {Promise<void>}
   */
  async deleteAccount() {
    await this.deleteAccountLink.waitForClickable();
    await this.deleteAccountLink.click();
  }
}

module.exports = new HomePage();
