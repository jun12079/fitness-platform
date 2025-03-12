const express = require('express')
const router = express.Router()
const skillController = require('../controllers/skill')

router.get('/', skillController.getSkill)
router.post('/', skillController.createSkill)
router.delete('/:skillId', skillController.deleteSkill)

module.exports = router
