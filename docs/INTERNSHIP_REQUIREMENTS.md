# YCKF Full Stack Internship Requirement Map

## Implemented in this project

- Public website pages: Home, Company, Free Training, Premium Training, Blogs, Contact, Complaints.
- Company dropdown navigation.
- Donation-based premium training UI with GHS/USD validation behavior.
- Student dashboard UI showing enrolled courses, progress, and certificate count.
- Admin login and protected admin users page.
- Role-aware backend foundation using Student, Master Admin, and admin middleware.
- Argon2 password hashing for the active admin login.
- Prisma database with users, roles, courses, lessons, enrollments, payments, certificates, audit logs, and bot logs.
- Admin users API no longer exposes password hashes.
- Certificate verification page UI.
- Certificate verification API.
- Public course listing API.
- Admin course create, update, and delete API for Master Admin and Secondary Admin.
- Admin course management browser screen.
- Role-based login redirects for Student, Master Admin, and Secondary Admin.
- Student enrollment API with premium-payment guard.
- Demo donation payment API with GHS/USD validation.
- Premium course unlock after successful demo donation.
- Student dashboard API with enrollment progress and certificate stats.
- Progress update API that generates a certificate when a course reaches 100%.
- Printable certificate page with QR code verification link.
- WhatsApp and Telegram contact buttons.
- Demo cybersecurity FAQ bot API with backend logging.
- Bot Support frontend page with web chat plus WhatsApp and Telegram links.

## Remaining backend work for final submission

- Password reset flow.
- Secondary Admin creation/restriction screens.
- Real payment provider checkout session creation.
- Stripe/Paystack/Flutterwave webhook completion that unlocks enrollment.
- Native PDF download automation. The printable certificate page can be saved as PDF from the browser.
- Live WhatsApp Cloud/Twilio and Telegram webhook deployment.
- Audit log writes for important admin and payment actions.
- Daily SQLite backup script.
- CSRF protection and production HTTPS deployment configuration.

## Acceptance criteria from PDF

- GHS 40 or USD 3: denied.
- GHS 50 or USD 5: full access after successful payment.
- GHS 100 or equivalent: full access after successful payment.
- GHS 120 or USD 12: error.
- Demo payment unlocks premium courses after validated donation.
- Real Stripe/Paystack webhooks should unlock courses only after successful payment.
- Bots answer cybersecurity FAQs and log interactions.
- Master Admin controls financial settings and Secondary Admins.
- Secondary Admin manages courses, lessons, and enrollments only.
- Certificates are generated and verifiable.
