const express = require('express')
const router = express.Router()
const coachesController = require('../controllers/coaches')

router.get('/', coachesController.getCoaches)
router.get('/:coachId/courses', coachesController.getCoachCourses)
router.get('/:coachId', coachesController.getCoach)

module.exports = router