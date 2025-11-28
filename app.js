const express = require('express')
const app = express();
const path = require('path')
const cors = require('cors');
const cookieParser = require('cookie-parser')
const AppError = require('./utils/appError')
const globalErrorController = require('./controllers/errorController')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const cartRouter = require('./routes/cartRoutes')
const saleRouter = require('./routes/saleRoutes')


//Implement cors
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // Allow credentials such as cookies
}));

// app.options('*', cors())
app.options('/*splat', cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));


//Body parser, read data from req.body into body
app.use(express.json());
app.use(cookieParser())
//Serve static files
// app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, 'public')))


//Mount routers
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/sales', saleRouter)


//Not found route
app.use('/*splat',(req, res, next) => {
    next(new AppError(`The requested URL ${req.originalUrl} was not found on this server!`,'', 404));
});

//Global error router
app.use(globalErrorController)

module.exports = app