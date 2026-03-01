import { defineStore } from "#imports"

export const useMenuStore = defineStore('menuStore', {
    actions: {
        list() {
            const menuItems = {
                id: 1,
                title: 'Domain Management',
                url: '/',
                items: [
                    {
                        title: "Domains",
                        url: "/",
                    }

                ]
            };

            return [menuItems];
        }
    },
})


