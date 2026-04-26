import { defineStore } from "#imports"

export const useMenuStore = defineStore('menuStore', {
    actions: {
        list() {
            const menuItems = [{
                id: 1,
                title: 'Dashboard',
                url: '/dashboard'
            },
            {
                id: 2,
                title: 'Domains',
                url: '/'
            },
            {
                id: 3,
                title: 'Notifications',
                url: '/notifications'
            }];

            return menuItems;
        }
    },
})


