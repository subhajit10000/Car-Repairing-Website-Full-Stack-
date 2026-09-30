

## Razorpay Test Mode

Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from the Razorpay Dashboard while Test Mode is enabled. The backend creates Orders server-side and verifies the Checkout signature before marking either the estimate or final payment as paid.

Payment lifecycle:
- Estimated amount: paid before `IN_PROGRESS`.
- Remaining balance: paid after `COMPLETED`.
- Invoice: generated/emailed after the final payment is verified.
