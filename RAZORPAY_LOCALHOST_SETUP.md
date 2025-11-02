# Razorpay Localhost Setup Guide

This guide will help you set up Razorpay payment integration for local development.

## Prerequisites

1. Razorpay account (sign up at [razorpay.com](https://razorpay.com))
2. Razorpay test credentials (Key ID and Key Secret)
3. Supabase CLI installed
4. Your Supabase project linked

## Step 1: Get Razorpay Test Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. Create a test key (or use existing test credentials)
4. Copy:
   - **Key ID** (starts with `rzp_test_...`)
   - **Key Secret** (starts with `rzp_test_...`)

⚠️ **Important**: Use test credentials for localhost. Never use live keys in development!

## Step 2: Set Up Edge Function Locally

### Option A: Use Remote Supabase Functions (Recommended for Quick Testing)

If your edge function is deployed to your remote Supabase project:

1. Your function URL will be: `https://your-project-ref.supabase.co/functions/v1/create-razorpay-order`
2. Set Razorpay secrets in your remote Supabase project:
   ```bash
   supabase secrets set RAZORPAY_KEY_ID=rzp_test_your_key_id
   supabase secrets set RAZORPAY_KEY_SECRET=rzp_test_your_key_secret
   ```

### Option B: Run Supabase Locally

If you want to test edge functions locally:

1. **Start Supabase locally**:
   ```bash
   supabase start
   ```

2. **Set local secrets**:
   ```bash
   supabase secrets set RAZORPAY_KEY_ID=rzp_test_your_key_id --local
   supabase secrets set RAZORPAY_KEY_SECRET=rzp_test_your_key_secret --local
   ```

3. **Serve functions locally**:
   ```bash
   supabase functions serve create-razorpay-order --no-verify-jwt
   ```

   This will give you a local URL like: `http://localhost:54321/functions/v1/create-razorpay-order`

4. **Update your frontend** (temporarily for local testing):
   
   You may need to modify the function call to use the local URL. However, the `supabase.functions.invoke()` method should automatically use the local URL if you're using `supabase start`.

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

For local Supabase:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=your-local-anon-key
```

Get the local anon key by running:
```bash
supabase status
```

## Step 4: Test Razorpay Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Submit Listing page**

3. **Fill out the form and select "Paid Listing"**

4. **Click "Continue to Payment"**

5. **Razorpay checkout should open** - Use test card:
   - **Card Number**: `4111 1111 1111 1111`
   - **CVV**: Any 3 digits (e.g., `123`)
   - **Expiry**: Any future date (e.g., `12/25`)
   - **Name**: Any name

## Common Issues and Solutions

### Issue 1: "Payment gateway not loaded"

**Solution**: 
- Check browser console for script loading errors
- Ensure Razorpay script is loading: `https://checkout.razorpay.com/v1/checkout.js`
- Check if script is blocked by ad blocker

### Issue 2: "Razorpay credentials not configured"

**Solution**:
- Verify secrets are set: `supabase secrets list`
- Make sure you're using the correct project (remote vs local)
- Check edge function logs: `supabase functions logs create-razorpay-order`

### Issue 3: "Unauthorized: Authentication required"

**Solution**:
- Make sure you're logged in
- Check if JWT token is being sent correctly
- Verify `verify_jwt = true` in `supabase/config.toml` matches your setup

### Issue 4: Edge function not found (404)

**Solution**:
- Deploy the function: `supabase functions deploy create-razorpay-order`
- If running locally, ensure `supabase start` is running
- Check function URL matches your Supabase project

### Issue 5: CORS errors

**Solution**:
- Edge function already has CORS headers configured
- Check browser console for specific CORS error
- Ensure you're using the correct function endpoint

## Testing with Razorpay Test Cards

Use these test cards in Razorpay test mode:

| Card Number | Scenario |
|------------|----------|
| `4111 1111 1111 1111` | Success |
| `5555 5555 5555 4444` | Success (Visa) |
| `4000 0035 0000 0002` | 3D Secure |
| `4000 0000 0000 0002` | Failure |
| `4000 0000 0000 0069` | Expired Card |

Use any future expiry date and any CVV (3 digits).

## Verification Checklist

- [ ] Razorpay test credentials obtained
- [ ] Secrets set in Supabase (remote or local)
- [ ] Edge function deployed or running locally
- [ ] Environment variables configured
- [ ] Razorpay script loads in browser
- [ ] Payment flow completes successfully
- [ ] Listing created after successful payment

## Debugging

### Check Edge Function Logs

**Remote**:
```bash
supabase functions logs create-razorpay-order
```

**Local**:
Check the terminal where you ran `supabase functions serve`

### Check Browser Console

Open browser DevTools (F12) and check:
- Network tab for API calls
- Console for JavaScript errors
- Application tab for authentication tokens

### Test Edge Function Directly

You can test the function using curl:

```bash
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/create-razorpay-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 20, "currency": "INR"}'
```

Replace `YOUR_JWT_TOKEN` with a valid JWT token from your Supabase session.

## Production Deployment

When deploying to production:

1. **Use Razorpay Live Keys**:
   ```bash
   supabase secrets set RAZORPAY_KEY_ID=rzp_live_your_key_id
   supabase secrets set RAZORPAY_KEY_SECRET=rzp_live_your_key_secret
   ```

2. **Update Razorpay Dashboard**:
   - Add your production domain to allowed domains
   - Complete KYC verification
   - Test thoroughly before going live

3. **Update frontend**:
   - The payment flow should work automatically with live keys
   - No code changes needed if properly configured

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
