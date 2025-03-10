const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: "CreditPurchase",
    tableName: "CREDIT_PURCHASE",
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: "uuid",
            nullable: false,
        },
        user_id: {
            type: "uuid",
            nullable: false,
        },
        credit_package_id: {
            type: "integer",
            nullable: false,
        },
        purchased_credits: {
            type: "integer",
            nullable: false,
        },
        price_paid: {
            type: "numeric",
            precision: 10,
            scale: 2,
            nullable: false,
        },
        created_at: {
            type: "timestamp",
            nullable: false,
            createDate: true,
        },
        purchase_at: {
            type: "timestamp",
            nullable: false,
            createDate: true,
        }
    },
    relations: {
        User: {
            target: "User",
            type: "many-to-one",
            inverseSide: "CreditPurchase",
            joinColumn: {
                name: "user_id",
                referencedColumnName: "id",
                foreignKeyConstraintName: "credit_purchase_user_id_fk"
            }
        },
        CreditPackage: {
            target: "CreditPackage",
            type: "many-to-one",
            inverseSide: "CreditPurchase",
            joinColumn: {
                name: "credit_package_id",
                referencedColumnName: "id",
                foreignKeyConstraintName: "credit_purchase_credit_package_id_fk"
            }
        }
    }
})