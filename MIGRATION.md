# Hosting migration: craigsturgis.com

The live site remains on Netlify until the Vercel deployment, support form, and
custom domains have been verified. Netlify DNS remains authoritative during the
first hosting cutover. Cloudflare DNS is the second cutover.

The Vibecto Vercel project is `craigsturgis-com`, connected to
`craigsturgis/csdc-11ty`. Its staging URL is
`https://craigsturgis-com.vercel.app`. Both custom hostnames are attached, and
Vercel is configured to redirect `www` to the apex with HTTP 308. Vercel asks
for `76.76.21.21` on both hostnames. This is prepared, not yet live.

The existing Vibecto Resend account now contains `craigsturgis.com` as a
sending domain. Receiving in Resend is disabled so Google Workspace remains
the inbound mail provider. Its required DKIM TXT record at
`resend._domainkey` and CNAME records at `rsend` and `send` are present in
both Netlify and Cloudflare DNS. Direct authoritative DNS queries returned
matching values from both providers. Resend shows the sending domain as
verified.

## Vercel

- Import `craigsturgis/csdc-11ty` and deploy a preview using the repository's
  `vercel.json` settings.
- Set `RESEND_API_KEY`, `SUPPORT_FROM_EMAIL`, and `SUPPORT_TO_EMAIL` on the
  Vercel project. Verify the sending domain in Resend before testing the form.
  The destination is `craig@craigsturgis.com`; the sender is
  `At That Age Support <support@craigsturgis.com>`. The nonsecret sender and
  destination variables are set in Production and the migration branch Preview.
- Compare the preview homepage, posts, feed, sitemap, images, privacy page,
  and support form against the live Netlify site. Submit a test support request
  and confirm its delivery and reply address.
- Keep the apex as primary and redirect `www` to it. Use the exact A/CNAME
  targets shown by Vercel for this project.
- Replace only the two Netlify web records in Netlify DNS with those Vercel
  targets. Verify HTTPS, redirects, form delivery, feed, and mail before
  considering the hosting move complete.

## Cloudflare DNS

Netlify currently hosts the zone. WHOIS identifies Tucows Domains Inc. as the
registrar and Hover as the reseller. The Hover account sign-in is needed for
the eventual nameserver change. Public DNS shows no DS record (DNSSEC is not
enabled at the registrar). Netlify's zone shows 17 records before adding
Resend authentication. Cloudflare's assigned nameservers
are `mina.ns.cloudflare.com` and `norman.ns.cloudflare.com`. Its inactive zone
has been prepared with 19 records: two Vercel A records, eight CNAME records,
four distinct Google MX records, and five TXT records. The difference from
Netlify's original zone reflects replacement of its two proprietary web record
types and omission of a duplicate Google MX entry. Direct queries to
Cloudflare's assigned nameserver confirm the Vercel web targets and mail
authentication records.
Before changing nameservers:

- Create the Cloudflare zone and compare its imported records against every
  record in Netlify's DNS dashboard. Cloudflare's automatic scan may miss
  records.
- Confirm all Google Workspace MX records, two Google verification TXT records,
  SendGrid CNAMEs, the `mesmtp._domainkey` TXT record, and the `boostdev`
  CNAME plus its `_lhr.boostdev` TXT record. Their values have been copied.
  The records imported by Cloudflare currently use automatic TTL; newly added
  records use one hour, matching Netlify.
- Confirm the apex and `www` web records use `76.76.21.21`. Both are DNS only,
  as are all eight CNAME records.
- Check mail, the site, `www` redirect, and `boostdev` using Cloudflare's
  assigned nameservers before changing delegation at the registrar.
- Change registrar nameservers to Cloudflare's assigned pair. Keep the Netlify
  DNS zone and site in place through propagation and post-cutover checks.

The existing Netlify zone has five Google MX rows, including two identical
`ALT3.ASPMX.L.GOOGLE.COM` entries and no `ALT4` entry. Public DNS returns
only one `ALT3` result. Review this with Google Workspace guidance before
deciding whether to correct it; do not silently copy the duplicate as a
distinct mail destination.
