const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');
const logger = require('../utils/logger')('SkillController');
const { isValidString } = require('../utils/validUtils');


const skillController = {
    async getSkill(req, res, next) {
        try {
            const data = await dataSource.getRepository("Skill").find({
                select: ["id", "name"]
            })
            res.status(200).json({
                status: "success",
                data: data,
            })
        } catch (error) {
            next(error)
        }
    },
    async createSkill(req, res, next) {
        try {
            const { name } = req.body;
            if (!isValidString(name)) {
                next(appError(400, "欄位未填寫正確"));
                return;
            }

            const skillRepo = dataSource.getRepository("Skill")
            const findSkill = await skillRepo.find({
                where: {
                    name
                }
            })
            if (findSkill.length > 0) {
                next(appError(409, "資料重複"));
                return;
            }

            const newSkill = skillRepo.create({
                name
            })
            const result = await skillRepo.save(newSkill)
            res.status(200).json({
                status: "success",
                data: {
                    id: result.id,
                    name: result.name
                }
            })
        } catch (error) {
            next(error)
        }
    },
    async deleteSkill(req, res, next) {
        try {
            const { skillId } = req.params;
            if (!isValidString(skillId)) {
                next(appError(400, "ID錯誤"));
                return;
            }
            const result = await dataSource.getRepository("Skill").delete(skillId)
            if (result.affected === 0) {
                next(appError(404, "無此資料"));
                return;
            }
            res.status(200).json({
                status: "success",
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = skillController