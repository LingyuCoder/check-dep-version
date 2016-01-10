'use strict';

require('should');
const checker = require('../index');
const _execSync = require('child_process').execSync;
const os = require('os');
const path = require('path');

function execSync(cmd) {
  _execSync(cmd, {
    stdio: 'pipe'
  });
}

describe('check-dep-version', () => {
  describe('success', () => {
    it('should resolve an object with success true if all versions matched', () => {
      return checker().should.fulfilledWith({
        success: true,
        detail: []
      });
    });
  });
  describe('fail', () => {
    beforeEach(() => {
      execSync('npm install --save-dev wordwrap@1.0.0');
      execSync('npm install --save minimist@1.2.0');
      execSync('npm install wordwrap@0.0.3');
      execSync('npm install minimist@0.0.1');
    });
    afterEach(() => {
      execSync('npm uninstall --save-dev wordwrap');
      execSync('npm uninstall --save minimist');
    });
    it('should resolve an object with success false if some versions not matched', () => {
      return checker().should.fulfilledWith({
        success: false,
        detail: [{
          name: 'minimist',
          version: '0.0.1',
          expected: '^1.2.0'
        }, {
          name: 'wordwrap',
          version: '0.0.3',
          expected: '^1.0.0'
        }]
      });
    });
  });
  describe('error', () => {
    it('should reject with an error when package.json could not be found', () => {
      return checker(os.tmpdir()).should.be.rejectedWith(Error);
    });
    it('should reject with an error when package.json could not be parsed', () => {
      return checker(path.join(__dirname, 'error')).should.be.rejectedWith(Error);
    });
  });
});
