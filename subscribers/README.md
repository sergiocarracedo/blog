# Subscribers Directory

This directory stores the newsletter subscriber list.

## File Structure

- `subscribers.json` - List of all subscribers with their metadata

## Data Format

Each subscriber entry contains:

```json
{
  "email": "user@example.com",
  "confirmed": true,
  "subscribeDate": "2026-02-10T12:00:00.000Z",
  "confirmDate": "2026-02-10T12:05:00.000Z",
  "source": "website"
}
```

## Security Note

This file contains email addresses. While it's stored in the repository for simplicity, in a production environment with stricter privacy requirements, consider:

1. Encrypting the file contents
2. Using environment variables to encrypt/decrypt
3. Or using a database/external service instead

## Maintenance

Subscribers are automatically:

- Added when they submit the form
- Confirmed when they click the confirmation link
- Used by the monthly newsletter GitHub Action
