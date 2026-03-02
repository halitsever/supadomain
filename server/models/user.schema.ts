import { defineMongooseModel } from '#nuxt/mongoose'

export const User = defineMongooseModel('User', {
    username: {
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