# Netlify Identity and Git Gateway Setup

Use this checklist after the site is connected to Netlify.

## 1. Connect the repository
1. Open the site in the Netlify dashboard.
2. Confirm the repository is linked and the production branch is correct.
3. Verify that the build settings match [`netlify.toml`](../netlify.toml): `npm run build` and publish directory `dist`.

## 2. Enable Identity
1. In the Netlify dashboard, open **Identity**.
2. Select **Enable Identity**.
3. Under **Registration preferences**, choose **Invite only**.
4. Leave open registration disabled so only invited moderators can access `/admin/`.
5. Optionally enable **OAuth providers** only if you want a social login path for trusted administrators.

## 3. Enable Git Gateway
1. In the same **Identity** area, open **Services**.
2. Enable **Git Gateway**.
3. Confirm the gateway is connected to the same repository branch used by the site.
4. Save the configuration.

## 4. Add moderators
1. Open **Identity > Users**.
2. Click **Invite users**.
3. Enter the moderator email addresses.
4. Send the invitations and have each moderator complete the sign-up flow from the email link.

## 5. Confirm admin access
1. Visit `https://yourdomain.com/admin/`.
2. Sign in with an invited moderator account.
3. Confirm Decap CMS loads and can create or edit content.
4. Verify that publishing writes commits back to the Git repository through Git Gateway.

## 6. Validate content publishing
1. Create a test post in Decap CMS.
2. Publish it.
3. Confirm the JSON file is committed to the repository.
4. Confirm the production site rebuilds and the new content appears after deployment.

## 7. Operational guidance
1. Keep registration set to **Invite only** for moderator safety.
2. Remove unused user accounts from **Identity > Users**.
3. Review commit history regularly so content changes stay auditable.
4. Use branch protection in Git hosting if you want stronger approval control before deployment.
