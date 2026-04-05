import { test } from 'node:test';
import assert from 'node:assert';
import { appStore } from './store.ts';

test('Security Fix: Direct payment update should fail', () => {
  const reqId = 'req_123';
  // Attempting to bypass payment by calling updateRequest directly
  assert.throws(() => {
    appStore.updateRequest(reqId, { status: 'paid' });
  }, /Security Violation/);
});

test('Security Fix: processPayment should work for valid requests', () => {
  const reqId = 'req_123';
  // req_123 is seeded with status 'pending_triage'
  // We need it to be 'awaiting_payment' or 'prescribed'
  // We can use internal=true to set it up if needed, but here pending_triage is allowed to be updated to awaiting_payment
  appStore.updateRequest(reqId, { status: 'awaiting_payment' });

  appStore.processPayment(reqId);

  const req = appStore.getRequests('client', 'user_patient').find(r => r.id === reqId);
  assert.strictEqual(req?.status, 'paid');
});

test('Security Fix: processPayment should fail for invalid state', () => {
    const reqId = 'req_old_1';
    // req_old_1 is 'delivered'
    const initialStatus = 'delivered';

    appStore.processPayment(reqId);

    const req = appStore.getRequests('client', 'user_patient').find(r => r.id === reqId);
    assert.strictEqual(req?.status, initialStatus); // Status should NOT change to 'paid'
});
