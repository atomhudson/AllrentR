# Razorpay Quick Fix for Localhost

## ✅ What Was Fixed

1. **Implemented complete Razorpay payment flow** in `SubmitListing.tsx`
2. **Added proper error handling** and user feedback
3. **Integrated with Supabase Edge Function** for secure order creation

## 🚀 Quick Setup Steps

### 1. Get Razorpay Test Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Settings → API Keys → Generate Test Keys
3. Copy your Key ID and Key Secret

### 2. Set Secrets in Supabase

```bash
# If using remote Supabase
supabase secrets set RAZORPAY_KEY_ID=rzp_test_your_key_id
supabase secrets set RAZORPAY_KEY_SECRET=rzp_test_your_key_secret

# If using local Supabase
supabase secrets set RAZORPAY_KEY_ID=rzp_test_your_key_id --local
supabase secrets set RAZORPAY_KEY_SECRET=rzp_test_your_key_secret --local
```

### 3. Deploy Edge Function (if not already deployed)

```bash
supabase functions deploy create-razorpay-order
```

### 4. Test the Payment Flow

1. Start your dev server: `npm run dev`
2. Go to Submit Listing page
3. Fill out the form
4. Select "Paid Listing" option
5. Click "Continue to Payment"
6. Razorpay checkout should open

### 5. Use Test Card

- **Card**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)
- **Name**: Any name

## 🔍 Common Issues

### Issue: "Payment gateway not loaded"
**Fix**: Check browser console. Make sure Razorpay script loads.

### Issue: "Razorpay credentials not configured"
**Fix**: 
```bash
supabase secrets list
```
Make sure secrets are set correctly.

### Issue: Edge function returns 404
**Fix**: 
```bash
supabase functions deploy create-razorpay-order
```

### Issue: CORS errors
**Fix**: The edge function already has CORS headers. Check if function URL is correct.

## 📝 How It Works Now

1. User selects "Paid Listing" and submits
2. Frontend calls `create-razorpay-order` edge function
3. Edge function creates Razorpay order
4. Razorpay checkout modal opens
5. User completes payment
6. On success, listing is created in database
7. User is redirected to profile page

## 🎯 Next Steps

- Test with different scenarios (success, failure, cancellation)
- Verify listings are created correctly after payment
- Check payment transaction IDs are saved
- Test coupon discount functionality

See `RAZORPAY_LOCALHOST_SETUP.md` for detailed documentation.
