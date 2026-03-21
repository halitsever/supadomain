import { defineMongooseModel } from '#nuxt/mongoose'

interface IUser {
    email: string
    password: string
}

export const User = defineMongooseModel<IUser>('User', {
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
}, {

}, (schema) => {

})
