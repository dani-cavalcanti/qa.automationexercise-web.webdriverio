const BasePage = require('./base.page');

/**
 * Page Object for the confirmation screen shown right after a successful
 * `Create Account` submission.
 */
class AccountCreatedPage extends BasePage {
  get accountCreatedMessage() {
    return $('[data-qa="account-created"]');
  }

  get continueButton() {
    return $('[data-qa="continue-button"]');
  }

  /**
   * Dismisses the confirmation screen, returning to the logged-in home page.
   * @returns {Promise<void>}
   */
  async continueToHome() {
    await this.continueButton.click();
  }
}

module.exports = new AccountCreatedPage();
