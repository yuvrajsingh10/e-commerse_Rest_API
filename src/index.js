const express = require('express')
const app = express();
const dotenv = require('dotenv').config();
const initDbConnection = require('./db/init')
const port = process.env.PORT || 3000;
const authRouter= require('./routes/authRoute')
const productRoute = require('./routes/productRoute')
const cookieParser = require('cookie-parser')
const notfound= require('./middlewares/errorHandler')
const errHandler= require('./middlewares/errorHandler');
const morgan = require('morgan')


app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use('/api/user', authRouter)
app.use('/api/product',productRoute)
app.use(notfound)
app.use(errHandler)


initDbConnection()
.then(()=>{
    console.log("Db Connection established")
    app.listen(port,()=>{
        console.log(`Server Running at PORT ${port}`)
    })
})
.catch(()=>{
    console.log('404 Error')
})


