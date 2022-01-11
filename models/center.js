const mongoose = require("mongoose");
const centerSchema = mongoose.Schema({
    country:{
        type: String, required: true
    },
    countryCode:{
        type: String, required: true
    },
    name:{
        type:String, required:true
    },
    address:{
        type:String, required:true  
    },
    phone:{
        type:String, required:true
    },
    email:{
        type:String, required:true
    },
    time:{
        type:String, required:true
    },
    days:{
        type:String, required: true
    },
    location:{
        type:String, required: true
    }
    
},{
    timestamps:true,
})

const centerModel = mongoose.model('enrolmentcenter', centerSchema); 
module.exports = centerModel