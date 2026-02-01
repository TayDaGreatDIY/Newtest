# OpenAI API Key Setup Guide

This guide shows you exactly how to set up your OpenAI API key so it works correctly in your M2DG application.

## Important: The API Key is Optional! ✅

**Good news:** Your AI Coach works perfectly **without** an API key using "Basic Coach Mode". You only need to add the API key if you want the full AI-powered features.

## Two Locations for API Key Configuration

Your API key needs to be configured in **different locations** depending on where you're running the app:

### 1. 🏠 Local Development (On Your Computer)

**File Location:** `.env` or `.env.local` file in the project root directory

**Note:** Both `.env` and `.env.local` work. Using `.env.local` is recommended as it takes precedence over `.env`.

#### Step-by-Step Instructions:

**Step 1:** Get your OpenAI API key
- Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Sign in or create an OpenAI account
- Click "Create new secret key"
- Copy the API key (it will look like: `sk-proj-...` or `sk-...`)
- **Save it somewhere safe** - you won't be able to see it again!

**Step 2:** Create your `.env` or `.env.local` file
```bash
# Navigate to your project directory
cd /path/to/Newtest

# Option 1: Create .env file from example
cp .env.example .env

# Option 2: Create .env.local file (recommended)
cp .env.example .env.local
```

**Step 3:** Edit the `.env` or `.env.local` file
Open the file in any text editor and add your keys:

```env
# Supabase Configuration (required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration (optional - for full AI features)
VITE_OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

**Replace:**
- `your-project-id.supabase.co` with your actual Supabase URL
- `your-anon-key-here` with your actual Supabase anon key
- `sk-proj-your-actual-api-key-here` with your actual OpenAI API key

**Step 4:** Restart your development server
```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

**Step 5:** Test it
- Navigate to `/app/thinking-corner` in your browser
- Send a message to the AI Coach
- If the API key is working, you'll get AI-powered responses
- If not configured, you'll see "Basic Coach Mode" info banner (this is normal!)

---

### 2. 🌐 Production/Deployment (GitHub Pages)

**File Location:** GitHub Repository Secrets

Your `.env` file is **NOT** used during deployment. Instead, GitHub Actions uses "repository secrets".

#### Step-by-Step Instructions:

**Step 1:** Get your OpenAI API key (same as above)
- Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Create a new secret key if you haven't already
- Copy the API key

