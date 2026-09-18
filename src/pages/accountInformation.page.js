const BasePage = require('./base.page');
const { Title } = require('../data/constants');

/**
 * Page Object for the "Enter Account Information" form shown after the
 * initial Name/Email signup step. This is the longest form in the flow, so
 * `fillAccountInformation` accepts a single user object (see
 * `src/data/userBuilder.js`) instead of a long positional-argument list.
 */
class AccountInformationPage extends BasePage {
  get titleMrRadio() {
    return $('#id_gender1');
  }

  get titleMrsRadio() {
    return $('#id_gender2');
  }

  get passwordInput() {
    return $('#password');
  }

  get birthDaySelect() {
    return $('#days');
  }

  get birthMonthSelect() {
    return $('#months');
  }

  get birthYearSelect() {
    return $('#years');
  }

  get newsletterCheckbox() {
    return $('#newsletter');
  }

  get receiveSpecialOffersCheckbox() {
    return $('#optin');
  }

  get firstNameInput() {
    return $('#first_name');
  }

  get lastNameInput() {
    return $('#last_name');
  }

  get companyInput() {
    return $('#company');
  }

  get address1Input() {
    return $('#address1');
  }

  get address2Input() {
    return $('#address2');
  }

  get countrySelect() {
    return $('#country');
  }

  get stateInput() {
    return $('#state');
  }

  get cityInput() {
    return $('#city');
  }

  get zipcodeInput() {
    return $('#zipcode');
  }

  get mobileNumberInput() {
    return $('#mobile_number');
  }

  get createAccountButton() {
    return $('button[data-qa="create-account"]');
  }

  /**
   * Selects the "Title" radio button matching the given value.
   * @param {string} title - One of `Title.MR` / `Title.MRS`.
   * @returns {Promise<void>}
   */
  async selectTitle(title) {
    const radio = title === Title.MRS ? this.titleMrsRadio : this.titleMrRadio;
    await radio.click();
  }

  /**
   * Sets a checkbox to a desired checked state, only clicking it when the
   * current state differs (checkboxes on this form are pre-checked by
   * default).
   * @param {WebdriverIO.Element} checkbox
   * @param {boolean} shouldBeChecked
   * @returns {Promise<void>}
   */
  async setCheckbox(checkbox, shouldBeChecked) {
    const isChecked = await checkbox.isSelected();
    if (isChecked !== shouldBeChecked) {
      await checkbox.click();
    }
  }

  /**
   * Fills in the entire account information form and submits it.
   * @param {object} user - Plain user object produced by `UserBuilder.build()`.
   * @returns {Promise<void>}
   */
  async fillAccountInformation(user) {
    await this.selectTitle(user.title);
    await this.passwordInput.setValue(user.password);

    await this.birthDaySelect.selectByVisibleText(user.birthDay);
    await this.birthMonthSelect.selectByVisibleText(user.birthMonth);
    await this.birthYearSelect.selectByVisibleText(user.birthYear);

    await this.setCheckbox(this.newsletterCheckbox, user.newsletter);
    await this.setCheckbox(this.receiveSpecialOffersCheckbox, user.receiveSpecialOffers);

    await this.firstNameInput.setValue(user.firstName);
    await this.lastNameInput.setValue(user.lastName);
    await this.companyInput.setValue(user.company);
    await this.address1Input.setValue(user.address1);
    await this.address2Input.setValue(user.address2);
    await this.countrySelect.selectByVisibleText(user.country);
    await this.stateInput.setValue(user.state);
    await this.cityInput.setValue(user.city);
    await this.zipcodeInput.setValue(user.zipcode);
    await this.mobileNumberInput.setValue(user.mobileNumber);

    await this.createAccountButton.click();
  }
}

module.exports = new AccountInformationPage();
