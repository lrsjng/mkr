'use strict';

module.exports = function (suite) {
    suite.defaults(['t2']);
    suite.target('t0').task(function () {});
    suite.target('t1', ['t0'], 'some description').task(function () {});
    suite.target('t2', ['t1']).task(function () {});
};
