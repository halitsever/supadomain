import type { H3Event } from "h3";

const checkAuth = (event: H3Event<globalThis.EventHandlerRequest>) => {
    if (!event.context.auth) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })

    }
    return event.context.auth;
}


export default checkAuth;