// This bigPromise technique can be used to avoid using try catch  or handling  promises every time
// This acts as a wrapper

module.exports = (func) => (req, res, next) =>
    Promise.resolve(func(req, res, next)).catch(next);
