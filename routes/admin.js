const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin')
const isAuth = require('../middlewares/isAuth')
const isCoach = require('../middlewares/isCoach')

router.get('/coaches', isAuth, isCoach, adminController.getCoach)
router.put('/coaches', isAuth, isCoach, adminController.updateCoach)
router.get('/coaches/courses', isAuth, isCoach, adminController.getCoachCourses)
router.post('/coaches/courses', isAuth, isCoach, adminController.createCourse)
router.put('/coaches/courses/:courseId', isAuth, isCoach, adminController.updateCourse)
router.post('/coaches/:userId', adminController.setAsCoach)
router.get('/coaches/courses/:courseId', isAuth, isCoach, adminController.getCoachCourse)
router.get('/coaches/revenue', isAuth, isCoach, adminController.getCoachRevenue)

module.exports = router