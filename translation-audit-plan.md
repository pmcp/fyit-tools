# Translation Audit Plan

## Translation Key Structure Design

Based on the audit, here are the new translation keys needed (extending existing structure):

### 1. Pages (`pages.`)
```
pages.dashboard.accountSettings = "Account Settings"
pages.dashboard.posts = "Posts"
pages.dashboard.imageGallery = "Image Gallery"
pages.dashboard.aiImageGen = "AI Image Generation"
pages.dashboard.accountSecurity = "Account Security"
pages.dashboard.teamSettings = "Team Settings"
pages.dashboard.workspaceMembers = "Workspace Members"
pages.dashboard.linkShortner = "Link Shortner"
pages.dashboard.tasksDemo = "Tasks Demo"
pages.superAdmin.allTeams = "All Teams"
pages.superAdmin.users = "Users"
pages.superAdmin.feedback = "Feedback"
pages.superAdmin.stripePlans = "Stripe Plans"
```

### 2. Buttons (`buttons.`)
```
buttons.signOut = "Sign out"
buttons.newPost = "New Post"
buttons.cancel = "Cancel"
buttons.delete = "Delete"
buttons.save = "Save"
buttons.submit = "Submit"
buttons.getStarted = "Get Started"
buttons.backToLogin = "Back to Login"
buttons.inviteUser = "Invite User"
buttons.banUser = "Ban User"
buttons.deleteUser = "Delete User"
buttons.createPasskey = "Create Passkey"
buttons.manageSubscription = "Manage Subscription"
buttons.inviteMember = "Invite Member"
buttons.sendInvitation = "Send invitation"
buttons.linkAccount = "Link Account"
buttons.verifyPhoneNumber = "Verify Phone Number"
buttons.changePhoneNumber = "Change Phone Number"
buttons.updatePassword = "Update Password"
buttons.proceed = "Proceed"
buttons.stopSession = "Stop session"
buttons.liftBan = "Lift Ban"
buttons.remove = "Remove"
buttons.verify = "Verify"
```

### 3. Form Fields (`fields.`)
```
fields.name = "Name"
fields.email = "Email"
fields.password = "Password"
fields.newPassword = "New Password"
fields.phoneNumber = "Phone Number"
fields.avatar = "Avatar"
fields.teamName = "Team name"
fields.teamUrl = "Team URL"
fields.teamId = "Team ID"
fields.accountId = "Account ID"
fields.title = "Title"
fields.content = "Content"
fields.image = "Image"
fields.message = "Message"
fields.verificationCode = "Verification Code"
fields.memberEmail = "Member email"
fields.role = "Role"
fields.reason = "Reason"
fields.bannedUntil = "Banned Until"
```

### 4. Placeholders (`placeholders.`)
```
placeholders.name = "Name"
placeholders.email = "Email"
placeholders.enterNewPassword = "Enter new password"
placeholders.personalOrCompanyName = "Personal or Company Name"
placeholders.accountId = "Account ID"
placeholders.enterTeamName = "Enter team name"
placeholders.optionalDescription = "Optional description for this translation"
```

### 5. Modals (`modals.`)
```
modals.deletePost.title = "Delete Post"
modals.newPost.title = "New Post"
modals.editPost.title = "Edit Post"
modals.createTeam.title = "Create a new team"
modals.banUser.title = "Ban User"
modals.deleteUser.title = "Delete User"
modals.replyFeedback.title = "Reply to Feedback"
modals.deleteFeedback.title = "Delete Feedback"
modals.deleteAccount.title = "Delete Account"
modals.registerPasskey.title = "Register a new passkey"
modals.linkAccount.title = "Link Account"
```

### 6. Messages & Descriptions (`messages.`)
```
messages.updatePost = "Update your post"
messages.createNewPost = "Create a new post to share with your team"
messages.deleteAccountConfirm = "Please type 'delete' to confirm"
messages.autoVerifyUser = "Auto verify user"
```

