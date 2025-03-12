const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courses');
const isAuth = require('../middlewares/isAuth');

router.get('/', courseController.getCourses);
router.post('/:courseId', isAuth, courseController.signupCourse);
router.delete('/:courseId', isAuth, courseController.cancelCourse);

module.exports = router