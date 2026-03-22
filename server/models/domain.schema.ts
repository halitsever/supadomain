import { defineMongooseModel } from '#nuxt/mongoose'

interface IDomain {
    url: string
    lastChecked?: Date
    expireTime?: Date
    notifications?: boolean
    registrationDate?: Date
    lastUpdate?: Date
    lastUpdatedInRdap?: Date
    nameservers?: string[]
}

export const Domain = defineMongooseModel<IDomain>('Domain', {
    url: {
        type: String,
        required: true,
        unique: true,
    },
    lastChecked: {
        type: Date,
    },
    expireTime: {
        type: Date,
    },
    notifications: {
        type: Boolean,
        default: true
    },
    registrationDate: {
        type: Date,
    },
    lastUpdate: {
        type: Date,
    },
    lastUpdatedInRdap: {
        type: Date,
    },
    nameservers: {
        type: [String],
        default: [],
    }
}, {

}, (schema) => {

})