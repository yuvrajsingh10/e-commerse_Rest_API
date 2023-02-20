const express = require('express')
const { createProduct, getAProduct, getAllProducts, updateProduct, deleteProduct } = require('../controller/productCtrl')
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleWare')
const router = express.Router()

router.post('/',authMiddleware , isAdmin,createProduct)
router.get('/:id',getAProduct)
router.get('/',getAllProducts)
router.put('/:id',authMiddleware , isAdmin,updateProduct)
router.delete('/:id',authMiddleware , isAdmin,deleteProduct)

module.exports = router