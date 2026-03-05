import test from 'node:test';
import assert from 'node:assert';
import { Store, appStore } from './store.ts';

test('Store.verifyDeliveryCode', async (t) => {
  await t.test('should return true when the delivery code matches (seeded data)', () => {
    // req_123 is seeded in Store constructor with deliveryCode '1234'
    const result = appStore.verifyDeliveryCode('req_123', '1234');
    assert.strictEqual(result, true);
  });

  await t.test('should return false when the delivery code does not match (seeded data)', () => {
    const result = appStore.verifyDeliveryCode('req_123', 'wrong-code');
    assert.strictEqual(result, false);
  });

  await t.test('should return false when the request id does not exist', () => {
    const result = appStore.verifyDeliveryCode('non-existent', '1234');
    assert.strictEqual(result, false);
  });

  await t.test('should work correctly with dynamically added requests', () => {
    const freshStore = new Store();
    const requestId = 'new_req_999';
    const deliveryCode = '5678';

    const newRequest = {
      id: requestId,
      deliveryCode: deliveryCode,
      patientId: 'user_patient',
      patientName: 'John Doe',
      symptoms: 'Test symptoms',
      timestamp: Date.now(),
      status: 'pending_triage',
      severity: 'Low',
      chatHistory: []
    };

    // Use any to bypass type checking for the test
    freshStore.addRequest(newRequest as any);

    assert.strictEqual(freshStore.verifyDeliveryCode(requestId, deliveryCode), true, 'Should match correct code');
    assert.strictEqual(freshStore.verifyDeliveryCode(requestId, 'wrong'), false, 'Should not match incorrect code');
  });
});
