const express = require('express')
const router = express.Router();
const { registerUser, loginUser, getAllUser, getUser, deleteUser, updateUser, unblockUser,
    blockUser, handleRefreshToken, logoutUser, updatePassword, frogotPasswordToken } = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleWare');



router.post('/register', registerUser);

router.post('/login', loginUser)

router.get('/allUser', getAllUser)
router.get('/refresh', handleRefreshToken)
router.get('/getUser/:id', authMiddleware, isAdmin, getUser)
router.get('/logout', logoutUser)
router.post('/forgotPasswordToken',frogotPasswordToken)

router.delete('/deleteUser/:id', deleteUser)
router.put('/updatePassword', authMiddleware, updatePassword)
router.put('/updateUser', authMiddleware, isAdmin, updateUser)

router.put('/blockUser/:id', authMiddleware, isAdmin, blockUser)
router.put('/unblockUser/:id', authMiddleware, isAdmin, unblockUser)




module.exports = router