### 7. Toast Notifications (`toast.`)
```
toast.translationSaved.title = "Translation Saved"
toast.translationSaved.description = "Successfully saved \"{key}\""
toast.translationSaveFailed.title = "Translation Save Failed"
toast.translationSaveFailed.description = "Could not save the translation. Please try again."
toast.userCreated.title = "User Created Successfully"
toast.passwordCopied.title = "Password copied"
toast.postCreated.title = "Post created"
toast.postCreated.description = "Your post has been created successfully"
toast.postUpdated.title = "Post updated"
toast.postUpdated.description = "Your post has been updated successfully"
toast.postDeleted.title = "Post deleted"
toast.postDeleted.description = "Your post has been deleted successfully"
toast.loggedInSuccessfully.title = "Logged in successfully"
```

### 8. Validation Messages (`validation.`)
```
validation.titleRequired = "Title is required"
validation.contentRequired = "Content is required"
validation.nameRequired = "Name is required"
validation.invalidEmail = "Invalid email"
validation.keyPathRequired = "Key path is required"
validation.categoryRequired = "Category is required"
validation.translationRequired = "At least one translation is required"
```

### 9. Error Messages (`errors.`)
```
errors.failedToUploadImage = "An error occurred while uploading the image"
errors.failedToCreatePost = "An error occurred while creating the post"
errors.failedToUpdatePost = "An error occurred while updating the post"
errors.failedToDeletePost = "An error occurred while deleting the post"
errors.failedToSendVerificationCode = "Failed to send verification code"
errors.failedToVerifyCode = "Failed to verify code"
errors.failedToCreateUser = "Failed to create user"
errors.failedToUploadAvatar = "Failed to upload avatar"
errors.unexpectedError = "An unexpected error occurred"
```

### 10. Translation UI Specific (`translationUi.`)
```
translationUi.baseFromSystemTranslation = "Base from System Translation"
translationUi.keyPath = "Key Path"
translationUi.category = "Category"
translationUi.description = "Description"
translationUi.translations = "Translations"
translationUi.teamOverrideDescription = "Team Override Description"
translationUi.createTranslation = "Create Translation"
translationUi.updateTranslation = "Update Translation"
translationUi.teamTranslationOverrides = "Team Translation Overrides"
translationUi.systemValues = "System Values"
translationUi.yourOverride = "Your Override"
translationUi.edit = "Edit"
translationUi.override = "Override"
translationUi.noTranslation = "No translation"
translationUi.noTranslationAvailable = "No translation available"
translationUi.yes = "Yes"
translationUi.no = "No"
translationUi.copy = "Copy"
```

### 11. Dashboard KPIs (`dashboard.`)
```
dashboard.followers = "Followers"
dashboard.impressions = "Impressions"
dashboard.profileVisits = "Profile Visits"
dashboard.likes = "Likes"
dashboard.impressionsOverview = "Impressions Overview"
```

### 12. Table Headers (`table.`)
```
table.keyPath = "KeyPath"
table.category = "Category"
table.systemValues = "System Values"
table.teamValues = "Your Override"
```

## Implementation Priority

### Phase 1: Core User Interface
- Form fields and buttons (highest visibility)
- Page titles and navigation
- Modal titles

### Phase 2: Toast Messages & Validation
- Toast notifications
- Form validation messages
- Error messages

### Phase 3: Translation-Specific UI
- Translation management interface
- Table headers and status text

### Phase 4: Dashboard & KPIs
- Dashboard elements
- Demo content

## Files Requiring Updates

### High Priority Vue Components:
1. `app/pages/dashboard/[team]/posts.vue` - Extensive hardcoded strings
2. `app/components/SuperAdmin/NewUserForm.vue` - Form labels and messages
3. `app/pages/auth/*.vue` - Authentication forms
4. `app/components/App/AccountSettings/*.vue` - Settings forms
5. `app/pages/dashboard/[team]/settings/*.vue` - Settings pages

### Translation Layer Components:
1. `layers/translations/collections/ui/app/components/TeamForm.vue`
2. `layers/translations/collections/ui/app/components/List.vue`
3. `layers/translations/collections/ui/app/components/TeamList.vue`
4. `layers/translations/components/DevTranslationWrapper.vue`
5. `layers/translations/components/TranslationsDisplay.vue`

## Next Steps:
1. Add these translation keys to the database via super admin
2. Sync to JSON files
3. Update components to use `tString()` instead of hardcoded strings
4. Test translation switching and dev mode editing