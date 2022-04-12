const mongoose = require("mongoose"); 
const paymentSchema = mongoose.Schema({
    doc_id:{
        type: mongoose.Types.ObjectId, ref: "user", required: true
    },
    payment:{
        type:mongoose.Schema.Types.Mixed, required: true,
    },
    payment_type:{
        type: String,
    }
},{
    timestamps:true,
})

const paymentModel = mongoose.model('payment', paymentSchema); 
module.exports = paymentModel