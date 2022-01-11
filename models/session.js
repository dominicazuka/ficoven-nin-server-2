const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema({
    
    device:{
        type: String, required: true
    },
    ip:{
        type: String, required: true
    },
    token:{
        type: String, required: true
    },
    isActive:{
        type: Boolean, required: true, default:true
    },
    userId:{
        type: String, required: true, ref:"user"
    },
    
},{
    timestamps : true,
})

sessionSchema.pre("save", async()=>{
  
})

const sessionModel = mongoose.model('session', sessionSchema)
module.exports = sessionModel;