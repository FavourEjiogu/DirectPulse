
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { appStore } from './store.ts';
import type { TriageRequest } from '../types';

describe('Store.getRequests (Client)', () => {
  test('should return requests for a specific valid userId', () => {
    const requests = appStore.getRequests('client', 'user_patient');
    assert.ok(requests.length > 0);
    requests.forEach(r => {
      assert.strictEqual(r.patientId, 'user_patient');
    });
  });

  test('should return empty array for a userId with no requests', () => {
    const requests = appStore.getRequests('client', 'non_existent_user');
    assert.strictEqual(requests.length, 0);
  });

  test('should return empty array when userId is undefined', () => {
    const requests = appStore.getRequests('client', undefined);
    assert.strictEqual(requests.length, 0);
  });

  test('should return empty array when userId is empty string', () => {
    const requests = appStore.getRequests('client', '');
    assert.strictEqual(requests.length, 0);
  });

  test('should not return requests of other users', () => {
    // Add a request for a different user
    const otherRequest: TriageRequest = {
      id: 'req_other',
      patientId: 'other_user',
      patientName: 'Other User',
      symptoms: 'Headache',
      timestamp: Date.now(),
      status: 'pending_triage',
      severity: 'Low',
      chatHistory: []
    };
    appStore.addRequest(otherRequest);

    const patientRequests = appStore.getRequests('client', 'user_patient');
    assert.ok(patientRequests.length > 0);
    patientRequests.forEach(r => {
      assert.notStrictEqual(r.patientId, 'other_user');
    });

    const otherRequests = appStore.getRequests('client', 'other_user');
    assert.strictEqual(otherRequests.length, 1);
    assert.strictEqual(otherRequests[0].id, 'req_other');
  });

  test('privacy-critical: should not return requests if patientId is missing in store and userId is missing in call', () => {
     // This is the edge case: what if a request exists with no patientId?
     // We use casting to bypass TypeScript for the test
     const leakyRequest = {
       id: 'req_leaky',
       patientId: undefined as any,
       patientName: 'Anonymous',
       symptoms: 'Unknown',
       timestamp: Date.now(),
       status: 'pending_triage',
       severity: 'Low',
       chatHistory: []
     } as TriageRequest;

     appStore.addRequest(leakyRequest);

     // Current implementation might return this if userId is undefined
     const requests = appStore.getRequests('client', undefined);

     // We want this to be 0 for security/privacy
     // If the test fails, it means we found the bug
     assert.strictEqual(requests.length, 0, 'Should not return requests with undefined patientId when userId is undefined');
  });
});

describe('Store.getPatientHistory', () => {
  test('should return history for valid patientId', () => {
    const history = appStore.getPatientHistory('user_patient');
    assert.ok(history.length > 0);
  });

  test('should return empty array for undefined patientId', () => {
    const history = appStore.getPatientHistory(undefined as any);
    assert.strictEqual(history.length, 0);
  });
});
