# MongoDB Atlas Cloud Database Setup Guide

## 📋 What You'll Do

Migrate from local MongoDB to MongoDB Atlas (cloud-hosted, free tier available).

---

## 🚀 Step 1: Create MongoDB Atlas Account

1. **Go to:** https://www.mongodb.com/cloud/atlas
2. **Click:** "Try Free"
3. **Sign up** with email (or Google/GitHub)
4. **Verify** your email

---

## 🏗️ Step 2: Create Your First Cluster

1. **After login**, click "Create a Deployment"
2. **Choose:** "Free" tier (M0 - perfect for development/small apps)
3. **Select Region:** Choose closest to your users (e.g., `us-east-1` if in US)
4. **Cluster Name:** `askmeanon` (or any name)
5. **Click:** "Create"

⏳ *Cluster creation takes 1-3 minutes*

---

## 🔐 Step 3: Create Database User

1. **In Atlas Dashboard**, go to **Security → Database Access**
2. **Click:** "Add New Database User"
3. **Username:** `askmeanon-admin` (or preferred name)
4. **Password:** Generate strong password (30+ characters, save it!)
5. **Privileges:** Select "Read and write to any database"
6. **Click:** "Add User"

---

## 🌐 Step 4: Get Connection String

1. **Go to:** Clusters → Your cluster → "Connect"
2. **Select:** "Drivers" (not Shell)
3. **Driver:** Node.js
4. **Version:** 4.1 or later
5. **Copy** the connection string

It looks like:
```
mongodb+srv://askmeanon-admin:<password>@askmeanon.xyz123abc.mongodb.net/askmeanon?retryWrites=true&w=majority
```

---

## 🛡️ Step 5: Configure Network Access

1. **Go to:** Security → Network Access
2. **Click:** "Add IP Address"
3. **Select:** "Allow access from anywhere" (0.0.0.0/0)
   - ⚠️ *For production, whitelist only your server IP*
4. **Click:** "Confirm"

---

## ✏️ Step 6: Update Your .env File

Replace the `MONGODB_URI` in your `.env` file with your connection string:

```env
MONGODB_URI=mongodb+srv://askmeanon-admin:YOUR_PASSWORD@askmeanon.xyz123abc.mongodb.net/askmeanon?retryWrites=true&w=majority
```

**Remember to:**
- Replace `YOUR_PASSWORD` with your actual database password
- Keep the rest of the connection string exactly as provided
- Never share this URL or commit to Git (.env is already in .gitignore)

---

## 🧪 Step 7: Test Connection

1. **Start your server:**
   ```bash
   npm start
   ```

2. **Look for this in terminal:**
   ```
   ✅ Connected to MongoDB Atlas
   ```

3. **Test the API:**
   ```bash
   # Create a user
   curl -X POST http://localhost:3000/api/users/create \
     -H "Content-Type: application/json" \
     -d '{"name":"TestUser"}'
   ```

4. **Check Atlas Dashboard:**
   - Go to Collections to see your data stored in the cloud

---

## 📊 Step 8: Verify Data is Stored in Cloud

1. **In Atlas Dashboard**, click your cluster
2. **Go to:** "Collections"
3. **You should see:** Your database with User and Message collections
4. **Test:** Create a question/answer and verify it appears in Atlas

---

## 🔒 Production Security Checklist

When deploying to production:

```
☐ Change Network Access to whitelist ONLY your server IP
  - Get your server's public IP from your hosting provider
  - Go to Security → Network Access → Edit → Replace 0.0.0.0/0 with your IP

☐ Create separate database user for production
  - Different username and password than development

☐ Enable automatic backups
  - In Cluster → Backup

☐ Configure alerts
  - In Monitoring for high memory/CPU usage

☐ Update .env with production connection string

☐ Test all endpoints before going live
```

---

## ❓ FAQs

### Q: Is MongoDB Atlas free?
**A:** Yes! The M0 tier is always free with 512MB storage. Perfect for small apps.

### Q: How much data can I store?
**A:** M0 (free): 512MB, M2: 2GB, M5: 5GB, M10+: Larger. Upgrade anytime.

### Q: Will my local data transfer?
**A:** No. Your cloud database starts fresh. Optionally, you can:
- Export local data: `mongodump`
- Import to Atlas: `mongorestore`

### Q: How do I access my data?
**A:** 
- **Atlas Dashboard:** View collections, run queries
- **MongoDB Compass:** Download free GUI tool for advanced operations
- **Your app:** Uses connection string automatically

### Q: What if I want to go back to local?
**A:** Just change `MONGODB_URI` back to `mongodb://localhost:27017/askmeanon`

---

## 🆘 Troubleshooting

**Connection fails:**
- ✓ Check password in connection string (URL-encode special characters: `@` → `%40`)
- ✓ Verify IP whitelisted in Network Access
- ✓ Check database user exists in Database Access
- ✓ Confirm .env file has correct MONGODB_URI

**Wrong database name:**
- Connection string should end with `/askmeanon`
- If you used different name, update accordingly

**Still can't connect:**
- Test locally: `mongo "your-connection-string"`
- Check Atlas console for errors
- Verify Node.js version: `node --version` (14+ required)

---

## 📞 Support

- **MongoDB Atlas Help:** https://docs.atlas.mongodb.com
- **Connection Troubleshooting:** https://docs.atlas.mongodb.com/troubleshooting/connection-string
- **Can't log in?** Use "Forgot Password" or create new account

---

**Status:** Ready to connect to MongoDB Atlas ✅
