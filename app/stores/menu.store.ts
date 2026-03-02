import { defineStore } from "#imports"

export const useMenuStore = defineStore('menuStore', {
    actions: {
        list() {
            const menuItems = [{
                id: 1,
                title: 'Domains',
                url: '/'
            },
            {
                id: 2,
                title: 'Notifications',
                url: '/notifications'
            }];

            return menuItems;
        }
    },
})


