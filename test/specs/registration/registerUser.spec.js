const allureReporter = require('@wdio/allure-reporter').default;
const homePage = require('../../../src/pages/home.page');
const loginSignupPage = require('../../../src/pages/loginSignup.page');
const accountInformationPage = require('../../../src/pages/accountInformation.page');
const accountCreatedPage = require('../../../src/pages/accountCreated.page');
const accountDeletedPage = require('../../../src/pages/accountDeleted.page');
const { createRandomUser } = require('../../../src/data/userFactory');

describe('Registration', () => {
  it('TC01 - should register a new user and delete the account', async () => {
    allureReporter.addFeature('Registration');
    allureReporter.addSeverity('critical');
    allureReporter.addDescription(
      'Registers a new user with a full, valid account profile and confirms the account can be ' +
        'deleted afterwards. See docs/test-design/TC01-user-registration.md for the underlying ' +
        'CTFL test design (equivalence partitioning, boundary value analysis, decision table).',
      'text'
    );

    // Arrange: a random, valid user - a unique email avoids the site's "Email Address already exist!" validation
    const user = createRandomUser();

    // Act: walk through the full signup -> account creation -> deletion flow.
    // Each phase is wrapped in an Allure step so the report reads as a
    // narrative of what happened, not just a single pass/fail line.
    await allureReporter.step('Open the home page and go to Signup / Login', async () => {
      await homePage.open();
      await homePage.goToSignupLogin();
    });

    await allureReporter.step('Start signup with name and email', async () => {
      await loginSignupPage.signUp(user.name, user.email);
    });

    await allureReporter.step('Fill in the account information form and create the account', async () => {
      await accountInformationPage.fillAccountInformation(user);
    });

    await allureReporter.step('Continue past the "ACCOUNT CREATED!" confirmation', async () => {
      await accountCreatedPage.continueToHome();
    });

    await allureReporter.step('Delete the account', async () => {
      await homePage.deleteAccount();
    });

    // Assert: the account deletion is confirmed on screen
    await allureReporter.step('Verify the account deletion is confirmed', async () => {
      await expect(accountDeletedPage.accountDeletedMessage).toBeDisplayed();
      await expect(accountDeletedPage.continueButton).toBeDisplayed();
    });
  });
});
