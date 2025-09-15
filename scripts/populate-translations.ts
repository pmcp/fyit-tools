#!/usr/bin/env node
/**
 * Script to populate the translations_ui database table with all missing translations
 * Run with: npx tsx scripts/populate-translations.ts
 */

import { drizzle } from 'drizzle-orm/d1'
import { translationsUi } from '../layers/translations/collections/ui/server/database/schema'
import { nanoid } from 'nanoid'

// The comprehensive translations to add
const translationsToAdd = {
  "navigation": {
    "posts": { en: "Posts", nl: "Berichten", fr: "Articles" },
    "teamTranslations": { en: "Team Translations", nl: "Team Vertalingen", fr: "Traductions d'équipe" },
    "workspaceSettings": { en: "Workspace Settings", nl: "Werkruimte Instellingen", fr: "Paramètres de l'espace de travail" },
    "workspaceMembers": { en: "Workspace Members", nl: "Werkruimte Leden", fr: "Membres de l'espace de travail" },
    "accountSettings": { en: "Account Settings", nl: "Account Instellingen", fr: "Paramètres du compte" },
    "superAdmin": { en: "Super Admin", nl: "Super Admin", fr: "Super Admin" },
    "teamSettings": { en: "Team Settings", nl: "Team Instellingen", fr: "Paramètres de l'équipe" },
    "members": { en: "Members", nl: "Leden", fr: "Membres" }
  },
  "auth": {
    "getStarted": { en: "Get Started with Supersaas", nl: "Begin met Supersaas", fr: "Commencez avec Supersaas" },
    "alreadyHaveAccount": { en: "Already have an account?", nl: "Heeft u al een account?", fr: "Vous avez déjà un compte?" },
    "dontHaveAccount": { en: "Don't have an account?", nl: "Heeft u geen account?", fr: "Vous n'avez pas de compte?" },
    "submit": { en: "Submit", nl: "Verzenden", fr: "Soumettre" },
    "loginWithGoogle": { en: "Google", nl: "Google", fr: "Google" },
    "loginWithGithub": { en: "Github", nl: "Github", fr: "Github" },
    "loginWithDiscord": { en: "Discord", nl: "Discord", fr: "Discord" },
    "phoneNumberLogin": { en: "Phone Number Login", nl: "Telefoonnummer Login", fr: "Connexion par numéro de téléphone" },
    "loginWithPasskey": { en: "Login with Passkey", nl: "Inloggen met Passkey", fr: "Connexion avec Passkey" },
    "loginWithMagicLink": { en: "Login with Magic Link", nl: "Inloggen met Magic Link", fr: "Connexion avec Magic Link" },
    "socialLogin": { en: "Social Login", nl: "Social Login", fr: "Connexion sociale" },
    "generatePassword": { en: "Generate Password", nl: "Wachtwoord Genereren", fr: "Générer un mot de passe" },
    "inviteUser": { en: "Invite User", nl: "Gebruiker Uitnodigen", fr: "Inviter un utilisateur" },
    "autoVerifyUser": { en: "Auto verify user", nl: "Gebruiker automatisch verifiëren", fr: "Vérifier automatiquement l'utilisateur" },
    "userCreatedSuccessfully": { en: "User Created Successfully", nl: "Gebruiker Succesvol Aangemaakt", fr: "Utilisateur créé avec succès" },
    "passwordCopied": { en: "Password copied", nl: "Wachtwoord gekopieerd", fr: "Mot de passe copié" },
    "nameIsRequired": { en: "Name is required", nl: "Naam is verplicht", fr: "Le nom est requis" },
    "invalidEmail": { en: "Invalid email", nl: "Ongeldig e-mailadres", fr: "Email invalide" }
  },
  "billing": {
    "title": { en: "Billing", nl: "Facturering", fr: "Facturation" },
    "description": { en: "Manage your billing information and subscription plans", nl: "Beheer uw facturatiegegevens en abonnementen", fr: "Gérez vos informations de facturation et vos plans d'abonnement" },
    "youAreOn": { en: "You are on", nl: "U bent op", fr: "Vous êtes sur" },
    "youAreOnThe": { en: "You are on the", nl: "U bent op het", fr: "Vous êtes sur le" },
    "plan": { en: "plan", nl: "abonnement", fr: "plan" },
    "freePlan": { en: "Free", nl: "Gratis", fr: "Gratuit" },
    "upgradeToPaid": { en: "Upgrade to a paid plan to unlock more features and higher usage limits", nl: "Upgrade naar een betaald abonnement voor meer functies en hogere gebruikslimieten", fr: "Passez à un plan payant pour débloquer plus de fonctionnalités" },
    "every": { en: "every", nl: "elke", fr: "chaque" },
    "business": { en: "Business", nl: "Zakelijk", fr: "Business" },
    "hobby": { en: "Hobby", nl: "Hobby", fr: "Loisir" },
    "upgrade": { en: "Upgrade", nl: "Upgraden", fr: "Améliorer" }
  },
  "forms": {
    "rowsPerPage": { en: "Rows per page", nl: "Rijen per pagina", fr: "Lignes par page" },
    "optional": { en: "Optional", nl: "Optioneel", fr: "Optionnel" },
    "required": { en: "Required", nl: "Verplicht", fr: "Requis" },
    "keyPath": { en: "Key Path", nl: "Sleutelpad", fr: "Chemin de clé" },
    "keyPathRequired": { en: "Key path is required", nl: "Sleutelpad is verplicht", fr: "Le chemin de clé est requis" },
    "category": { en: "Category", nl: "Categorie", fr: "Catégorie" },
    "categoryRequired": { en: "Category is required", nl: "Categorie is verplicht", fr: "La catégorie est requise" },
    "values": { en: "Values", nl: "Waarden", fr: "Valeurs" },
    "description": { en: "Description", nl: "Beschrijving", fr: "Description" },
    "optionalDescription": { en: "Optional description", nl: "Optionele beschrijving", fr: "Description optionnelle" },
    "teamLogo": { en: "Team logo (Recommended size: 1 MB, 1:1 aspect ratio)", nl: "Team logo (Aanbevolen: 1 MB, 1:1 verhouding)", fr: "Logo d'équipe (Taille recommandée: 1 MB, ratio 1:1)" },
    "canBeOverriddenByTeams": { en: "Can be overridden by teams", nl: "Kan worden overschreven door teams", fr: "Peut être remplacé par les équipes" }
  },
  "table": {
    "display": { en: "Display", nl: "Weergave", fr: "Affichage" },
    "selectAll": { en: "Select all", nl: "Alles selecteren", fr: "Tout sélectionner" },
    "selectRow": { en: "Select row", nl: "Rij selecteren", fr: "Sélectionner la ligne" },
    "noTranslation": { en: "No translation", nl: "Geen vertaling", fr: "Pas de traduction" },
    "noTranslationAvailable": { en: "No translation available", nl: "Geen vertaling beschikbaar", fr: "Aucune traduction disponible" },
    "overrideable": { en: "Overrideable", nl: "Overschrijfbaar", fr: "Remplaçable" },
    "createdAt": { en: "Created At", nl: "Aangemaakt op", fr: "Créé le" },
    "updatedAt": { en: "Updated At", nl: "Bijgewerkt op", fr: "Mis à jour le" },
    "actions": { en: "Actions", nl: "Acties", fr: "Actions" },
    "items": { en: "Items", nl: "Items", fr: "Articles" },
    "data": { en: "Data", nl: "Data", fr: "Données" },
    "unknownTeam": { en: "Unknown Team", nl: "Onbekend Team", fr: "Équipe inconnue" }
  },
  "messages": {
    "success": { en: "Success", nl: "Succes", fr: "Succès" },
    "error": { en: "Error", nl: "Fout", fr: "Erreur" },
    "warning": { en: "Warning", nl: "Waarschuwing", fr: "Avertissement" },
    "info": { en: "Information", nl: "Informatie", fr: "Information" },
    "operationSuccessful": { en: "Operation successful", nl: "Operatie succesvol", fr: "Opération réussie" },
    "failedToSave": { en: "Failed to save", nl: "Opslaan mislukt", fr: "Échec de la sauvegarde" },
    "failedToDelete": { en: "Failed to delete", nl: "Verwijderen mislukt", fr: "Échec de la suppression" },
    "failedToUpdate": { en: "Failed to update", nl: "Bijwerken mislukt", fr: "Échec de la mise à jour" },
    "failedToCreate": { en: "Failed to create", nl: "Aanmaken mislukt", fr: "Échec de la création" },
    "failedToLoad": { en: "Failed to load", nl: "Laden mislukt", fr: "Échec du chargement" },
    "failedToFetch": { en: "Failed to fetch", nl: "Ophalen mislukt", fr: "Échec de la récupération" },
    "translationsSynced": { en: "Translations synced to JSON files successfully", nl: "Vertalingen succesvol gesynchroniseerd", fr: "Traductions synchronisées avec succès" },
    "importComplete": { en: "Import Complete", nl: "Import Voltooid", fr: "Import terminé" },
    "importFailed": { en: "Import Failed", nl: "Import Mislukt", fr: "Échec de l'import" },
    "noTextToCopy": { en: "No text to copy", nl: "Geen tekst om te kopiëren", fr: "Pas de texte à copier" },
    "copiedToClipboard": { en: "Copied to clipboard", nl: "Gekopieerd naar klembord", fr: "Copié dans le presse-papiers" },
    "failedToCopy": { en: "Failed to copy text", nl: "Kopiëren mislukt", fr: "Échec de la copie" }
  },
  "team": {
    "createNewTeam": { en: "Create a new team", nl: "Maak een nieuw team", fr: "Créer une nouvelle équipe" },
    "settings": { en: "Team Settings", nl: "Team Instellingen", fr: "Paramètres de l'équipe" },
    "members": { en: "Team Members", nl: "Teamleden", fr: "Membres de l'équipe" },
    "copyEmail": { en: "Copy Email", nl: "E-mail kopiëren", fr: "Copier l'email" },
    "copyUserId": { en: "Copy User ID", nl: "Gebruikers-ID kopiëren", fr: "Copier l'ID utilisateur" },
    "removeFromTeam": { en: "Remove from team", nl: "Verwijderen uit team", fr: "Retirer de l'équipe" },
    "member": { en: "Member", nl: "Lid", fr: "Membre" },
    "admin": { en: "Admin", nl: "Admin", fr: "Admin" },
    "owner": { en: "Owner", nl: "Eigenaar", fr: "Propriétaire" },
    "systemTranslations": { en: "System Translations", nl: "Systeem Vertalingen", fr: "Traductions système" },
    "teamTranslations": { en: "Team Translations", nl: "Team Vertalingen", fr: "Traductions d'équipe" },
    "detailsAndReply": { en: "Details & Reply", nl: "Details & Antwoord", fr: "Détails et réponse" },
    "markAsClosed": { en: "Mark as Closed", nl: "Markeren als Gesloten", fr: "Marquer comme fermé" }
  },
  "common": {
    "edit": { en: "Edit", nl: "Bewerken", fr: "Modifier" },
    "delete": { en: "Delete", nl: "Verwijderen", fr: "Supprimer" },
    "create": { en: "Create", nl: "Aanmaken", fr: "Créer" },
    "update": { en: "Update", nl: "Bijwerken", fr: "Mettre à jour" },
    "copy": { en: "Copy", nl: "Kopiëren", fr: "Copier" },
    "show": { en: "Show", nl: "Tonen", fr: "Afficher" },
    "hide": { en: "Hide", nl: "Verbergen", fr: "Masquer" },
    "showExample": { en: "Show Example", nl: "Voorbeeld tonen", fr: "Afficher l'exemple" },
    "hideExample": { en: "Hide Example", nl: "Voorbeeld verbergen", fr: "Masquer l'exemple" },
    "yes": { en: "Yes", nl: "Ja", fr: "Oui" },
    "no": { en: "No", nl: "Nee", fr: "Non" },
    "upgrade": { en: "Upgrade", nl: "Upgraden", fr: "Améliorer" },
    "change": { en: "Change", nl: "Wijzigen", fr: "Changer" },
    "upload": { en: "Upload", nl: "Uploaden", fr: "Télécharger" }
  }
}

// Convert to database format
const translations = []
for (const [category, items] of Object.entries(translationsToAdd)) {
  for (const [key, values] of Object.entries(items)) {
    translations.push({
      id: nanoid(),
      teamId: null, // System-level translation
      userId: 'system', // We'll need to update this with actual user ID
      namespace: 'ui',
      keyPath: `${category}.${key}`,
      category: category,
      values: values,
      description: null,
      isOverrideable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
}

console.log(`Prepared ${translations.length} translations for insertion`)
console.log(JSON.stringify(translations, null, 2))