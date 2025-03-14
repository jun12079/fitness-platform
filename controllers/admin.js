const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Admin');
const appError = require('../utils/appError');
const { isValidString, isNumber, isValidImageUrl, isValidUUID } = require('../utils/validUtils')

const adminController = {
    async getCoach(req, res, next) {
        try {
            const { id } = req.user;

            if (!isValidUUID(id)) {
                return next(appError(400, "欄位未填寫正確"));
            }

            const coachRepo = dataSource.getRepository("Coach")
            const coach = await coachRepo.findOne({
                select: ["id", "experience_years", "description", "profile_image_url"],
                where: {
                    user_id: id
                }
            })
            if (!coach) {
                return next(appError(400, "找不到教練"));
            }
            const coachLinkSkillRepo = dataSource.getRepository("CoachLinkSkill");
            const skillIds = await coachLinkSkillRepo.find({
                where: {
                    coach_id: coach.id
                }
            })
            res.status(200).json({
                status: "success",
                data: {
                    id: coach.id,
                    experience_years: coach.experience_years,
                    description: coach.description,
                    profile_image_url: coach.profile_image_url,
                    skill_ids: skillIds.map(skill => skill.skill_id)
                }
            })
        } catch (error) {
            logger.error(error)
            next(error)
        }
    },
    async updateCoach(req, res, next) {
        try {
            const { id } = req.user;
            const { experience_years, description, profile_image_url, skill_ids } = req.body;

            if (!isNumber(experience_years) || experience_years < 0) {
                return next(appError(400, "欄位未填寫正確"));
            }
            if (!isValidString(description)) {
                return next(appError(400, "欄位未填寫正確"));
            }
            if (profile_image_url && isValidString(profile_image_url) && (!profile_image_url.startsWith('https') || !isValidImageUrl(profile_image_url))) {
                return next(appError(400, "欄位未填寫正確"));
            }
            if (!Array.isArray(skill_ids) || skill_ids.length === 0) {
                return next(appError(400, "欄位未填寫正確"));
            }

            const coachRepo = dataSource.getRepository("Coach")
            const findCoach = await coachRepo.findOne({
                where: {
                    user_id: id
                }
            })
            if (!findCoach) {
                return next(appError(400, "找不到教練"));
            }
            const updateCoach = await coachRepo.update({
                user_id: id
            }, {
                experience_years,
                description,
                profile_image_url
            });
            if (updateCoach.affected === 0) {
                return next(appError(400, "更新教練失敗"));
            }
            const coachLinkSkillRepo = dataSource.getRepository("CoachLinkSkill");
            await coachLinkSkillRepo.delete({ coach_id: findCoach.id });

            const newSkills = skill_ids.map(skill_id => ({
                coach_id: findCoach.id,
                skill_id
            }));

            await coachLinkSkillRepo.insert(newSkills);
            const coach = await coachRepo.findOne({
                select: ["id", "experience_years", "description", "profile_image_url"],
                where: {
                    user_id: id
                }
            })
            const skillIds = await coachLinkSkillRepo.find({
                where: {
                    coach_id: coach.id
                }
            })
            res.status(200).json({
                status: "success",
                data: {
                    id: coach.id,
                    experience_years: coach.experience_years,
                    description: coach.description,
                    profile_image_url: coach.profile_image_url,
                    skill_ids: skillIds.map(skill => skill.skill_id)
                }
            })
        } catch (error) {
            logger.error(error)
            next(error)
        }
    },
    async createCourse(req, res, next) {
        try {
            // TODO 可以做檢查日期格式
            // 可以用 moment
            const { user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body
            if (!isValidString(user_id) || !isValidString(skill_id) || !isValidString(name) ||
                !isValidString(description) || !isValidString(start_at) || !isValidString(end_at) ||
                !isNumber(max_participants) || !isValidString(meeting_url) || !meeting_url.startsWith('https')) {
                return next(appError(400, "欄位未填寫正確"));
            }

            const userRepo = dataSource.getRepository("User")
            const findUser = await userRepo.findOne({
                where: {
                    id: user_id
                }
            })
            if (!findUser) {
                return next(appError(400, "使用者不存在"));
            } else if (findUser.role !== 'COACH') {
                return next(appError(400, "使用者尚未成為教練"));
            }

            const courseRepo = dataSource.getRepository("Course")
            const newCourse = courseRepo.create({
                user_id,
                skill_id,
                name,
                description,
                start_at,
                end_at,
                max_participants,
                meeting_url
            })
            const result = await courseRepo.save(newCourse)

            res.status(201).json({
                status: "success",
                data: {
                    user_id: result.user_id,
                    skill_id: result.skill_id,
                    name: result.name,
                    description: result.description,
                    start_at: result.start_at,
                    end_at: result.end_at,
                    max_participants: result.max_participants,
                    meeting_url: result.meeting_url
                }
            })
        } catch (error) {
            logger.error(error)
            next(error)
        }
    },
    async updateCourse(req, res, next) {
        try {
            const { courseId } = req.params
            // TODO 可以做檢查日期格式
            // 可以用 moment
            const { skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body
            if (!isValidString(courseId) ||
                !isValidString(skill_id) || !isValidString(name) ||
                !isValidString(description) || !isValidString(start_at) || !isValidString(end_at) ||
                !isNumber(max_participants) || !isValidString(meeting_url) || !meeting_url.startsWith('https')) {
                return next(appError(400, "欄位未填寫正確"));
            }

            const courseRepo = dataSource.getRepository("Course")
            const findCourse = await courseRepo.findOne({
                where: {
                    id: courseId
                }
            })
            if (!findCourse) {
                return next(appError(400, "課程不存在"));
            }

            const updateCourse = await courseRepo.update({
                id: courseId
            }, {
                skill_id,
                name,
                description,
                start_at,
                end_at,
                max_participants,
                meeting_url
            })
            if (updateCourse.affected === 0) {
                return next(appError(400, "更新課程失敗"));
            }

            const courseResult = await courseRepo.findOne({
                select: ['skill_id', 'name', 'description', 'start_at', 'end_at', 'max_participants', 'meeting_url'],
                where: {
                    id: courseId
                }
            })

            res.status(201).json({
                status: "success",
                data: {
                    skill_id: courseResult.skill_id,
                    name: courseResult.name,
                    description: courseResult.description,
                    start_at: courseResult.start_at,
                    end_at: courseResult.end_at,
                    max_participants: courseResult.max_participants,
                    meeting_url: courseResult.meeting_url
                }
            })
        } catch (error) {
            logger.error(error)
            next(error)
        }
    },
    async setAsCoach(req, res, next) {
        try {
            const { userId } = req.params
            const { experience_years, description, profile_image_url } = req.body

            if (!isValidString(userId) || !isNumber(experience_years) || !isValidString(description)) {
                return next(appError(400, "欄位未填寫正確"));
            }
            if (profile_image_url && isValidString(profile_image_url) && (!profile_image_url.startsWith('https') || !isValidImageUrl(profile_image_url))) {
                return next(appError(400, "欄位未填寫正確"));
            }

            const userRepo = dataSource.getRepository("User")
            const findUser = await userRepo.findOne({
                where: {
                    id: userId
                }
            })
            if (!findUser) {
                return next(appError(404, "使用者不存在"));
            } else if (findUser.role === 'COACH') {
                return next(appError(409, "使用者已經是教練"));
            }

            const result = await dataSource.transaction(async transactionalEntityManager => {
                const updateUser = await transactionalEntityManager.update("User", {
                    id: userId
                }, {
                    role: 'COACH'
                })
                if (updateUser.affected === 0) {
                    return next(appError(400, "更新使用者失敗"));
                }
                const newCoach = transactionalEntityManager.create("Coach", {
                    user_id: userId,
                    experience_years,
                    description,
                    profile_image_url
                })
                const coachResult = await transactionalEntityManager.save("Coach", newCoach)

                const userResult = await transactionalEntityManager.findOne("User", {
                    where: { id: userId },
                    select: ["name", "role"]
                });

                return { userResult, coachResult };
            })
            res.status(201).json({
                status: "success",
                data: {
                    user: result.userResult,
                    coach: result.coachResult
                }
            })
        } catch (error) {
            logger.error(error)
            next(error)
        }
    },
    async getCoachCourses(req, res, next) {
        try {
            const { id } = req.user;
            const courseRepo = dataSource.getRepository("Course")
            const courses = await courseRepo.find({
                where: {
                    user_id: id
                }
            })
            if (courses.length === 0) {
                return next(appError(400, "找不到課程"));
            }
            const courseBookingRepo = dataSource.getRepository("CourseBooking")
            const courseIds = courses.map(course => course.id)
            const courseBookingCount = await courseBookingRepo
                .createQueryBuilder('course_booking')
                .select('course_id')
                .addSelect('COUNT(course_id)', 'count')
                .where('course_id IN (:...ids)', { ids: courseIds })
                .andWhere('cancelled_at is null')
                .groupBy('course_id')
                .getRawMany();

            const now = new Date();
            const result = courses.map(course => {
                let status = '尚未開始'
                if (course.start_at < now && course.end_at > now) {
                    status = '進行中';
                } else if (course.end_at < now) {
                    status = '已結束';
                }

                const participants = courseBookingCount
                    .filter(courseBooking => courseBooking.course_id === course.id)
                    .map(courseBooking => courseBooking.count);

                return {
                    id: course.id,
                    status,
                    name: course.name,
                    start_at: course.start_at,
                    end_at: course.end_at,
                    max_participants: course.max_participants,
                    participants: parseInt(participants?.[0] || 0)
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
    async getCoachCourse(req, res, next) {
        try {
            const { courseId } = req.params;
            if (!isValidUUID(courseId) || !isValidString(courseId)) {
                return next(appError(400, "欄位未填寫正確"));
            }

            const courses = await dataSource
                .getRepository('Course')
                .createQueryBuilder('course')
                .leftJoinAndSelect('course.Skill', 'skill')
                .select([
                    'course.id AS id',
                    'skill.name AS skill_name',
                    'course.name AS name',
                    'course.description AS description',
                    'course.start_at AS start_at',
                    'course.end_at AS end_at',
                    'course.max_participants AS max_participants'
                ])
                .where('course.id = :courseId', { courseId })
                .getRawOne();

            if (courses.length === 0) {
                return next(appError(400, "找不到課程"));
            }

            res.status(200).json({
                status: "success",
                data: courses
            })
        } catch (error) {
            logger.error(error)
            next(error)
        }
    },
    async getCoachRevenue(req, res, next) {
        try {
            const { id } = req.user;
            const { month } = req.query;
            const monthMap = {
                january: 1,
                february: 2,
                march: 3,
                april: 4,
                may: 5,
                june: 6,
                july: 7,
                august: 8,
                september: 9,
                october: 10,
                november: 11,
                december: 12
            }
            if (!monthMap[month]) {
                return next(appError(400, "欄位未填寫正確"));
            }
            const courseRepo = dataSource.getRepository("Course")
            const courses = await courseRepo.find({
                where: {
                    user_id: id
                }
            })
            if (courses.length === 0) {
                return next(appError(400, "找不到課程"));
            }
            const courseIds = courses.map(course => course.id)
            const courseBookingRepo = dataSource.getRepository("CourseBooking")
            const creditPackageRepo = dataSource.getRepository("CreditPackage")

            const courseCount = await courseBookingRepo
                .createQueryBuilder('course_booking')
                .select('COUNT(*)', 'count')
                .addSelect('COUNT(DISTINCT(user_id))', 'participants')
                .where('course_id IN (:...ids)', { ids: courseIds })
                .andWhere('created_at >= :start AND created_at <= :end', {
                    start: `${new Date().getFullYear()}-${monthMap[month]}-01`,
                    end: `${new Date().getFullYear()}-${monthMap[month]}-31`
                })
                .andWhere('cancelled_at IS NULL')
                .getRawOne();
            const totalCreditPackage = await creditPackageRepo
                .createQueryBuilder()
                .select('SUM(credit_amount)', 'totalCredit')
                .addSelect('SUM(price)', 'totalPrice')
                .getRawOne();
            const totalRevenue = courseCount.count * (totalCreditPackage.totalPrice / totalCreditPackage.totalCredit);

            res.status(200).json({
                status: 'success',
                data: {
                    total: {
                        revenue: Math.floor(totalRevenue),
                        participants: parseInt(courseCount.participants),
                        course_count: parseInt(courseCount.count)
                    }
                }
            })
        } catch (error) {
            logger.error(error)
            next(error)
        }
    }
};

module.exports = adminController;