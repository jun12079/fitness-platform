const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: "CourseBooking",
    tableName: "COURSE_BOOKING",
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: "uuid",
            nullable: false
        },
        user_id: {
            type: "uuid",
            nullable: false
        },
        course_id: {
            type: "uuid",
            nullable: false
        },
        booking_at: {
            type: "timestamp",
            nullable: false,
            createDate: true
        },
        status: {
            type: "varchar",
            length: 20,
            nullable: false,
            default: "pending"
        },
        join_at: {
            type: "timestamp",
            nullable: true
        },
        leave_at: {
            type: "timestamp",
            nullable: true
        },
        cancelled_at: {
            type: "timestamp",
            nullable: true
        },
        cancellation_reason: {
            type: "varchar",
            length: 255,
            nullable: true
        },
        created_at: {
            type: "timestamp",
            nullable: false,
            createDate: true
        }
    },
    relations: {
        User: {
            target: "User",
            type: "many-to-one",
            inverseSide: "CourseBooking",
            joinColumn: {
                name: "user_id",
                referencedColumnName: "id",
                foreignKeyConstraintName: "course_booking_user_id_fk"
            }
        },
        Course: {
            target: "Course",
            type: "many-to-one",
            inverseSide: "CourseBooking",
            joinColumn: {
                name: "course_id",
                referencedColumnName: "id",
                foreignKeyConstraintName: "course_booking_course_id_fk"
            }
        }
    }
})