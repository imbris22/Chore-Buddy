# Firebase Setup Instructions

## Firestore Database Configuration

Your app is now integrated with Firebase Firestore for real-time cross-device updates!

### Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **chore-buddy-1**
3. Navigate to **Build > Firestore Database**
4. Click **Create Database**
5. Choose **Start in test mode** (for development)
6. Select a location (e.g., `us-central`)

### Step 2: Update Security Rules

Once your database is created, update the security rules:

1. Go to **Firestore Database > Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to circles
    match /circles/{circleId} {
      allow read, write: if true;
    }
    
    // Allow read/write access to tasks
    match /tasks/{taskId} {
      allow read, write: if true;
    }
    
    // Allow read/write access to grocery list
    match /grocery/{groceryId} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**

> **Note:** These rules allow anyone to read/write. For production, implement proper authentication and restrict access.

### Step 3: Test Your App

1. Start your app: `npx expo start`
2. Open on multiple devices
3. Make changes on one device (add chores, complete tasks, add grocery items)
4. Watch them sync in real-time across all devices!

### What's Synced?

- ✅ **Circle Members** - User profiles and avatars
- ✅ **Chores & Tasks** - All chores, assignments, and completion status
- ✅ **Points & Rankings** - Member points and tie-breaking
- ✅ **Grocery List** - Shared grocery items
- ✅ **History** - Task completion history

### Troubleshooting

**Changes not syncing?**
- Check your internet connection
- Verify Firestore is enabled in Firebase Console
- Check the browser console for errors
- Make sure security rules are published

**Data not persisting?**
- Data is stored both locally (AsyncStorage) and in Firestore
- Local storage provides offline support
- Firestore provides cross-device sync

### Production Considerations

For production deployment:
1. Implement Firebase Authentication
2. Update security rules to require authentication
3. Add user-specific circle access control
4. Consider using subcollections for better data organization
5. Set up indexes for complex queries

### Need Help?

- [Firebase Documentation](https://firebase.google.com/docs/firestore)
- [React Native Firebase](https://rnfirebase.io/)
