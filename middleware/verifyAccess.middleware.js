const { lowerCase } = require("../util");

const verifyAccess = (req, res, next) =>{
    try {
        const isSuperAdmin = ["super", "admin"];
        const user = req.user;
        if(isSuperAdmin.includes(lowerCase(user.role))){
            return next();
        }
        return res.status(403).send("You do not have permission to perform this operation");
    } catch (error) {
        
    }
}

module.exports = verifyAccess;