export const emailTemplateTypes = [
  'order_confirmation',
  'invoice',
  'password_reset',
  'welcome',
  'order_shipped',
  'payment_received'
] as const

export type EmailTemplateType = typeof emailTemplateTypes[number]

export const defaultTemplates: Record<EmailTemplateType, Record<string, any>> = {
  order_confirmation: {
    en: {
      subject: "Order {{orderNumber}} confirmed",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; background: #fff; }
    .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .button { display: inline-block; padding: 10px 20px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmation</h1>
    </div>
    <div class="content">
      <p>Hi {{customerName}},</p>
      <p>Thank you for your order! Your order #{{orderNumber}} has been confirmed and is being processed.</p>
      
      <div class="order-details">
        <h3>Order Details:</h3>
        <p><strong>Order Number:</strong> {{orderNumber}}</p>
        <p><strong>Date:</strong> {{orderDate}}</p>
        <p><strong>Total:</strong> {{total}}</p>
        
        <h4>Items:</h4>
        {{items}}
      </div>
      
      <p>We'll send you another email when your order ships.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
    </div>
    <div class="footer">
      <p>Thank you for your business!</p>
    </div>
  </div>
</body>
</html>
      `
    },
    nl: {
      subject: "Bestelling {{orderNumber}} bevestigd",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; background: #fff; }
    .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .button { display: inline-block; padding: 10px 20px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Orderbevestiging</h1>
    </div>
    <div class="content">
      <p>Hallo {{customerName}},</p>
      <p>Bedankt voor uw bestelling! Uw bestelling #{{orderNumber}} is bevestigd en wordt verwerkt.</p>
      
      <div class="order-details">
        <h3>Bestelgegevens:</h3>
        <p><strong>Bestelnummer:</strong> {{orderNumber}}</p>
        <p><strong>Datum:</strong> {{orderDate}}</p>
        <p><strong>Totaal:</strong> {{total}}</p>
        
        <h4>Artikelen:</h4>
        {{items}}
      </div>
      
      <p>We sturen u een e-mail wanneer uw bestelling is verzonden.</p>
      <p>Als u vragen heeft, neem dan gerust contact met ons op.</p>
    </div>
    <div class="footer">
      <p>Bedankt voor uw bestelling!</p>
    </div>
  </div>
</body>
</html>
      `
    },
    fr: {
      subject: "Commande {{orderNumber}} confirmée",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; background: #fff; }
    .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .button { display: inline-block; padding: 10px 20px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Confirmation de commande</h1>
    </div>
    <div class="content">
      <p>Bonjour {{customerName}},</p>
      <p>Merci pour votre commande! Votre commande #{{orderNumber}} a été confirmée et est en cours de traitement.</p>
      
      <div class="order-details">
        <h3>Détails de la commande:</h3>
        <p><strong>Numéro de commande:</strong> {{orderNumber}}</p>
        <p><strong>Date:</strong> {{orderDate}}</p>
        <p><strong>Total:</strong> {{total}}</p>
        
        <h4>Articles:</h4>
        {{items}}
      </div>
      
      <p>Nous vous enverrons un autre e-mail lorsque votre commande sera expédiée.</p>
      <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
    </div>
    <div class="footer">
      <p>Merci pour votre commande!</p>
    </div>
  </div>
</body>
</html>
      `
    }
  },
  invoice: {
    en: {
      subject: "Invoice #{{invoiceNumber}} from {{companyName}}",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { padding: 20px 0; border-bottom: 2px solid #333; }
    .content { padding: 20px 0; }
    .invoice-details { margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #ddd; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Invoice</h1>
      <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
      <p><strong>Date:</strong> {{invoiceDate}}</p>
      <p><strong>Due Date:</strong> {{dueDate}}</p>
    </div>
    <div class="content">
      <div class="invoice-details">
        <p><strong>Bill To:</strong></p>
        <p>{{customerName}}<br>{{customerAddress}}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {{items}}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>Total</strong></td>
            <td><strong>{{total}}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <p>Payment is due by {{dueDate}}. Thank you for your business!</p>
    </div>
    <div class="footer">
      <p>{{companyName}}</p>
    </div>
  </div>
</body>
</html>
      `
    },
    nl: {
      subject: "Factuur #{{invoiceNumber}} van {{companyName}}",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { padding: 20px 0; border-bottom: 2px solid #333; }
    .content { padding: 20px 0; }
    .invoice-details { margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #ddd; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Factuur</h1>
      <p><strong>Factuurnummer:</strong> {{invoiceNumber}}</p>
      <p><strong>Datum:</strong> {{invoiceDate}}</p>
      <p><strong>Vervaldatum:</strong> {{dueDate}}</p>
    </div>
    <div class="content">
      <div class="invoice-details">
        <p><strong>Factuur aan:</strong></p>
        <p>{{customerName}}<br>{{customerAddress}}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Omschrijving</th>
            <th>Aantal</th>
            <th>Prijs</th>
            <th>Totaal</th>
          </tr>
        </thead>
        <tbody>
          {{items}}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>Totaal</strong></td>
            <td><strong>{{total}}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <p>Betaling dient te geschieden voor {{dueDate}}. Bedankt voor uw vertrouwen!</p>
    </div>
    <div class="footer">
      <p>{{companyName}}</p>
    </div>
  </div>
</body>
</html>
      `
    },
    fr: {
      subject: "Facture #{{invoiceNumber}} de {{companyName}}",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { padding: 20px 0; border-bottom: 2px solid #333; }
    .content { padding: 20px 0; }
    .invoice-details { margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #ddd; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Facture</h1>
      <p><strong>Numéro de facture:</strong> {{invoiceNumber}}</p>
      <p><strong>Date:</strong> {{invoiceDate}}</p>
      <p><strong>Date d'échéance:</strong> {{dueDate}}</p>
    </div>
    <div class="content">
      <div class="invoice-details">
        <p><strong>Facturer à:</strong></p>
        <p>{{customerName}}<br>{{customerAddress}}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantité</th>
            <th>Prix</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {{items}}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>Total</strong></td>
            <td><strong>{{total}}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <p>Le paiement est dû avant le {{dueDate}}. Merci pour votre confiance!</p>
    </div>
    <div class="footer">
      <p>{{companyName}}</p>
    </div>
  </div>
</body>
</html>
      `
    }
  },
  password_reset: {
    en: {
      subject: "Reset your password",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; background: #fff; }
    .button { display: inline-block; padding: 12px 30px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hi {{userName}},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <div style="text-align: center;">
        <a href="{{resetLink}}" class="button">Reset Password</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">{{resetLink}}</p>
      
      <p>This link will expire in {{expiryTime}} hours.</p>
      <p>If you didn't request this password reset, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>For security reasons, this link will expire soon.</p>
    </div>
  </div>
</body>
</html>
      `
    },
    nl: {
      subject: "Reset je wachtwoord",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; background: #fff; }
    .button { display: inline-block; padding: 12px 30px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Wachtwoord Reset Verzoek</h1>
    </div>
    <div class="content">
      <p>Hallo {{userName}},</p>
      <p>We hebben een verzoek ontvangen om je wachtwoord te resetten. Klik op de onderstaande knop om een nieuw wachtwoord aan te maken:</p>
      
      <div style="text-align: center;">
        <a href="{{resetLink}}" class="button">Wachtwoord Resetten</a>
      </div>
      
      <p>Of kopieer en plak deze link in je browser:</p>
      <p style="word-break: break-all;">{{resetLink}}</p>
      
      <p>Deze link verloopt over {{expiryTime}} uur.</p>
      <p>Als je dit wachtwoord reset verzoek niet hebt aangevraagd, kun je deze e-mail veilig negeren.</p>
    </div>
    <div class="footer">
      <p>Om veiligheidsredenen verloopt deze link binnenkort.</p>
    </div>
  </div>
</body>
</html>
      `
    },
    fr: {
      subject: "Réinitialisez votre mot de passe",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; background: #fff; }
    .button { display: inline-block; padding: 12px 30px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Demande de réinitialisation du mot de passe</h1>
    </div>
    <div class="content">
      <p>Bonjour {{userName}},</p>
      <p>Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe:</p>
      
      <div style="text-align: center;">
        <a href="{{resetLink}}" class="button">Réinitialiser le mot de passe</a>
      </div>
      
      <p>Ou copiez et collez ce lien dans votre navigateur:</p>
      <p style="word-break: break-all;">{{resetLink}}</p>
      
      <p>Ce lien expirera dans {{expiryTime}} heures.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité.</p>
    </div>
    <div class="footer">
      <p>Pour des raisons de sécurité, ce lien expirera bientôt.</p>
    </div>
  </div>
</body>
</html>
      `
    }
  },
  welcome: {
    en: {
      subject: "Welcome to {{companyName}}!",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 5px 5px 0 0; color: white; }
    .content { padding: 20px; background: #fff; }
    .button { display: inline-block; padding: 12px 30px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to {{companyName}}!</h1>
    </div>
    <div class="content">
      <p>Hi {{userName}},</p>
      <p>Welcome aboard! We're excited to have you as part of our community.</p>
      
      <p>Your account has been successfully created. Here's what you can do next:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Explore our features</li>
        <li>Connect with other members</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{loginLink}}" class="button">Get Started</a>
      </div>
      
      <p>If you have any questions, our support team is here to help!</p>
    </div>
    <div class="footer">
      <p>Thank you for joining {{companyName}}!</p>
    </div>
  </div>
</body>
</html>
      `
    },
    nl: {
      subject: "Welkom bij {{companyName}}!",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 5px 5px 0 0; color: white; }
    .content { padding: 20px; background: #fff; }
    .button { display: inline-block; padding: 12px 30px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welkom bij {{companyName}}!</h1>
    </div>
    <div class="content">
      <p>Hallo {{userName}},</p>
      <p>Welkom aan boord! We zijn blij dat je deel uitmaakt van onze gemeenschap.</p>
      
      <p>Je account is succesvol aangemaakt. Dit kun je nu doen:</p>
      <ul>
        <li>Vul je profiel aan</li>
        <li>Ontdek onze functies</li>
        <li>Maak contact met andere leden</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{loginLink}}" class="button">Aan de slag</a>
      </div>
      
      <p>Als je vragen hebt, staat ons ondersteuningsteam voor je klaar!</p>
    </div>
    <div class="footer">
      <p>Bedankt voor je aanmelding bij {{companyName}}!</p>
    </div>
  </div>
</body>
</html>
      `
    },
    fr: {
      subject: "Bienvenue chez {{companyName}}!",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 5px 5px 0 0; color: white; }
    .content { padding: 20px; background: #fff; }
    .button { display: inline-block; padding: 12px 30px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue chez {{companyName}}!</h1>
    </div>
    <div class="content">
      <p>Bonjour {{userName}},</p>
      <p>Bienvenue à bord! Nous sommes ravis de vous avoir dans notre communauté.</p>
      
      <p>Votre compte a été créé avec succès. Voici ce que vous pouvez faire ensuite:</p>
      <ul>
        <li>Complétez votre profil</li>
        <li>Explorez nos fonctionnalités</li>
        <li>Connectez-vous avec d'autres membres</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{loginLink}}" class="button">Commencer</a>
      </div>
      
      <p>Si vous avez des questions, notre équipe de support est là pour vous aider!</p>
    </div>
    <div class="footer">
      <p>Merci de rejoindre {{companyName}}!</p>
    </div>
  </div>
</body>
</html>
      `
    }
  },
  order_shipped: {
    en: {
      subject: "Your order has been shipped!",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; color: white; }
    .content { padding: 20px; background: #fff; }
    .tracking-info { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Order Has Been Shipped!</h1>
    </div>
    <div class="content">
      <p>Hi {{customerName}},</p>
      <p>Great news! Your order #{{orderNumber}} has been shipped and is on its way to you.</p>
      
      <div class="tracking-info">
        <h3>Tracking Information:</h3>
        <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
        <p><strong>Carrier:</strong> {{carrier}}</p>
        <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
      </div>
      
      <p>You can track your package using the tracking number above.</p>
      <p>We'll notify you when your package has been delivered.</p>
    </div>
    <div class="footer">
      <p>Thank you for your order!</p>
    </div>
  </div>
</body>
</html>
      `
    },
    nl: {
      subject: "Je bestelling is verzonden!",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; color: white; }
    .content { padding: 20px; background: #fff; }
    .tracking-info { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Je Bestelling Is Verzonden!</h1>
    </div>
    <div class="content">
      <p>Hallo {{customerName}},</p>
      <p>Goed nieuws! Je bestelling #{{orderNumber}} is verzonden en onderweg naar je toe.</p>
      
      <div class="tracking-info">
        <h3>Track & Trace Informatie:</h3>
        <p><strong>Trackingnummer:</strong> {{trackingNumber}}</p>
        <p><strong>Vervoerder:</strong> {{carrier}}</p>
        <p><strong>Verwachte levering:</strong> {{estimatedDelivery}}</p>
      </div>
      
      <p>Je kunt je pakket volgen met het bovenstaande trackingnummer.</p>
      <p>We laten het je weten wanneer je pakket is afgeleverd.</p>
    </div>
    <div class="footer">
      <p>Bedankt voor je bestelling!</p>
    </div>
  </div>
</body>
</html>
      `
    },
    fr: {
      subject: "Votre commande a été expédiée!",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; color: white; }
    .content { padding: 20px; background: #fff; }
    .tracking-info { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Votre Commande a été Expédiée!</h1>
    </div>
    <div class="content">
      <p>Bonjour {{customerName}},</p>
      <p>Bonne nouvelle! Votre commande #{{orderNumber}} a été expédiée et est en route vers vous.</p>
      
      <div class="tracking-info">
        <h3>Informations de Suivi:</h3>
        <p><strong>Numéro de suivi:</strong> {{trackingNumber}}</p>
        <p><strong>Transporteur:</strong> {{carrier}}</p>
        <p><strong>Livraison estimée:</strong> {{estimatedDelivery}}</p>
      </div>
      
      <p>Vous pouvez suivre votre colis en utilisant le numéro de suivi ci-dessus.</p>
      <p>Nous vous informerons lorsque votre colis aura été livré.</p>
    </div>
    <div class="footer">
      <p>Merci pour votre commande!</p>
    </div>
  </div>
</body>
</html>
      `
    }
  },
  payment_received: {
    en: {
      subject: "Payment received for invoice #{{invoiceNumber}}",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; color: white; }
    .content { padding: 20px; background: #fff; }
    .payment-details { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Received</h1>
    </div>
    <div class="content">
      <p>Hi {{customerName}},</p>
      <p>We've received your payment. Thank you!</p>
      
      <div class="payment-details">
        <h3>Payment Details:</h3>
        <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
        <p><strong>Amount Paid:</strong> {{amountPaid}}</p>
        <p><strong>Payment Date:</strong> {{paymentDate}}</p>
        <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
      </div>
      
      <p>Your account has been updated and this invoice is now marked as paid.</p>
    </div>
    <div class="footer">
      <p>Thank you for your prompt payment!</p>
    </div>
  </div>
</body>
</html>
      `
    },
    nl: {
      subject: "Betaling ontvangen voor factuur #{{invoiceNumber}}",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; color: white; }
    .content { padding: 20px; background: #fff; }
    .payment-details { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Betaling Ontvangen</h1>
    </div>
    <div class="content">
      <p>Hallo {{customerName}},</p>
      <p>We hebben je betaling ontvangen. Bedankt!</p>
      
      <div class="payment-details">
        <h3>Betalingsgegevens:</h3>
        <p><strong>Factuurnummer:</strong> {{invoiceNumber}}</p>
        <p><strong>Betaald bedrag:</strong> {{amountPaid}}</p>
        <p><strong>Betaaldatum:</strong> {{paymentDate}}</p>
        <p><strong>Betaalmethode:</strong> {{paymentMethod}}</p>
      </div>
      
      <p>Je account is bijgewerkt en deze factuur is nu gemarkeerd als betaald.</p>
    </div>
    <div class="footer">
      <p>Bedankt voor je snelle betaling!</p>
    </div>
  </div>
</body>
</html>
      `
    },
    fr: {
      subject: "Paiement reçu pour la facture #{{invoiceNumber}}",
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; color: white; }
    .content { padding: 20px; background: #fff; }
    .payment-details { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Paiement Reçu</h1>
    </div>
    <div class="content">
      <p>Bonjour {{customerName}},</p>
      <p>Nous avons reçu votre paiement. Merci!</p>
      
      <div class="payment-details">
        <h3>Détails du Paiement:</h3>
        <p><strong>Numéro de facture:</strong> {{invoiceNumber}}</p>
        <p><strong>Montant payé:</strong> {{amountPaid}}</p>
        <p><strong>Date de paiement:</strong> {{paymentDate}}</p>
        <p><strong>Méthode de paiement:</strong> {{paymentMethod}}</p>
      </div>
      
      <p>Votre compte a été mis à jour et cette facture est maintenant marquée comme payée.</p>
    </div>
    <div class="footer">
      <p>Merci pour votre paiement rapide!</p>
    </div>
  </div>
</body>
</html>
      `
    }
  }
}