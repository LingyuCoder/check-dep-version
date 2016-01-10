'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const co = require('co');
const semver = require('semver');

const loadPkg = dir => {
  let pkg;
  try {
    pkg = fs.readFileSync(path.join(dir, 'package.json'), 'utf-8');
  } catch (e) {
    if (e.message.indexOf('Cannot find module') !== -1)
      throw new Error(`Can not find package.json in ${dir}`);
    throw e;
  }
  try {
    pkg = JSON.parse(pkg);
  } catch (e) {
    throw new Error(`Can not parse package.json in ${dir}`);
  }
  return pkg;
};

const check = _.curryRight((dependencies, cwd) => {
  return _(dependencies)
    .pairs()
    .map(pair => {
      const name = pair[0];
      const ver = pair[1];
      const dir = path.join(cwd, 'node_modules', name);
      const depPkg = loadPkg(dir);
      if (ver && !semver.satisfies(depPkg.version, ver))
        return {
          name: depPkg.name,
          version: depPkg.version,
          expected: ver
        };
      return null;
    })
    .filter(v => !!v)
    .value();
});

module.exports = co.wrap(function*(cwd) {
  cwd = cwd || process.cwd();
  const pkg = loadPkg(cwd);
  let rst = [];
  const checker = check(cwd);
  rst = rst.concat(checker(pkg.dependencies || {}));
  rst = rst.concat(checker(pkg.devDependencies || {}));
  return {
    success: rst.length === 0,
    detail: rst
  };
});
