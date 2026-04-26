import { defineMongooseModel } from '#nuxt/mongoose'

export type ActivityKind = 'alert' | 'refresh' | 'added' | 'removed' | 'expired'

interface IActivity {
    domainUrl: string
    kind: ActivityKind
    message: string
    createdAt: Date
}

export const Activity = defineMongooseModel<IActivity>('Activity', {
    domainUrl: {
        type: String,
        required: true,
    },
    kind: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: () => new Date(),
    },
}, {
    timestamps: false,
})