**Step 2:** Add the secret to GitHub
1. Go to your GitHub repository: [https://github.com/TayDaGreatDIY/Newtest](https://github.com/TayDaGreatDIY/Newtest)
2. Click **Settings** (at the top of the repository)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. You should see existing secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY` (may already exist)

**Step 3:** Update or create the OpenAI secret
- If `VITE_OPENAI_API_KEY` exists:
  1. Click the pencil icon (✏️) next to it
  2. Paste your new API key
  3. Click **Update secret**

- If `VITE_OPENAI_API_KEY` doesn't exist:
  1. Click **New repository secret**
  2. Name: `VITE_OPENAI_API_KEY`
  3. Value: Paste your API key (e.g., `sk-proj-...`)
  4. Click **Add secret**

**Step 4:** Trigger a new deployment
```bash
# Make any small change and push to main branch
git add .
git commit -m "Update with API key configuration"
git push origin main
```

Or manually trigger deployment:
1. Go to **Actions** tab in your GitHub repository
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select `main` branch
5. Click **Run workflow**

**Step 5:** Wait for deployment and test
- Wait for the GitHub Action to complete (2-3 minutes)
- Visit your live site: [https://taydagreatdiy.github.io/Newtest/](https://taydagreatdiy.github.io/Newtest/)
- Navigate to the AI Coach section
- Test that it's working with full AI features

---

## 🔍 How to Know if Your API Key is Working

### ✅ API Key is Working (Full AI Mode):
- Messages get personalized, contextual responses
- Responses vary based on conversation history
- No "Basic Coach Mode" banner shown
- More natural, conversational AI responses

### ℹ️ API Key Not Configured (Basic Coach Mode):
- Blue info banner shows: "Basic Coach Mode"
- You get comprehensive pre-programmed responses
- Responses are helpful but not AI-generated
- **This is perfectly fine!** The coach still works great

### ❌ API Key is Invalid or Has Issues:
- Yellow warning banner shows with error message
- Automatically falls back to Basic Coach Mode
- Check the error message for hints:
  - "Invalid OpenAI API key" → Key is wrong format or expired
  - "API quota exceeded" → You've used up your OpenAI credits
  - "Rate limit reached" → Too many requests, wait a moment

---

## 🔒 Security Best Practices

### DO ✅
- Keep your API key secret and never share it
- `.env`, `.env.local`, and `.env.*.local` are already in `.gitignore` (safe!)
- Use GitHub Secrets for production deployment
- Rotate your API key if you think it's been compromised

### DON'T ❌
- Never commit your `.env` or `.env.local` files to Git
- Never share your API key in chat, screenshots, or issues
- Never hardcode the API key in your source code
- Never share your OpenAI account credentials

---

## 🆘 Troubleshooting

### Problem: "Basic Coach Mode" shows but I added my API key

**Solution:**
1. Check your `.env` or `.env.local` file has the correct format:
   ```env
   VITE_OPENAI_API_KEY=sk-proj-your-key-here
   ```
2. Make sure there are no spaces around the `=` sign
3. Make sure the key starts with `sk-` or `sk-proj-`
4. Restart your dev server: `npm run dev`
5. Clear browser cache and reload

### Problem: API key works locally but not in production

**Solution:**
1. Verify the GitHub Secret is added correctly
2. Check the deployment logs in GitHub Actions
3. Look for build errors that mention environment variables
4. Re-deploy after adding/updating the secret

### Problem: "Invalid API key" error

**Solution:**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Update your `.env` file (local) and GitHub Secret (production)
4. Restart/redeploy

### Problem: "API quota exceeded" error

**Solution:**
1. Check your OpenAI billing at [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
2. Add payment method or increase spending limit
3. The app will automatically use Basic Coach Mode until resolved

---

## 📊 Summary Checklist

Use this checklist to ensure your API key is configured correctly:

### Local Development:
- [ ] Created `.env` or `.env.local` file (can copy from `.env.example`)
- [ ] Added `VITE_OPENAI_API_KEY=sk-...` to the file
- [ ] Restarted dev server with `npm run dev`
- [ ] Tested AI Coach and verified it works
- [ ] Confirmed `.env` and `.env.local` are in `.gitignore` (never commit them!)

### Production Deployment:
- [ ] Obtained OpenAI API key from platform.openai.com
- [ ] Added `VITE_OPENAI_API_KEY` to GitHub Repository Secrets
- [ ] Triggered new deployment (push to main or manual trigger)
- [ ] Verified deployment completed successfully
- [ ] Tested live site AI Coach functionality

---

## 💡 Quick Reference

| What | Where | How |
|------|-------|-----|
| **Get API Key** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Create new secret key |
| **Local Config** | `.env` or `.env.local` in project root | `VITE_OPENAI_API_KEY=sk-...` |
| **Production Config** | GitHub → Settings → Secrets → Actions | Add `VITE_OPENAI_API_KEY` secret |
| **Restart Local** | Terminal | `npm run dev` |
| **Redeploy** | GitHub → Actions | Push to main or manual trigger |
| **Test AI Coach** | Browser | Navigate to `/app/thinking-corner` |

---

## Need More Help?

- **Local Development Issues:** Check `ENV_SETUP.md`
- **Supabase Configuration:** Check `SUPABASE_SETUP.md`
- **AI Coach Features:** Check `AI_COACH_FEATURES.md`
- **General Setup:** Check `README.md`

Remember: The AI Coach works great even without the API key in "Basic Coach Mode"! Adding the API key is completely optional. 🎯
