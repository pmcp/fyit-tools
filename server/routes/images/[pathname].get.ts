export default eventHandler(async (event) => {
  const { pathname } = event.context.params || {}
  if (!pathname) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Pathname is required',
    })
  }
  return hubBlob().serve(event, pathname)
})
