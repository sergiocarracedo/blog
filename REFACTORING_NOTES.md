# Newsletter System Refactoring Notes

## Overview

This document explains the major refactoring from JSON file-based subscriber storage to Resend Contacts API.

## What Changed

### Before (JSON File Approach)

```
User → Subscribe API → GitHub Action → subscribers.json → Monthly Script → Read JSON → Send
```

**Problems with this approach:**
- Unnecessary complexity
- Required GitHub Action for subscription handling
- Needed Octokit dependency for GitHub API
- Manual file management
- Git commits for every subscription
- Custom unsubscribe handling needed
- Race conditions possible with concurrent subscriptions

### After (Resend API Approach)

```
User → Subscribe API → Resend Contacts API → Monthly Script → Fetch from Resend → Send
```

**Benefits:**
- Simpler architecture
- Leverages Resend's built-in features
- No file management needed
- No GitHub API calls
- Automatic unsubscribe handling
- No race conditions
- Fewer dependencies

## Files Removed

### Deleted Files

1. **`subscribers/subscribers.json`**
   - Purpose: Stored subscriber emails
   - Why removed: Using Resend Contacts API instead

2. **`subscribers/README.md`**
   - Purpose: Documentation for subscribers directory
   - Why removed: Directory no longer needed

3. **`.github/workflows/newsletter-subscribe.yml`**
   - Purpose: GitHub Action to add subscribers to JSON file
   - Why removed: Subscriptions now handled directly via Resend API

4. **`scripts/handle-subscription.js`**
   - Purpose: Script to manage JSON file updates
   - Why removed: No longer needed with Resend API

### Modified Files

1. **`src/pages/api/newsletter/subscribe.ts`**
   - **Before:** Sent confirmation email only
   - **After:** Checks Resend API for existing contacts before sending confirmation

   ```typescript
   // OLD: Just send email
   await resend.emails.send({...});
   
   // NEW: Check if exists first
   const { data } = await resend.contacts.list();
   const exists = data.data.some(c => c.email === email);
   if (exists) return error("already subscribed");
   await resend.emails.send({...});
   ```

2. **`src/pages/api/newsletter/confirm.ts`**
   - **Before:** Triggered GitHub Action to update JSON file
   - **After:** Directly adds contact to Resend via API

   ```typescript
   // OLD: Trigger GitHub Action
   await fetch('https://api.github.com/repos/.../dispatches', {
     method: 'POST',
     headers: { Authorization: `token ${GITHUB_TOKEN}` },
     body: JSON.stringify({ event_type: 'add_subscriber', client_payload: { email } })
   });
   
   // NEW: Direct API call
   await resend.contacts.create({
     email: email,
     unsubscribed: false,
   });
   ```

3. **`scripts/send-newsletter.js`**
   - **Before:** Read subscribers from JSON file
   - **After:** Fetch subscribers from Resend API

   ```javascript
   // OLD: Read from file
   const subscribersData = JSON.parse(
     fs.readFileSync('./subscribers/subscribers.json', 'utf-8')
   );
   const subscribers = subscribersData.subscribers;
   
   // NEW: Fetch from API
   const { data } = await resend.contacts.list();
   const subscribers = data.data
     .filter(contact => !contact.unsubscribed)
     .map(contact => contact.email);
   ```

4. **`.env.example`**
   - **Before:** Included GitHub token and repository variables
   - **After:** Removed GitHub-related variables

   ```bash
   # REMOVED:
   # GITHUB_TOKEN=ghp_xxxxx
   # GITHUB_REPOSITORY=username/repo
   
   # KEPT:
   RESEND_API_KEY=re_xxxxx
   GOOGLE_GENERATIVE_AI_API_KEY=AIza...
   FROM_EMAIL=newsletter@example.com
   SITE_URL=https://example.com
   ```

5. **`package.json`**
   - **Before:** Included `@octokit/rest` dependency
   - **After:** Removed Octokit dependency

   ```json
   // REMOVED:
   // "@octokit/rest": "^19.0.5"
   ```

## Architecture Comparison

