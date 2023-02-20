// NOT FOUND


function notFound  (req,res,next){
    const error = new Error(`NOT FOUND ${req.orginalUrl}`)
    res.status(404)
    next(error)
}


//  Error Handler

function errHandler (err,req,res,next){
    const statusCode = res.statusCode==200 ? 500: res.statusCode
    res.status(statusCode)
    res.json({
        msg:err?.message,
        stack:err.stack
    })
}

module.exports = errHandler,notFound