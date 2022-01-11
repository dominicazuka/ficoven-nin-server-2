const { validationResult } = require('express-validator');

const validate = (validation) =>{
    return async(req,res,next)=>{
        await Promise.all(validation.map( v => v.run(req)));
        const result = validationResult(req);
        if(result.isEmpty()){
            return next();
        }
        const {errors} = result;
        let message = "";
        errors.forEach(element => {
            message += element.msg + ",";
        });
        return res.status(400).json({message})
    }
};

module.exports = validate;