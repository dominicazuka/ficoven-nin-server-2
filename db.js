const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        const mongoURL = 'mongodb+srv://omimek:omimek007@cluster0.zravg.mongodb.net/mern-ninenroll';

        await mongoose.connect(mongoURL, { useUnifiedTopology: true, useNewUrlParser: true });

        console.log('Mongo DB Connection Successful')
    } catch (error) {
        console.log('Mongo DB Connection Failed')
    }
}

module.exports = connectDb