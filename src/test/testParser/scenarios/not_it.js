const jest = require('jest');

jest.describe('jestDescribe', () => {
    jest.test('aTest', () => {
        jest.expect(1+2).toBe(3);
    });
});