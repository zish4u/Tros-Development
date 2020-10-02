require('dotenv').config()
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {

    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {

        const bearer = bearerHeader.split(' ');

        const bearerToken = bearer[1];

        req.token = bearerToken;

        try {
            const decoded = jwt.verify(req.token, process.env.jwtSecret);
            req.user = decoded.user
            next();

        } catch (err) {

            res.status(401).json({
                status: "failure",
                error: "Token is not valid"
            });
        }
    } else {
        return res.status(401).json({
            status: "failure", error: "NO_TOKEN_AUTHORIZATION_DENIED"
        })
    }
}