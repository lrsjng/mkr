module.exports = suite => {
    suite.defaults(['t2']);
    suite.target('t0').task(() => {});
    suite.target('t1', ['t0'], 'some description').task(() => {});
    suite.target('t2', ['t1']).task(() => {});
};
