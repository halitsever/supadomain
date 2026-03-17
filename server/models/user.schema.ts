import { defineMongooseModel } from '#nuxt/mongoose'

export const User = defineMongooseModel('User', {
    email: {
        type: 'string',
        required: true,
        unique: true,
    },
    password: {
        type: 'string',
        required: true,
        unique: false
    }
}, {

}, (schema) => {

})
