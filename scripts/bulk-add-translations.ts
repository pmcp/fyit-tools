import Database from 'better-sqlite3'
import { nanoid } from 'nanoid'

// Open the database
const db = new Database('server/database/db.sqlite')

// Prepare the insert statement
const insert = db.prepare(`
  INSERT INTO translations_system (
    id, userId, keyPath, category, values, description, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

// All new translations to add
const translations = [
  // Pages
  { keyPath: 'pages.dashboard.accountSettings', category: 'pages', values: { en: 'Account Settings', nl: 'Account Instellingen', fr: 'Paramètres du compte' }, description: 'Page title for account settings' },
  { keyPath: 'pages.dashboard.posts', category: 'pages', values: { en: 'Posts', nl: 'Berichten', fr: 'Articles' }, description: 'Page title for posts' },
  { keyPath: 'pages.dashboard.imageGallery', category: 'pages', values: { en: 'Image Gallery', nl: 'Afbeeldingengalerij', fr: 'Galerie d\'images' }, description: 'Page title for image gallery' },
  { keyPath: 'pages.dashboard.aiImageGen', category: 'pages', values: { en: 'AI Image Generation', nl: 'AI Afbeelding Generatie', fr: 'Génération d\'images IA' }, description: 'Page title for AI image generation' },
  { keyPath: 'pages.dashboard.accountSecurity', category: 'pages', values: { en: 'Account Security', nl: 'Account Beveiliging', fr: 'Sécurité du compte' }, description: 'Page title for account security' },
  { keyPath: 'pages.dashboard.teamSettings', category: 'pages', values: { en: 'Team Settings', nl: 'Team Instellingen', fr: 'Paramètres de l\'équipe' }, description: 'Page title for team settings' },
  { keyPath: 'pages.dashboard.workspaceMembers', category: 'pages', values: { en: 'Workspace Members', nl: 'Werkruimte Leden', fr: 'Membres de l\'espace de travail' }, description: 'Page title for workspace members' },
  { keyPath: 'pages.dashboard.linkShortner', category: 'pages', values: { en: 'Link Shortner', nl: 'Link Verkorten', fr: 'Raccourcisseur de liens' }, description: 'Page title for link shortener' },
  { keyPath: 'pages.dashboard.tasksDemo', category: 'pages', values: { en: 'Tasks Demo', nl: 'Taken Demo', fr: 'Démo des tâches' }, description: 'Page title for tasks demo' },
  { keyPath: 'pages.superAdmin.allTeams', category: 'pages', values: { en: 'All Teams', nl: 'Alle Teams', fr: 'Toutes les équipes' }, description: 'Page title for all teams in super admin' },
  { keyPath: 'pages.superAdmin.users', category: 'pages', values: { en: 'Users', nl: 'Gebruikers', fr: 'Utilisateurs' }, description: 'Page title for users in super admin' },
  { keyPath: 'pages.superAdmin.feedback', category: 'pages', values: { en: 'Feedback', nl: 'Feedback', fr: 'Commentaires' }, description: 'Page title for feedback in super admin' },
  { keyPath: 'pages.superAdmin.stripePlans', category: 'pages', values: { en: 'Stripe Plans', nl: 'Stripe Plannen', fr: 'Plans Stripe' }, description: 'Page title for stripe plans in super admin' },

  // Buttons
  { keyPath: 'buttons.signOut', category: 'buttons', values: { en: 'Sign out', nl: 'Uitloggen', fr: 'Se déconnecter' }, description: 'Sign out button text' },
  { keyPath: 'buttons.newPost', category: 'buttons', values: { en: 'New Post', nl: 'Nieuw Bericht', fr: 'Nouveau poste' }, description: 'New post button text' },
  { keyPath: 'buttons.getStarted', category: 'buttons', values: { en: 'Get Started', nl: 'Begin', fr: 'Commencer' }, description: 'Get started button text' },
  { keyPath: 'buttons.backToLogin', category: 'buttons', values: { en: 'Back to Login', nl: 'Terug naar Inloggen', fr: 'Retour à la connexion' }, description: 'Back to login button text' },
  { keyPath: 'buttons.inviteUser', category: 'buttons', values: { en: 'Invite User', nl: 'Gebruiker Uitnodigen', fr: 'Inviter un utilisateur' }, description: 'Invite user button text' },
  { keyPath: 'buttons.banUser', category: 'buttons', values: { en: 'Ban User', nl: 'Gebruiker Verbannen', fr: 'Bannir l\'utilisateur' }, description: 'Ban user button text' },
  { keyPath: 'buttons.deleteUser', category: 'buttons', values: { en: 'Delete User', nl: 'Gebruiker Verwijderen', fr: 'Supprimer l\'utilisateur' }, description: 'Delete user button text' },
  { keyPath: 'buttons.createPasskey', category: 'buttons', values: { en: 'Create Passkey', nl: 'Toegangssleutel Maken', fr: 'Créer une clé d\'accès' }, description: 'Create passkey button text' },
  { keyPath: 'buttons.manageSubscription', category: 'buttons', values: { en: 'Manage Subscription', nl: 'Abonnement Beheren', fr: 'Gérer l\'abonnement' }, description: 'Manage subscription button text' },
  { keyPath: 'buttons.inviteMember', category: 'buttons', values: { en: 'Invite Member', nl: 'Lid Uitnodigen', fr: 'Inviter un membre' }, description: 'Invite member button text' },
  { keyPath: 'buttons.sendInvitation', category: 'buttons', values: { en: 'Send invitation', nl: 'Uitnodiging versturen', fr: 'Envoyer une invitation' }, description: 'Send invitation button text' },
  { keyPath: 'buttons.linkAccount', category: 'buttons', values: { en: 'Link Account', nl: 'Account Koppelen', fr: 'Lier le compte' }, description: 'Link account button text' },
  { keyPath: 'buttons.verifyPhoneNumber', category: 'buttons', values: { en: 'Verify Phone Number', nl: 'Telefoonnummer Verifiëren', fr: 'Vérifier le numéro de téléphone' }, description: 'Verify phone number button text' },
  { keyPath: 'buttons.changePhoneNumber', category: 'buttons', values: { en: 'Change Phone Number', nl: 'Telefoonnummer Wijzigen', fr: 'Changer le numéro de téléphone' }, description: 'Change phone number button text' },
  { keyPath: 'buttons.updatePassword', category: 'buttons', values: { en: 'Update Password', nl: 'Wachtwoord Bijwerken', fr: 'Mettre à jour le mot de passe' }, description: 'Update password button text' },
  { keyPath: 'buttons.proceed', category: 'buttons', values: { en: 'Proceed', nl: 'Doorgaan', fr: 'Continuer' }, description: 'Proceed button text' },
  { keyPath: 'buttons.stopSession', category: 'buttons', values: { en: 'Stop session', nl: 'Sessie stoppen', fr: 'Arrêter la session' }, description: 'Stop session button text' },
  { keyPath: 'buttons.liftBan', category: 'buttons', values: { en: 'Lift Ban', nl: 'Verbanning Opheffen', fr: 'Lever l\'interdiction' }, description: 'Lift ban button text' },
  { keyPath: 'buttons.remove', category: 'buttons', values: { en: 'Remove', nl: 'Verwijderen', fr: 'Supprimer' }, description: 'Remove button text' },
  { keyPath: 'buttons.verify', category: 'buttons', values: { en: 'Verify', nl: 'Verifiëren', fr: 'Vérifier' }, description: 'Verify button text' },
  { keyPath: 'buttons.google', category: 'buttons', values: { en: 'Google', nl: 'Google', fr: 'Google' }, description: 'Google button text' },
  { keyPath: 'buttons.github', category: 'buttons', values: { en: 'Github', nl: 'Github', fr: 'Github' }, description: 'Github button text' },
  { keyPath: 'buttons.discord', category: 'buttons', values: { en: 'Discord', nl: 'Discord', fr: 'Discord' }, description: 'Discord button text' },
  { keyPath: 'buttons.features', category: 'buttons', values: { en: 'Features', nl: 'Functies', fr: 'Fonctionnalités' }, description: 'Features button text' },
  { keyPath: 'buttons.pricing', category: 'buttons', values: { en: 'Pricing', nl: 'Prijzen', fr: 'Tarification' }, description: 'Pricing button text' },
  { keyPath: 'buttons.blog', category: 'buttons', values: { en: 'Blog', nl: 'Blog', fr: 'Blog' }, description: 'Blog button text' },
  { keyPath: 'buttons.docs', category: 'buttons', values: { en: 'Docs', nl: 'Documentatie', fr: 'Documents' }, description: 'Docs button text' },
  { keyPath: 'buttons.goToApp', category: 'buttons', values: { en: 'Go to App', nl: 'Ga naar App', fr: 'Aller à l\'application' }, description: 'Go to app button text' },

  // Form Fields
  { keyPath: 'fields.newPassword', category: 'fields', values: { en: 'New Password', nl: 'Nieuw Wachtwoord', fr: 'Nouveau mot de passe' }, description: 'New password field label' },
  { keyPath: 'fields.phoneNumber', category: 'fields', values: { en: 'Phone Number', nl: 'Telefoonnummer', fr: 'Numéro de téléphone' }, description: 'Phone number field label' },
  { keyPath: 'fields.avatar', category: 'fields', values: { en: 'Avatar', nl: 'Avatar', fr: 'Avatar' }, description: 'Avatar field label' },
  { keyPath: 'fields.teamName', category: 'fields', values: { en: 'Team name', nl: 'Teamnaam', fr: 'Nom de l\'équipe' }, description: 'Team name field label' },
  { keyPath: 'fields.teamUrl', category: 'fields', values: { en: 'Team URL', nl: 'Team URL', fr: 'URL de l\'équipe' }, description: 'Team URL field label' },
  { keyPath: 'fields.teamId', category: 'fields', values: { en: 'Team ID', nl: 'Team ID', fr: 'ID de l\'équipe' }, description: 'Team ID field label' },
  { keyPath: 'fields.accountId', category: 'fields', values: { en: 'Account ID', nl: 'Account ID', fr: 'ID du compte' }, description: 'Account ID field label' },
  { keyPath: 'fields.title', category: 'fields', values: { en: 'Title', nl: 'Titel', fr: 'Titre' }, description: 'Title field label' },
  { keyPath: 'fields.content', category: 'fields', values: { en: 'Content', nl: 'Inhoud', fr: 'Contenu' }, description: 'Content field label' },
  { keyPath: 'fields.image', category: 'fields', values: { en: 'Image', nl: 'Afbeelding', fr: 'Image' }, description: 'Image field label' },
  { keyPath: 'fields.message', category: 'fields', values: { en: 'Message', nl: 'Bericht', fr: 'Message' }, description: 'Message field label' },
  { keyPath: 'fields.verificationCode', category: 'fields', values: { en: 'Verification Code', nl: 'Verificatiecode', fr: 'Code de vérification' }, description: 'Verification code field label' },
  { keyPath: 'fields.memberEmail', category: 'fields', values: { en: 'Member email', nl: 'Lid e-mail', fr: 'E-mail du membre' }, description: 'Member email field label' },
  { keyPath: 'fields.role', category: 'fields', values: { en: 'Role', nl: 'Rol', fr: 'Rôle' }, description: 'Role field label' },
  { keyPath: 'fields.reason', category: 'fields', values: { en: 'Reason', nl: 'Reden', fr: 'Raison' }, description: 'Reason field label' },
  { keyPath: 'fields.bannedUntil', category: 'fields', values: { en: 'Banned Until', nl: 'Verbannen Tot', fr: 'Banni jusqu\'à' }, description: 'Banned until field label' },

  // Placeholders
  { keyPath: 'placeholders.enterNewPassword', category: 'placeholders', values: { en: 'Enter new password', nl: 'Voer nieuw wachtwoord in', fr: 'Entrez le nouveau mot de passe' }, description: 'Enter new password placeholder' },
  { keyPath: 'placeholders.personalOrCompanyName', category: 'placeholders', values: { en: 'Personal or Company Name', nl: 'Persoonlijke of Bedrijfsnaam', fr: 'Nom personnel ou d\'entreprise' }, description: 'Personal or company name placeholder' },
  { keyPath: 'placeholders.enterTeamName', category: 'placeholders', values: { en: 'Enter team name', nl: 'Voer teamnaam in', fr: 'Entrez le nom de l\'équipe' }, description: 'Enter team name placeholder' },
  { keyPath: 'placeholders.optionalDescription', category: 'placeholders', values: { en: 'Optional description for this translation', nl: 'Optionele beschrijving voor deze vertaling', fr: 'Description optionnelle pour cette traduction' }, description: 'Optional description placeholder' },

  // Modals
  { keyPath: 'modals.deletePost.title', category: 'modals', values: { en: 'Delete Post', nl: 'Bericht Verwijderen', fr: 'Supprimer le poste' }, description: 'Delete post modal title' },
  { keyPath: 'modals.newPost.title', category: 'modals', values: { en: 'New Post', nl: 'Nieuw Bericht', fr: 'Nouveau poste' }, description: 'New post modal title' },
  { keyPath: 'modals.editPost.title', category: 'modals', values: { en: 'Edit Post', nl: 'Bericht Bewerken', fr: 'Modifier le poste' }, description: 'Edit post modal title' },
  { keyPath: 'modals.createTeam.title', category: 'modals', values: { en: 'Create a new team', nl: 'Een nieuw team maken', fr: 'Créer une nouvelle équipe' }, description: 'Create team modal title' },
  { keyPath: 'modals.banUser.title', category: 'modals', values: { en: 'Ban User', nl: 'Gebruiker Verbannen', fr: 'Bannir l\'utilisateur' }, description: 'Ban user modal title' },
  { keyPath: 'modals.banUser.description', category: 'modals', values: { en: 'Ban a user from the platform', nl: 'Een gebruiker van het platform verbannen', fr: 'Bannir un utilisateur de la plateforme' }, description: 'Ban user modal description' },
  { keyPath: 'modals.deleteUser.title', category: 'modals', values: { en: 'Delete User', nl: 'Gebruiker Verwijderen', fr: 'Supprimer l\'utilisateur' }, description: 'Delete user modal title' },
  { keyPath: 'modals.deleteUser.description', category: 'modals', values: { en: 'This action is irreversible', nl: 'Deze actie is onomkeerbaar', fr: 'Cette action est irréversible' }, description: 'Delete user modal description' },
  { keyPath: 'modals.createUser.title', category: 'modals', values: { en: 'Create a new user', nl: 'Een nieuwe gebruiker maken', fr: 'Créer un nouvel utilisateur' }, description: 'Create user modal title' },
  { keyPath: 'modals.createUser.description', category: 'modals', values: { en: 'Invite a new user to the platform', nl: 'Een nieuwe gebruiker uitnodigen voor het platform', fr: 'Inviter un nouvel utilisateur sur la plateforme' }, description: 'Create user modal description' },
  { keyPath: 'modals.replyFeedback.title', category: 'modals', values: { en: 'Reply to Feedback', nl: 'Reageren op Feedback', fr: 'Répondre aux commentaires' }, description: 'Reply to feedback modal title' },
  { keyPath: 'modals.deleteFeedback.title', category: 'modals', values: { en: 'Delete Feedback', nl: 'Feedback Verwijderen', fr: 'Supprimer les commentaires' }, description: 'Delete feedback modal title' },
  { keyPath: 'modals.deleteAccount.title', category: 'modals', values: { en: 'Delete Account', nl: 'Account Verwijderen', fr: 'Supprimer le compte' }, description: 'Delete account modal title' },
  { keyPath: 'modals.registerPasskey.title', category: 'modals', values: { en: 'Register a new passkey', nl: 'Een nieuwe toegangssleutel registreren', fr: 'Enregistrer une nouvelle clé d\'accès' }, description: 'Register passkey modal title' },
  { keyPath: 'modals.linkAccount.title', category: 'modals', values: { en: 'Link Account', nl: 'Account Koppelen', fr: 'Lier le compte' }, description: 'Link account modal title' },

  // Messages
  { keyPath: 'messages.updatePost', category: 'messages', values: { en: 'Update your post', nl: 'Werk je bericht bij', fr: 'Mettez à jour votre poste' }, description: 'Update post message' },
  { keyPath: 'messages.createNewPost', category: 'messages', values: { en: 'Create a new post to share with your team', nl: 'Maak een nieuw bericht om te delen met je team', fr: 'Créez un nouveau poste à partager avec votre équipe' }, description: 'Create new post message' },
  { keyPath: 'messages.deleteAccountConfirm', category: 'messages', values: { en: 'Please type \'delete\' to confirm', nl: 'Typ \'delete\' om te bevestigen', fr: 'Veuillez taper \'delete\' pour confirmer' }, description: 'Delete account confirmation message' },
  { keyPath: 'messages.autoVerifyUser', category: 'messages', values: { en: 'Auto verify user', nl: 'Gebruiker automatisch verifiëren', fr: 'Vérifier automatiquement l\'utilisateur' }, description: 'Auto verify user message' },

  // Toast Notifications
  { keyPath: 'toast.translationSaved.title', category: 'toast', values: { en: 'Translation Saved', nl: 'Vertaling Opgeslagen', fr: 'Traduction sauvegardée' }, description: 'Translation saved toast title' },
  { keyPath: 'toast.translationSaveFailed.title', category: 'toast', values: { en: 'Translation Save Failed', nl: 'Vertaling Opslaan Mislukt', fr: 'Échec de la sauvegarde de la traduction' }, description: 'Translation save failed toast title' },
  { keyPath: 'toast.translationSaveFailed.description', category: 'toast', values: { en: 'Could not save the translation. Please try again.', nl: 'Kon de vertaling niet opslaan. Probeer het opnieuw.', fr: 'Impossible de sauvegarder la traduction. Veuillez réessayer.' }, description: 'Translation save failed toast description' },
  { keyPath: 'toast.userCreated.title', category: 'toast', values: { en: 'User Created Successfully', nl: 'Gebruiker Succesvol Aangemaakt', fr: 'Utilisateur créé avec succès' }, description: 'User created toast title' },
  { keyPath: 'toast.passwordCopied.title', category: 'toast', values: { en: 'Password copied', nl: 'Wachtwoord gekopieerd', fr: 'Mot de passe copié' }, description: 'Password copied toast title' },
  { keyPath: 'toast.postCreated.title', category: 'toast', values: { en: 'Post created', nl: 'Bericht aangemaakt', fr: 'Poste créé' }, description: 'Post created toast title' },
  { keyPath: 'toast.postCreated.description', category: 'toast', values: { en: 'Your post has been created successfully', nl: 'Je bericht is succesvol aangemaakt', fr: 'Votre poste a été créé avec succès' }, description: 'Post created toast description' },
  { keyPath: 'toast.postUpdated.title', category: 'toast', values: { en: 'Post updated', nl: 'Bericht bijgewerkt', fr: 'Poste mis à jour' }, description: 'Post updated toast title' },
  { keyPath: 'toast.postUpdated.description', category: 'toast', values: { en: 'Your post has been updated successfully', nl: 'Je bericht is succesvol bijgewerkt', fr: 'Votre poste a été mis à jour avec succès' }, description: 'Post updated toast description' },
  { keyPath: 'toast.postDeleted.title', category: 'toast', values: { en: 'Post deleted', nl: 'Bericht verwijderd', fr: 'Poste supprimé' }, description: 'Post deleted toast title' },
  { keyPath: 'toast.postDeleted.description', category: 'toast', values: { en: 'Your post has been deleted successfully', nl: 'Je bericht is succesvol verwijderd', fr: 'Votre poste a été supprimé avec succès' }, description: 'Post deleted toast description' },
  { keyPath: 'toast.loggedInSuccessfully.title', category: 'toast', values: { en: 'Logged in successfully', nl: 'Succesvol ingelogd', fr: 'Connecté avec succès' }, description: 'Logged in successfully toast title' },

  // Validation Messages
  { keyPath: 'validation.titleRequired', category: 'validation', values: { en: 'Title is required', nl: 'Titel is vereist', fr: 'Le titre est requis' }, description: 'Title required validation message' },
  { keyPath: 'validation.contentRequired', category: 'validation', values: { en: 'Content is required', nl: 'Inhoud is vereist', fr: 'Le contenu est requis' }, description: 'Content required validation message' },
  { keyPath: 'validation.nameRequired', category: 'validation', values: { en: 'Name is required', nl: 'Naam is vereist', fr: 'Le nom est requis' }, description: 'Name required validation message' },
  { keyPath: 'validation.invalidEmail', category: 'validation', values: { en: 'Invalid email', nl: 'Ongeldig e-mailadres', fr: 'E-mail invalide' }, description: 'Invalid email validation message' },
  { keyPath: 'validation.keyPathRequired', category: 'validation', values: { en: 'Key path is required', nl: 'Sleutelpad is vereist', fr: 'Le chemin de clé est requis' }, description: 'Key path required validation message' },
  { keyPath: 'validation.categoryRequired', category: 'validation', values: { en: 'Category is required', nl: 'Categorie is vereist', fr: 'La catégorie est requise' }, description: 'Category required validation message' },
  { keyPath: 'validation.translationRequired', category: 'validation', values: { en: 'At least one translation is required', nl: 'Minimaal één vertaling is vereist', fr: 'Au moins une traduction est requise' }, description: 'Translation required validation message' },

  // Error Messages
  { keyPath: 'errors.failedToUploadImage', category: 'errors', values: { en: 'An error occurred while uploading the image', nl: 'Er is een fout opgetreden bij het uploaden van de afbeelding', fr: 'Une erreur s\'est produite lors du téléchargement de l\'image' }, description: 'Failed to upload image error message' },
  { keyPath: 'errors.failedToCreatePost', category: 'errors', values: { en: 'An error occurred while creating the post', nl: 'Er is een fout opgetreden bij het aanmaken van het bericht', fr: 'Une erreur s\'est produite lors de la création du poste' }, description: 'Failed to create post error message' },
  { keyPath: 'errors.failedToUpdatePost', category: 'errors', values: { en: 'An error occurred while updating the post', nl: 'Er is een fout opgetreden bij het bijwerken van het bericht', fr: 'Une erreur s\'est produite lors de la mise à jour du poste' }, description: 'Failed to update post error message' },
  { keyPath: 'errors.failedToDeletePost', category: 'errors', values: { en: 'An error occurred while deleting the post', nl: 'Er is een fout opgetreden bij het verwijderen van het bericht', fr: 'Une erreur s\'est produite lors de la suppression du poste' }, description: 'Failed to delete post error message' },
  { keyPath: 'errors.failedToSendVerificationCode', category: 'errors', values: { en: 'Failed to send verification code', nl: 'Verificatiecode verzenden mislukt', fr: 'Échec de l\'envoi du code de vérification' }, description: 'Failed to send verification code error message' },
  { keyPath: 'errors.failedToVerifyCode', category: 'errors', values: { en: 'Failed to verify code', nl: 'Code verifiëren mislukt', fr: 'Échec de la vérification du code' }, description: 'Failed to verify code error message' },
  { keyPath: 'errors.failedToCreateUser', category: 'errors', values: { en: 'Failed to create user', nl: 'Gebruiker aanmaken mislukt', fr: 'Échec de la création de l\'utilisateur' }, description: 'Failed to create user error message' },
  { keyPath: 'errors.failedToUploadAvatar', category: 'errors', values: { en: 'Failed to upload avatar', nl: 'Avatar uploaden mislukt', fr: 'Échec du téléchargement de l\'avatar' }, description: 'Failed to upload avatar error message' },
  { keyPath: 'errors.unexpectedError', category: 'errors', values: { en: 'An unexpected error occurred', nl: 'Er is een onverwachte fout opgetreden', fr: 'Une erreur inattendue s\'est produite' }, description: 'Unexpected error message' },

  // Translation UI Specific
  { keyPath: 'translationUi.baseFromSystemTranslation', category: 'translationUi', values: { en: 'Base from System Translation', nl: 'Gebaseerd op Systeemvertaling', fr: 'Basé sur la traduction système' }, description: 'Base from system translation label' },
  { keyPath: 'translationUi.keyPath', category: 'translationUi', values: { en: 'Key Path', nl: 'Sleutelpad', fr: 'Chemin de clé' }, description: 'Key path label' },
  { keyPath: 'translationUi.category', category: 'translationUi', values: { en: 'Category', nl: 'Categorie', fr: 'Catégorie' }, description: 'Category label' },
  { keyPath: 'translationUi.description', category: 'translationUi', values: { en: 'Description', nl: 'Beschrijving', fr: 'Description' }, description: 'Description label' },
  { keyPath: 'translationUi.translations', category: 'translationUi', values: { en: 'Translations', nl: 'Vertalingen', fr: 'Traductions' }, description: 'Translations label' },
  { keyPath: 'translationUi.teamOverrideDescription', category: 'translationUi', values: { en: 'Team Override Description', nl: 'Team Override Beschrijving', fr: 'Description de substitution d\'équipe' }, description: 'Team override description label' },
  { keyPath: 'translationUi.createTranslation', category: 'translationUi', values: { en: 'Create Translation', nl: 'Vertaling Maken', fr: 'Créer une traduction' }, description: 'Create translation button text' },
  { keyPath: 'translationUi.updateTranslation', category: 'translationUi', values: { en: 'Update Translation', nl: 'Vertaling Bijwerken', fr: 'Mettre à jour la traduction' }, description: 'Update translation button text' },
  { keyPath: 'translationUi.teamTranslationOverrides', category: 'translationUi', values: { en: 'Team Translation Overrides', nl: 'Team Vertaling Overschrijvingen', fr: 'Substitutions de traduction d\'équipe' }, description: 'Team translation overrides title' },
  { keyPath: 'translationUi.systemValues', category: 'translationUi', values: { en: 'System Values', nl: 'Systeemwaarden', fr: 'Valeurs système' }, description: 'System values table header' },
  { keyPath: 'translationUi.yourOverride', category: 'translationUi', values: { en: 'Your Override', nl: 'Jouw Overschrijving', fr: 'Votre substitution' }, description: 'Your override table header' },
  { keyPath: 'translationUi.edit', category: 'translationUi', values: { en: 'Edit', nl: 'Bewerken', fr: 'Modifier' }, description: 'Edit button text' },
  { keyPath: 'translationUi.override', category: 'translationUi', values: { en: 'Override', nl: 'Overschrijven', fr: 'Substituer' }, description: 'Override button text' },
  { keyPath: 'translationUi.noTranslation', category: 'translationUi', values: { en: 'No translation', nl: 'Geen vertaling', fr: 'Aucune traduction' }, description: 'No translation text' },
  { keyPath: 'translationUi.noTranslationAvailable', category: 'translationUi', values: { en: 'No translation available', nl: 'Geen vertaling beschikbaar', fr: 'Aucune traduction disponible' }, description: 'No translation available text' },
  { keyPath: 'translationUi.yes', category: 'translationUi', values: { en: 'Yes', nl: 'Ja', fr: 'Oui' }, description: 'Yes text' },
  { keyPath: 'translationUi.no', category: 'translationUi', values: { en: 'No', nl: 'Nee', fr: 'Non' }, description: 'No text' },

  // Dashboard KPIs
  { keyPath: 'dashboard.followers', category: 'dashboard', values: { en: 'Followers', nl: 'Volgers', fr: 'Abonnés' }, description: 'Followers KPI label' },
  { keyPath: 'dashboard.impressions', category: 'dashboard', values: { en: 'Impressions', nl: 'Impressies', fr: 'Impressions' }, description: 'Impressions KPI label' },
  { keyPath: 'dashboard.profileVisits', category: 'dashboard', values: { en: 'Profile Visits', nl: 'Profielbezoeken', fr: 'Visites de profil' }, description: 'Profile visits KPI label' },
  { keyPath: 'dashboard.likes', category: 'dashboard', values: { en: 'Likes', nl: 'Likes', fr: 'J\'aime' }, description: 'Likes KPI label' },
  { keyPath: 'dashboard.impressionsOverview', category: 'dashboard', values: { en: 'Impressions Overview', nl: 'Impressies Overzicht', fr: 'Aperçu des impressions' }, description: 'Impressions overview title' }
]

let successCount = 0
let skipCount = 0
let errorCount = 0

console.log(`🚀 Adding ${translations.length} translations to the database...`)

translations.forEach((translation) => {
  const newTranslation = {
    id: nanoid(),
    userId: 'script',
    keyPath: translation.keyPath,
    category: translation.category,
    values: JSON.stringify(translation.values),
    description: translation.description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  try {
    insert.run(
      newTranslation.id,
      newTranslation.userId,
      newTranslation.keyPath,
      newTranslation.category,
      newTranslation.values,
      newTranslation.description,
      newTranslation.createdAt,
      newTranslation.updatedAt
    )
    console.log(`✅ Added: ${newTranslation.keyPath}`)
    successCount++
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      console.log(`⚠️  Already exists: ${newTranslation.keyPath}`)
      skipCount++
    } else {
      console.error(`❌ Error adding ${newTranslation.keyPath}:`, error)
      errorCount++
    }
  }
})

console.log(`\n📊 Summary:`)
console.log(`✅ Successfully added: ${successCount}`)
console.log(`⚠️  Skipped (already exist): ${skipCount}`)
console.log(`❌ Errors: ${errorCount}`)
console.log(`📝 Total processed: ${translations.length}`)

db.close()