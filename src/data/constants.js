/**
 * Fixed domain values from automationexercise.com's account form.
 * Kept in one place so Page Objects and data builders never hardcode
 * the same literal string twice.
 */
const Title = Object.freeze({
  MR: 'Mr',
  MRS: 'Mrs',
});

/** Countries available in the "Country" dropdown on the account information form. */
const Country = Object.freeze({
  INDIA: 'India',
  UNITED_STATES: 'United States',
  CANADA: 'Canada',
  AUSTRALIA: 'Australia',
  ISRAEL: 'Israel',
  NEW_ZEALAND: 'New Zealand',
  SINGAPORE: 'Singapore',
});

module.exports = { Title, Country };
