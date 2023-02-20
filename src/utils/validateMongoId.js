const mongoose = require('mongoose')

const validateMongoId = (id)=>{
    const isValid = mongoose.Types.ObjectId.isValid(id)
    if(!isValid) throw new Error("This is is not Valid or Found")
}

module.exports = { validateMongoId }