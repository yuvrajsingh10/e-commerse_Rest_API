const mongoose = require('mongoose')

const uri = process.env.MONGODBURI
mongoose.set({strictQuery:false})

function initDbConnection(){
    return mongoose.connect(uri)
}

module.exports = initDbConnection