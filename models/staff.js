const mongoose = require("mongoose");

const staffSchema = mongoose.Schema({
    
    name : {
        type: String,
        required: true
    }
}, {
    timestamps : true,
})

const staffModel = mongoose.model('staff', staffSchema)

module.exports = staffModel