### Old Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     OLD: JSON File Approach                      │
└─────────────────────────────────────────────────────────────────┘

1. User submits email
   └─→ POST /api/newsletter/subscribe
       └─→ Send confirmation email

2. User clicks confirmation link
   └─→ GET /api/newsletter/confirm?token=xxx
       └─→ Trigger GitHub Action (repository_dispatch)
           └─→ Run newsletter-subscribe.yml
               └─→ Run handle-subscription.js
                   └─→ Read subscribers.json
                   └─→ Add new email
                   └─→ Write subscribers.json
                   └─→ Commit and push

3. Monthly newsletter
   └─→ GitHub Action (cron)
       └─→ Run send-newsletter.js
           └─→ Read subscribers.json
           └─→ Send emails
           └─→ Update post frontmatter
           └─→ Commit and push

Issues:
- Multiple GitHub API calls
- File I/O operations
- Race conditions with concurrent subscriptions
- Complex unsubscribe handling
- Git history cluttered with subscriber changes
```

### New Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  NEW: Resend API Approach                        │
└─────────────────────────────────────────────────────────────────┘

1. User submits email
   └─→ POST /api/newsletter/subscribe
       └─→ Check Resend Contacts API (resend.contacts.list)
       └─→ If exists: return "already subscribed"
       └─→ If new: send confirmation email

2. User clicks confirmation link
   └─→ GET /api/newsletter/confirm?token=xxx
       └─→ Verify JWT token
       └─→ Add to Resend (resend.contacts.create)
       └─→ Done!

3. Monthly newsletter
   └─→ GitHub Action (cron)
       └─→ Run send-newsletter.js
           └─→ Fetch contacts (resend.contacts.list)
           └─→ Filter active subscribers
           └─→ Send emails
           └─→ Update post frontmatter
           └─→ Commit and push (only for frontmatter)

Benefits:
- Direct API calls (no GitHub API needed)
- No file management
- No race conditions
- Automatic unsubscribe (Resend handles it)
- Cleaner git history
- Simpler code
```

## Migration Impact

### No Migration Needed

Since the old implementation was never deployed to production with real subscribers, **no migration is needed**.

If you had subscribers in `subscribers.json`, you would need to:

1. Export emails from JSON file
2. Import to Resend via API or dashboard
3. Deploy updated code

### For Future Reference

If you ever need to migrate subscribers:

```javascript
// Read from old JSON file
const oldSubscribers = JSON.parse(
  fs.readFileSync('./subscribers/subscribers.json', 'utf-8')
);

// Import to Resend
for (const sub of oldSubscribers.subscribers) {
  await resend.contacts.create({
    email: sub.email,
    unsubscribed: false,
  });
  console.log(`Migrated: ${sub.email}`);
}
```

## Code Comparison

### Subscribe Endpoint

**Before:**
```typescript
// Just send email, no duplicate check
const { data, error } = await resend.emails.send({
  from: FROM_EMAIL,
  to: email,
  subject: 'Confirm your subscription',
  react: WelcomeEmail({ confirmUrl }),
});

if (error) {
  return new Response(JSON.stringify({ success: false, message: 'Failed' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

return new Response(JSON.stringify({ success: true }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
});
```

**After:**
```typescript
// Check for duplicates first
const { data: contacts } = await resend.contacts.list();
const existingContact = contacts.data.find(c => c.email === email);

if (existingContact) {
  return new Response(JSON.stringify({ 
    success: false, 
    message: 'This email is already subscribed.' 
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Then send confirmation email
const { error } = await resend.emails.send({
  from: FROM_EMAIL,
  to: email,
  subject: 'Confirm your subscription',
  react: WelcomeEmail({ confirmUrl }),
});

// ... rest of the code
```

### Confirm Endpoint

**Before:**
```typescript
// Trigger GitHub Action
const octokit = new Octokit({ auth: GITHUB_TOKEN });

await octokit.repos.createDispatchEvent({
  owner: GITHUB_REPOSITORY.split('/')[0],
  repo: GITHUB_REPOSITORY.split('/')[1],
  event_type: 'add_subscriber',
  client_payload: {
    email: email,
  },
});
```

