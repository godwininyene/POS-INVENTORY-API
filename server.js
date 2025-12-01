const dotenv = require('dotenv');
dotenv.config({path:'./config.env'})
const app = require('./app');
const mongoose = require('mongoose');

let DB;


if (process.env.NODE_ENV === 'development') {
    DB = process.env.DB_LOCAL;
} else if (process.env.NODE_ENV === 'production') {
    DB = process.env.DB_LOCAL;
    // DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
}


mongoose.connect(DB).then(() => {console.log('DB connection successfully')})





const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log(`App is running on port ${port}`);
})