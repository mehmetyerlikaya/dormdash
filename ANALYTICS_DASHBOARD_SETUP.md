# 📊 Analytics Dashboard Setup

## 🔐 **Private Analytics Dashboard**

### **Access URL**
```
https://your-domain.com/admin-analytics-9f8b7c2
```

### **Password Setup**
The dashboard is protected by a password stored in environment variables:

1. **Local Development**: Password is in `.env.local`
2. **Production**: Set environment variable in your hosting platform (Vercel, etc.)

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_ADMIN_ANALYTICS_PASSWORD=YourSecretPasswordHere
```

### **Default Password**
- **Current**: `Dorm2024Secret!`
- **Change this** in production for security!

---

## 📈 **Dashboard Features**

### **Main Metrics**
- **Total Users**: Unique device users tracked
- **Active Today**: Users who visited today
- **Actions This Week**: Feature usage in last 7 days
- **Chat Posts**: Total anonymous chat posts

### **Detailed Analytics**
- **Device Types**: Mobile/Desktop/Tablet breakdown
- **Top Features**: Most used features and actions
- **Top Machines**: Most interacted with laundry machines
- **Chat Activity**: Posts and reactions count
- **Recent Activity**: Last 10 user actions with timestamps

---

## 🛡️ **Security Features**

### **Access Control**
- ✅ **Secret URL**: Only accessible via direct link
- ✅ **Password Protection**: Required to view dashboard
- ✅ **No Navigation Links**: Not linked from main app
- ✅ **Environment Variables**: Password not in code

### **Data Privacy**
- ✅ **Anonymous Tracking**: No personal data collected
- ✅ **Device-based IDs**: No real user identification
- ✅ **Aggregated Data**: Only shows usage statistics

---

## 🚀 **Deployment**

### **Local Testing**
1. Start development server: `pnpm dev`
2. Visit: `http://localhost:3000/admin-analytics-9f8b7c2`
3. Enter password: `Dorm2024Secret!`

### **Production Setup**
1. Set environment variable in your hosting platform:
   ```
   NEXT_PUBLIC_ADMIN_ANALYTICS_PASSWORD=YourProductionPassword
   ```
2. Deploy your app
3. Access: `https://your-domain.com/admin-analytics-9f8b7c2`

---

## 📊 **Data Sources**

### **Analytics Tables**
- `user_analytics`: User visits, device info, session data
- `feature_usage`: Feature interactions, machine usage, chat activity

### **Real-time Updates**
- Dashboard refreshes data on each visit
- No automatic updates (manual refresh required)

---

## 🔧 **Customization**

### **Adding New Metrics**
1. Update `AnalyticsData` interface in dashboard
2. Add data fetching logic in `loadAnalytics()`
3. Create new UI components for display

### **Changing Password**
1. Update `.env.local` for local development
2. Update environment variable in production
3. Restart application

---

## 📝 **Usage Notes**

- **Data Collection**: Starts when users visit the main page
- **Storage**: All data stored in Supabase analytics tables
- **Retention**: No automatic data deletion (manual cleanup required)
- **Performance**: Dashboard loads data on-demand

---

## 🆘 **Troubleshooting**

### **Password Not Working**
- Check environment variable is set correctly
- Restart development server after changing `.env.local`
- Verify variable name: `NEXT_PUBLIC_ADMIN_ANALYTICS_PASSWORD`

### **No Data Showing**
- Ensure users have visited the main page (triggers tracking)
- Check Supabase connection and table permissions
- Verify analytics tables exist in database

### **Dashboard Not Loading**
- Check browser console for errors
- Verify all analytics components are imported correctly
- Ensure Supabase client is properly configured 