
function authRole(role2, role3, role4) {
    return async (req, res, next) => {

        const foundUser = await User.findById(req.user.id);
        if (foundUser.role !== role2) {
            if (foundUser.role !== role3) {
                if (foundUser.role !== role4) {
                    res.status(401);
                    return res.json({ status: "failure", error: "ACCESS_IS_DENIED" });
                }
            }
        }
        next();
    }
}
module.exports = authRole;