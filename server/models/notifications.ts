import { defineMongooseModel } from '#nuxt/mongoose'

export const Notifications = defineMongooseModel('Notifications', {
    service: {
        type: 'string',
        required: true,
        unique: true,
    },
    credentials: {
    }

}, {

}, (schema) => {

})