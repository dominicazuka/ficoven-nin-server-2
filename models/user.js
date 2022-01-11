const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    
    name:{
        type: String, required: true
    },
    country:{
        type: String, required: true
    },
    countryCode:{
        type: String, required: true
    },
    role:{
        type: String, required: true
    },
    isAdmin:{
        type: Boolean, required: true, default:true
    },
    isBlocked:{
        type: Boolean, required: true, default:false
    },
    email:{
        type: String, required: true
    },
    phone_no:{
        type: String, required: true
    },
    password:{
        type: String, required: true
    },
    
},{
    timestamps : true,
})

userSchema.pre("save", async()=>{
  
})

const userModel = mongoose.model('user', userSchema)
module.exports = userModel