# Publishing to npm

Here is how to publish `zon-format` to the npm registry.

## 1. Prerequisites

- You must have an account on [npmjs.com](https://www.npmjs.com/).
- You must be logged in to npm in your terminal.

## 2. Login

Run the following command and follow the prompts (username, password, email, OTP):

```bash
npm login
```

To verify you are logged in:

```bash
npm whoami
```

## 3. Publish

To publish the package to the public npm registry:

```bash
npm publish
```

> **Note:** The `prepublishOnly` script in `package.json` will automatically run `npm run build` before publishing, so you don't need to build manually.

## 4. Updating the Package

When you want to release a new version (e.g., v1.0.1):

1. **Update Version**:
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   # OR
   npm version minor  # 1.0.0 -> 1.1.0
   # OR
   npm version major  # 1.0.0 -> 2.0.0
   ```
   This command updates `package.json` and creates a git tag.

2. **Push Changes**:
   ```bash
   git push origin main --tags
   ```

3. **Publish Again**:
   ```bash
   npm publish
   ```

## 5. Troubleshooting

- **"You do not have permission to publish 'zon-format'"**:
  - This means the name `zon-format` is already taken by someone else.
  - **Solution**: Change the `"name"` in `package.json` to something unique (e.g., `@your-username/zon-format` or `zon-serializer`).

- **"OTP required"**:
  - If you have 2FA enabled (recommended), you will need to enter the code from your authenticator app when publishing.