**After:**
```typescript
// Direct API call to Resend
await resend.contacts.create({
  email: email,
  unsubscribed: false,
});
```

### Newsletter Script

**Before:**
```javascript
// Read from file
const subscribersFilePath = path.join(process.cwd(), 'subscribers', 'subscribers.json');
const subscribersData = JSON.parse(fs.readFileSync(subscribersFilePath, 'utf-8'));
const subscribers = subscribersData.subscribers.map(sub => sub.email);
```

**After:**
```javascript
// Fetch from API
const { data } = await resend.contacts.list();
const subscribers = data.data
  .filter(contact => !contact.unsubscribed)
  .map(contact => contact.email);
```

## Testing Changes

### Before Refactoring
- Test subscription → Check JSON file was updated
- Test confirmation → Verify GitHub Action ran
- Test newsletter → Read from JSON file

### After Refactoring
- Test subscription → Check Resend dashboard for contact
- Test confirmation → Verify contact added to Resend
- Test newsletter → Fetch from Resend API

## Performance Impact

### Improvements

1. **Faster subscriptions**
   - No GitHub Action trigger
   - Direct API call
   - Fewer round trips

2. **Better reliability**
   - No file I/O
   - No git operations during subscription
   - Resend handles availability

3. **Simpler debugging**
   - Fewer moving parts
   - Clear API responses
   - Resend dashboard for monitoring

### Considerations

1. **API rate limits**
   - Resend free tier: sufficient for typical use
   - contacts.list() called on every subscription check
   - Consider caching if needed (not necessary for low traffic)

2. **Network dependency**
   - Relies on Resend API availability
   - Handles errors gracefully
   - Retry logic could be added if needed

## Security Improvements

### Before
- GitHub token needed (read/write access to repo)
- JSON file in repository (public if repo is public)
- Manual unsubscribe handling

### After
- Only Resend API key needed
- No subscriber data in repository
- Automatic unsubscribe via Resend

## Maintenance Improvements

### Before
- Monitor GitHub Actions logs
- Check JSON file for corruption
- Handle merge conflicts in JSON file
- Manually process unsubscribes

### After
- Monitor Resend dashboard
- No file management
- No merge conflicts
- Automatic unsubscribe handling

## Why This Refactoring Was Necessary

The original JSON file approach was **overcomplicated** for several reasons:

1. **GitHub is not a database** - Using git commits for every subscription is an anti-pattern
2. **Unnecessary dependencies** - Octokit added complexity without real benefit
3. **Race conditions** - Multiple simultaneous subscriptions could corrupt JSON file
4. **Manual unsubscribe** - Would have required custom implementation
5. **Poor scalability** - File size grows, git history cluttered

**Resend Contacts API solves all these problems** by providing a proper contact management system.

## Lessons Learned

1. **Use platform features** - Resend provides contacts for a reason
2. **Avoid premature optimization** - JSON file seemed simple but wasn't
3. **Trust managed services** - Let Resend handle contact management
4. **Simplify architecture** - Fewer moving parts = fewer bugs
5. **Think about scale** - Even if you don't need it now, design for growth

## Future Considerations

With Resend Contacts API, we can now easily:

- Add custom fields to contacts (name, preferences, etc.)
- Segment subscribers by interests
- Track subscription sources
- Export subscribers for analytics
- Integrate with other tools via Resend API

## Conclusion

This refactoring **significantly improves** the newsletter system by:

✅ Simplifying architecture
✅ Reducing dependencies
✅ Improving reliability
✅ Enabling future enhancements
✅ Following best practices
✅ Using proper tools for the job

The new implementation is **production-ready** and **maintainable**.

## References

- [Resend Contacts API Documentation](https://resend.com/docs/api-reference/contacts)
- [Why You Shouldn't Use Git as a Database](https://grimoire.ca/git/stop-using-git-like-a-database)
- [Choosing the Right Storage](https://martinfowler.com/articles/data-monolith-to-mesh.html)

---

**Date:** 2026-02-14  
**Author:** Refactored with OpenCode AI  
**Status:** Complete and deployed
