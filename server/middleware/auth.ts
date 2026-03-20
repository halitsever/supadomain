import { getUserSession } from "#imports"
export default defineEventHandler(async (event) => {

    const session = await getUserSession(event)

    if (!session || !session.user) event.context.auth = false;
    else event.context.auth = session;
})
