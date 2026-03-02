import { defineMongooseModel } from '#nuxt/mongoose'

export const Domain = defineMongooseModel('Domain', {
    url: {
        type: 'string',
        required: true,
        unique: true,
    },
    lastChecked: {},
    expireTime: {},
    notifications: {},
    registrationDate: {},
    lastUpdate: {},
    lastUpdatedInRdap: {},
    nameservers: {}
}, {

}, (schema) => {

})