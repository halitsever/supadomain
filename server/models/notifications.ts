import { defineMongooseModel } from '#nuxt/mongoose'

interface INotifications {
    service: string
    credentials?: string
}

export const Notifications = defineMongooseModel<INotifications>('Notifications', {
    service: {
        type: String,
        required: true,
        unique: true,
    },
    credentials: {
        type: String,
    }
}, {

}, (schema) => {

})