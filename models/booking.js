const mongoose = require("mongoose"); 
const bookingSchema = mongoose.Schema({
    service:{
        type: String, required: true
    },
    location:{
        type: String, required: false
    },
    date:{
        type:String, required:true  
    },
    agentNumber:{
        type:String, required:true  
    },
    totalAmount:{
        type:Number, required:true
    },
    status:{
        type:String, required:true, default:'booked'
    },
    category:{
        type:String, required: true
    },
    userCenter:{
        type:String, required: true
    },
    country:{
        type:String, required: true
    },
    countryCode:{
        type:String, required: true
    },
    state:{
        type:String, required: true
    },
    city:{
        type:String, required: true
    },
    time:{
        type:String, required: true
    },
    user:{
        type:mongoose.Schema.Types.Mixed, required: true
    },
    organization:{
        type:String, required: true
    }
},{
    timestamps:true,
})

const bookingmodel = mongoose.model('booking', bookingSchema); 
module.exports = bookingmodel