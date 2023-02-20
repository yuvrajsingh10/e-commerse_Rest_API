const Product = require('../db/models/productModel')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')


const createProduct = asyncHandler(async (req, res) => {
    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title)
        }
        const product = req.body
        console.log(product)
        const newProduct = await Product.create(req.body) 
        console.log(newProduct)
        res.json(newProduct)
    }catch(error){
        console.log(error)
        throw new Error("There is some error in the creatinon of product",error)
    }
})


// ?? updating product details
 const updateProduct =asyncHandler(async(req,res)=>{

    try {
        if(req.body.title){
            req.body.slug=slugify(req.body.title)
        }
        const _id = req.params.id
        const updateProduct = await Product.findByIdAndUpdate(_id,req.body,{new:true})

        res.json(updateProduct)
    } catch (error) {
        throw new Error(error)
    }

})


// ?? delete product 
 const deleteProduct =asyncHandler(async(req,res)=>{

    try {

        const _id = req.params.id
        const deleteProduct = await Product.findByIdAndDelete(_id)
        res.json(deleteProduct)
    } catch (error) {
        throw new Error(error)
    }
 })

// ?? gettins Product details
const getAProduct =asyncHandler(async(req,res)=>{
    try {
        const _id = req.params.id
        const findProduct = await Product.findById(_id)
        res.json(findProduct) 
    } catch (error) {
        throw new Error(error)
    }
})

const getAllProducts = asyncHandler(async(req,res)=>{
    try{

        // Filtering the product  
        const queryObj = {...req.query}
        const excludeFields = ['page','limit',"sort","fields"]
        excludeFields.forEach((el)=>delete queryObj[el])
        let queryStr =JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|gt|lte|le) \b/g ,(match) =>`$${match}`)
        let query = Product.find(JSON.parse(queryStr));
    



        // ??? Sorting
        if(req.query.sort){
            const sortBy =req.query.sort.split(',').join(" ")
            const query = query.sort(sortBy)
        }else{
            query = query.sort("createdBy")
        }

        // ??? Limiting the fields
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ")
            query = query.select(fields)
        }
        else{
            query = query.select("-__v")
        }


        // ??? Pagination
        const page= req.query.page
        const limit = req.query.limit
        const skip = (page-1)*limit
        query = query.skip(skip).limit(limit)
        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip>=productCount ) throw new Error("This page is not exist")
        }

        //  Executing Query
        const getAllProduct = await query 
        res.json(getAllProduct)
    }catch(error){
        console.log(error)
        throw new Error(error);
    }
})
module.exports = { createProduct , getAProduct , getAllProducts ,updateProduct ,deleteProduct}