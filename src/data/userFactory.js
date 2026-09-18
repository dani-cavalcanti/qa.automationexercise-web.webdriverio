const { faker } = require('@faker-js/faker');
const { Title, Country } = require('./constants');

/**
 * @typedef {object} User
 * @property {string} title
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} birthDay
 * @property {string} birthMonth
 * @property {string} birthYear
 * @property {boolean} newsletter
 * @property {boolean} receiveSpecialOffers
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} company
 * @property {string} address1
 * @property {string} address2
 * @property {string} country
 * @property {string} state
 * @property {string} city
 * @property {string} zipcode
 * @property {string} mobileNumber
 */

/**
 * Builds a random, fully valid user for TC01's registration flow.
 *
 * The account information form spans ~19 fields; generating them here keeps
 * the test itself readable and, critically, guarantees a fresh, unique email
 * on every run - the application rejects a signup whose email already
 * exists, so a hardcoded fixture would make the test fail on a second run.
 *
 * @returns {User}
 */
function createRandomUser() {
  return {
    title: Title.MR,
    name: faker.person.fullName(),
    email: faker.internet.email({ provider: 'automationexercise.qa' }),
    password: faker.internet.password({ length: 10 }),
    birthDay: '10',
    birthMonth: 'May',
    birthYear: '1995',
    newsletter: true,
    receiveSpecialOffers: true,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    company: faker.company.name(),
    address1: faker.location.streetAddress(),
    address2: faker.location.secondaryAddress(),
    country: Country.UNITED_STATES,
    state: faker.location.state(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode('#####'),
    mobileNumber: faker.string.numeric(10),
  };
}

module.exports = { createRandomUser };
