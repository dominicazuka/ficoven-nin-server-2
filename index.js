require('dotenv').config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const app = express();

 
const connectDb = require('./db');
const servicesRoute = require ('./routes/servicesRoute')
const usersRoute = require('./routes/userRoute')
const bookingsRoute = require('./routes/bookingsRoute')
const centersRoute = require('./routes/centerRoute');
const paymentsRoute = require('./routes/paymentsRoute');
const { appOrigin } = require('./config');
const ipMiddleware = require('./middleware/ip.middleware');


connectDb()
app.use(compression())
app.use(helmet())
app.use(cors({credentials:true, origin: appOrigin}))
app.use(express.json()) 
app.use(ipMiddleware)
app.use('/api/services', servicesRoute)
app.use('/api/users', usersRoute)
app.use('/api/bookings', bookingsRoute)
app.use('/api/centers', centersRoute)
app.use('/api/payments', paymentsRoute)



const port = process.env.port || 5000;




app.listen(port, () => console.log('Node server started using nodemon'));