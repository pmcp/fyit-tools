import { handleOAuthSuccess } from '@@/server/utils/oauth'

interface GitHubOAuthUser {
  email: string
  name: string
  avatar_url: string
  id: string
}

const mapGitHubUser = (user: any) => {
  if (!user.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required for GitHub authentication',
    })
  }

  return {
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    provider: 'github' as const,
    providerUserId: String(user.id),
  }
}

export default defineOAuthGitHubEventHandler({
  config: { emailRequired: true },
  async onSuccess(event, { user }) {
    try {
      await handleOAuthSuccess(event, mapGitHubUser(user))
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage: 'Authentication failed',
      })
    }
  },
})
