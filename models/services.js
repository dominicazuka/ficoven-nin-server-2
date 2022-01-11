const mongoose = require("mongoose");

const servicesSchema = mongoose.Schema({
    
    name : {
        type: String,
        required: true
    },

    amount : {
        type : Number,
        required: true
    },
    category : {
        type : String,
        required: true
    },

    description : {
        type : String,
        required: true
    },
    chargeAmount : {
        type : Number,
        required: true
    }
}, {
    timestamps : true,
})

const servicesModel = mongoose.model('service', servicesSchema)

module.exports = servicesModel