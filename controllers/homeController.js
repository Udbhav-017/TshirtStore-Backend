const BigPromise = require('../middlewares/bigPromises');

exports.home = BigPromise(async (req, res) => {
    // const db = await do something()
    
    res.status(200).json({
        success: true,
        greeting: "Hello from API",
    });
});