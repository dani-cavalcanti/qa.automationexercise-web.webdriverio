const BasePage = require('./base.page');

/**
 * Page Object for the `/login` page. Only the "New User Signup!" form is
 * modeled here, matching the scope of TC01 (this page also hosts a "Login
 * to your account" form, out of scope for the requested test case).
 */
class LoginSignupPage extends BasePage {
  get signupNameInput() {
    return $('input[data-qa="signup-name"]');
  }

  get signupEmailInput() {
    return $('input[data-qa="signup-email"]');
  }

  get signupButton() {
    return $('button[data-qa="signup-button"]');
  }

  /**
   * Fills in the initial signup form (name and email) and submits it.
   * @param {string} name - Full name of the user being registered.
   * @param {string} email - Email address used to start the signup.
   * @returns {Promise<void>}
   */
  async signUp(name, email) {
    await this.signupNameInput.setValue(name);
    await this.signupEmailInput.setValue(email);
    await this.signupButton.click();
  }
}

module.exports = new LoginSignupPage();
