# Donation Setup - What I Need from Boss

## STRIPE
- Publishable Key (pk_live_... or pk_test_...) - Dashboard → Developers → API keys
- Secret Key (sk_live_... or sk_test_...) - Dashboard → Developers → API keys → Reveal
- Webhook Signing Secret (whsec_...) - Dashboard → Developers → Webhooks → [Create webhook] → Signing secret
  - Webhook URL: `https://[domain]/api/webhooks/stripe`
  - Events: `checkout.session.completed`, `payment_intent.succeeded`
- Account ID (acct_...) - Dashboard → Settings → Account details

## PAYPAL
- Client ID - developer.paypal.com → My Apps & Credentials → [App]
- Client Secret - Same location (click "Show")
- Merchant ID - PayPal Business Account → Account Settings
- Webhook ID - developer.paypal.com → My Apps & Credentials → [App] → Webhooks
  - Webhook URL: `https://[domain]/api/webhooks/paypal`
  - Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

## CONFIGURATION
- Environment: Test/Sandbox or Live/Production?
- Production domain name
- Access method: Add me as team member OR share credentials directly

