import { generateSecret, otpauthUri } from './totp.ts'

const secret = generateSecret()

console.log(`
Two-factor authentication for the admin panel
---------------------------------------------
1. Add this line to backend/.env (or to the server environment):

   ADMIN_TOTP_SECRET=${secret}

2. Add the account to Google Authenticator / Authy / 1Password:
   choose "Enter a setup key" and paste the secret above
   (account: admin, type: time-based). Or open this link on the phone:

   ${otpauthUri(secret, 'admin', 'Konditerska')}

3. Restart the backend. The login form will ask for the 6-digit code.
`)
