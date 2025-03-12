const express = require('express')
const router = express.Router()
const creditPackageController = require('../controllers/creditPackage')
const isAuth = require('../middlewares/isAuth')

router.get('/', creditPackageController.getCreditPackage)
router.post('/', creditPackageController.createCreditPackage)
router.delete('/:creditPackageId', creditPackageController.deleteCreditPackage)
router.post('/:creditPackageId', isAuth, creditPackageController.postCreditPackage)

module.exports = router
