import { defineMongooseModel } from '#nuxt/mongoose'

interface IDomain {
    url: string
    createdAt?: Date
    lastChecked?: Date
    expireTime?: Date
    notifications?: boolean
    notifyDaysBefore?: number[]
    lastNotifiedDays?: number | null
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
    notifyDaysBefore: {
        type: [Number],
        default: [30, 7, 1],
    },
    lastNotifiedDays: {
        type: Number,
        default: null,
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
    timestamps: true,
}, (schema) => {

})