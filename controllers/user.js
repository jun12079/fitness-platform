const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('User');
const { isValidString, isValidPassword } = require('../utils/validUtils');
const { generateJWT } = require('../utils/jwtUtils')
const appError = require('../utils/appError');
const bcrypt = require('bcrypt');
const { IsNull } = require('typeorm');
const saltRounds = 10;

const userController = {
    async createUser(req, res, next) {
        try {
            const { name, email, password } = req.body;
            if (!isValidString(name) || !isValidString(email) || !isValidString(password)) {
                next(appError(400, "欄位未填寫正確"));
                return;
            }
            if (!isValidPassword(password)) {
                next(appError(400, "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"));
                return;
            }

            const userRepo = dataSource.getRepository('User')
            const findUser = await userRepo.findOne({
                where: {
                    email
                }
            })
            if (findUser) {
                return next(appError(409, "Email已被使用"));
            }
            const hashPassword = bcrypt.hashSync(password, saltRounds)
            const newUser = userRepo.create({
                name,
                email,
                password: hashPassword,
                role: 'USER'
            })
            const result = await userRepo.save(newUser)

            res.status(201).json({
                status: "success",
                data: {
                    user: {
                        id: result.id,
                        name: result.name
                    }
                }
            })
        } catch (error) {
            logger.error(error)
            next(error)
        }
    },
    async userLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!isValidString(email) || !isValidString(password)) {
                return next(appError(400, "欄位未填寫正確"));
            }
            if (!isValidPassword(password)) {
                return next(appError(400, "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"));
            }


            const userRepo = dataSource.getRepository('User')
            // 使用者不存在或密碼輸入錯誤
            const findUser = await userRepo.findOne({
                select: ['id', 'name', 'role', 'password'],
                where: {
                    email
                }
            });
            if (!findUser) {
                return next(appError(400, "使用者不存在或密碼輸入錯誤"));
            }
            const isMatch = await bcrypt.compare(password, findUser.password)
            if (!isMatch) {
                return next(appError(400, "使用者不存在或密碼輸入錯誤"));
            }
            // TODO JWT
            const token = generateJWT({
                id: findUser.id,
                role: findUser.role
            })

            res.status(201).json({
                status: 'success',
                data: {
                    token,
                    user: {
                        name: findUser.name
                    }
                }
            })
        } catch (error) {
            logger.error('登入錯誤:', error)
            next(error)
        }
    },
    async getUserProfile(req, res, next) {
        try {
            const { id } = req.user;
            if (!isValidString(id)) {
                return next(appError(400, '欄位未填寫正確'));
            }
            const findUser = await dataSource.getRepository('User').findOne({
                where: {
                    id
                }
            })

            res.status(200).json({
                status: 'success',
                data: {
                    email: findUser.email,
                    name: findUser.name
                }
            })
        } catch (error) {
            logger.error('取得使用者資料錯誤:', error)
            next(error)
        }
    },
    async updateUserProfile(req, res, next) {
        try {
            const { id } = req.user;
            const { name } = req.body;
            if (!isValidString(name) || !/^[\p{L}]{2,10}$/u.test(name)) {
                return next(appError('400', '欄位未填寫正確'));
            }

            const userRepo = dataSource.getRepository('User')
            // TODO 檢查使用者名稱未變更
            const findUser = await userRepo.findOne({
                where: {
                    id
                }
            });
            if (findUser.name === name) {
                return next(appError(400, '使用者名稱未變更'));
            }

            const updateUser = await userRepo.update(
                {
                    id
                }
                ,
                {
                    name
                }
            );
            if (updateUser.affected === 0) {
                return next(appError(404, '使用者不存在'));
            }

            res.status(200).json({
                status: 'success',
            })

        } catch (error) {
            logger.error('取得使用者資料錯誤:', error)
            next(error)
        }
    },
    async getUserCreditPackage(req, res, next) {
        try {
            const { id } = req.user;
            const result = await dataSource
                .getRepository('CreditPurchase')
                .createQueryBuilder('credit_purchase')
                .leftJoinAndSelect('credit_purchase.CreditPackage', 'credit_package')
                .select([
                    'credit_purchase.purchased_credits AS purchased_credits',
                    'credit_purchase.price_paid AS price_paid',
                    'credit_package.name AS name',
                    'credit_purchase.purchase_at AS purchase_at'
                ])
                .where('credit_purchase.user_id = :id', { id })
                .getRawMany();

            res.status(200).json({
                status: 'success',
                data: result
            })
        } catch (error) {
            logger.error('伺服器錯誤:', error)
            next(error)
        }
    },
    async changePassword(req, res, next) {
        try {
            const { id } = req.user;
            const { password, new_password, confirm_new_password } = req.body;

            if (!isValidString(password) || !isValidString(new_password) || !isValidString(confirm_new_password)) {
                next(appError(400, "欄位未填寫正確"));
                return;
            }
            if (!isValidPassword(password)) {
                next(appError(400, "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"));
                return;
            }
            if (new_password !== confirm_new_password) {
                next(appError(400, "新密碼與驗證新密碼不一致"));
                return;
            }
            const userRepo = dataSource.getRepository('User')
            const findUser = await userRepo.findOne({
                select: ['password'],
                where: {
                    id
                }
            })
            const isMatch = await bcrypt.compare(password, findUser.password)
            if (!isMatch) {
                return next(appError(400, "密碼輸入錯誤"));
            }
            const isMatchNewPassword = await bcrypt.compare(new_password, findUser.password)
            if (isMatchNewPassword || new_password === password) {
                return next(appError(400, "新密碼不能與舊密碼相同"));
            }
            const hashPassword = bcrypt.hashSync(new_password, saltRounds)
            const updateUser = await userRepo.update(
                {
                    id
                }
                ,
                {
                    password: hashPassword
                }
            );
            if (updateUser.affected === 0) {
                return next(appError(400, '更新密碼失敗'));
            }

            res.status(200).json({
                status: 'success',
                data: null
            })
        } catch (error) {
            logger.error('伺服器錯誤:', error)
            next(error)
        }
    },
    async getUserCourses(req, res, next) {
        try {
            const { id } = req.user;
            const courseBookingRepo = dataSource.getRepository('CourseBooking');
            const creditPurchaseRepo = dataSource.getRepository('CreditPurchase');

            const userCredit = await creditPurchaseRepo.sum('purchased_credits', {
                user_id: id
            });
            const userUsedCredit = await courseBookingRepo.count({
                where: {
                    user_id: id,
                    cancelled_at: IsNull()
                }
            });
            const courseBookingResult = await courseBookingRepo.createQueryBuilder('course_booking')
                .leftJoinAndSelect('course_booking.Course', 'course')
                .leftJoinAndSelect('course_booking.User', 'user')
                .leftJoinAndSelect('course.User', 'coach')
                .where('course_booking.user_id = :id', { id })
                .andWhere('course_booking.cancelled_at IS NULL')
                .orderBy('course.start_at', 'ASC')
                .select([
                    'course.name AS name',
                    'course.id AS course_id',
                    'coach.name AS coach_name',
                    'course_booking.status AS status',
                    'course.start_at AS start_at',
                    'course.end_at AS end_at',
                    'course.meeting_url AS meeting_url'
                ])
                .getRawMany();


            res.status(200).json({
                status: 'success',
                data: {
                    credit_remain: userCredit - userUsedCredit,
                    credit_usage: userUsedCredit,
                    course_booking: courseBookingResult
                }
            })

        } catch (error) {
            logger.error('伺服器錯誤:', error)
            next(error)
        }
    }
};

module.exports = userController;