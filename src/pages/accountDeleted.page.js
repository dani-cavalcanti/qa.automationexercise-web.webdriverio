const BasePage = require('./base.page');

/**
 * Page Object for the confirmation screen shown after `Delete Account`,
 * which is the final assertion point of the registration test case.
 */
class AccountDeletedPage extends BasePage {
  get accountDeletedMessage() {
    return $('[data-qa="account-deleted"]');
  }

  get continueButton() {
    return $('[data-qa="continue-button"]');
  }
}

module.exports = new AccountDeletedPage();
