const { lowerCase } = require("../util");

const checkPermission = (req, res, next) =>{
    try {
        const user = req.user;
        if(lowerCase(user.role) === lowerCase("Super")){
            return next();
        }
        return res.status(403).send("You do not have permission to perform this operation");
    } catch (error) {
        
    }
}

module.exports = checkPermission;