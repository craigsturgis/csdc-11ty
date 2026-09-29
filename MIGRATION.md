# craigsturgis.com hosting and DNS

Migration completed September 28–29, 2026. This document covers only
`craigsturgis.com` and `www.craigsturgis.com`.

## Hosting

The live site is the `craigsturgis-com` project in the Vibecto Vercel workspace,
linked to `craigsturgis/csdc-11ty`. The apex is primary; `www` redirects to it
with HTTP 308. Both hostnames have DNS-only A records pointing to
`76.76.21.21`. The deployment uses the repository's `vercel.json` and the
`/api/support` Vercel function. HTTPS, pages, feed, sitemap, redirects, and a
delivered support form submission were verified after the hosting cutover.

The support form uses the existing Vibecto Resend account. Its API key has
sending access restricted to `craigsturgis.com` and is stored as a Vercel
secret. The sender is `At That Age Support <support@craigsturgis.com>` and the
destination is `craig@craigsturgis.com`. Resend receiving is disabled; Google
Workspace continues to receive mail.

## DNS

Hover is the domain registrar. On September 29, Hover's four Netlify
nameservers were replaced with `mina.ns.cloudflare.com` and
`norman.ns.cloudflare.com`. Cloudflare reports the zone active. The `.com`
parent and public resolvers at 1.1.1.1 and 8.8.8.8 returned the Cloudflare
pair after the change. Public DNS returned the Vercel A record and Google
Workspace MX records; the live apex served HTTP 200 from Vercel and `www`
redirected to the apex over HTTPS.

The Cloudflare Free zone contains 19 DNS records. The web A and all CNAME
records are DNS only, so Vercel serves the website directly. The zone preserves
the Google verification and mail records, SendGrid CNAMEs, `boostdev` records,
and Resend's `resend._domainkey` TXT plus `rsend` and `send` CNAMEs. Direct
authoritative queries to Cloudflare and Netlify returned matching Resend DKIM
values. DNSSEC was unsigned at the registrar when the nameservers changed.

Netlify's original zone had two proprietary web records, which were replaced
with Vercel A records during the hosting cutover. It also had two identical
`ALT3.ASPMX.L.GOOGLE.COM` MX rows and no `ALT4` row. Cloudflare contains one
`ALT3` row; public DNS returned the same four distinct Google MX destinations.
Review mail routing against current Google Workspace guidance before changing
these records.

Keep the old Netlify DNS zone available through DNS cache expiry as a rollback
source. If delegation must be reversed, restore the four former Netlify
nameservers at Hover; both zones already direct the website to Vercel and
preserve the same mail routing.
