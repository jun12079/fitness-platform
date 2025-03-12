const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const isAuth = require('../middlewares/isAuth')

router.post('/signup', userController.createUser)
router.post('/login', userController.userLogin)
router.get('/profile', isAuth, userController.getUserProfile)
router.put('/profile', isAuth, userController.updateUserProfile)
router.get('/credit-package', isAuth, userController.getUserCreditPackage)
router.put('/password', isAuth, userController.changePassword)
router.get('/courses', isAuth, userController.getUserCourses)

module.exports = router