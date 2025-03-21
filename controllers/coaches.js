const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError');
const logger = require('../utils/logger')('Coach')
const { isNumber, isValidString } = require('../utils/validUtils')

const coachesController = {
    async getCoaches(req, res, next) {
        try {
            let { per, page } = req.query

            per = Number(per)
            page = Number(page)

            if (!isNumber(per) || !isNumber(page) || per <= 0 || page <= 0) {
                return next(appError(400, "欄位未填寫正確"));
            }
            const coaches = await dataSource.getRepository("Coach").find({
                relations: ["User"],
                select: {
                    id: true,
                    User: {
                        name: true
                    }
                },
                skip: (page - 1) * per,
                take: per
            })
            const result = coaches.map(coach => {
                return {
                    id: coach.id,
                    name: coach.User.name
                }
            })

            res.status(200).json({
                status: "success",
                data: result
            })
        } catch (error) {
            logger.error(error)
            next(error)
        }
    },
    async getCoach(req, res, next) {
        try {
            const { coachId } = req.params

            if (!isValidString(coachId)) {
                return next(appError(400, "欄位未填寫正確"));
            }

            const coach = await dataSource.getRepository("Coach").findOne({
                where: {
                    id: coachId
                },
                relations: ["User"]
            })

            if (!coach) {
                return next(appError(400, "找不到該教練"));
            }

            const result = {
                user: {
                    name: coach.User.name,
                    role: coach.User.role
                },
                coach: {
                    id: coach.id,
                    user_id: coach.user_id,
                    experience_years: coach.experience_years,
                    description: coach.description,
                    profile_image_url: coach.profile_image_url,
                    created_at: coach.created_at,
                    updated_at: coach.updated_at
                }
            }
            res.status(200).json({
                status: "success",
                data: result
            })
        } catch (error) {
            logger.error(error)
            next(error)
        }
    },
    async getCoachCourses(req, res, next) {
        try {
            const { coachId } = req.params

            if (!isValidString(coachId)) {
                return next(appError(400, "欄位未填寫正確"));
            }
            const coach = await dataSource.getRepository("Coach").findOne({
                where: {
                    id: coachId
                }
            })
            if (!coach) {
                return next(appError(400, "找不到該教練"));
            }

            const courses = await dataSource.getRepository("Course").find({
                where: {
                    user_id: coach.user_id
                },
                relations: ["Skill", "User"]
            })

            const result = courses.map(course => ({
                id: course.id,
                coach_name: course.User.name,
                skill_name: course.Skill.name,
                name: course.name,
                description: course.description,
                start_at: course.start_at,
                end_at: course.end_at,
                max_participants: course.max_participants
            }));

            res.status(200).json({
                status: "success",
                data: result
            })
        } catch (error) {
            logger.error(error)
            next(error)
        }
    }
};

module.exports = coachesController;