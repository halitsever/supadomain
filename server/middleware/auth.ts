export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)

    if (!session || !session.user) event.context.auth = null;
    else event.context.auth = session;
})
