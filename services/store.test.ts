
import { test, describe } from "node:test";
import assert from "node:assert";
import { Store } from "./store.ts";

describe("Store - Toast System", () => {
  test("triggerToast should call the listener with the correct message", () => {
    const store = new Store();
    let receivedMessage = "";
    const listener = (msg: string) => {
      receivedMessage = msg;
    };

    store.setToastListener(listener);
    store.triggerToast("Hello Test");

    assert.strictEqual(receivedMessage, "Hello Test");
  });

  test("triggerToast should not throw when no listener is set", () => {
    const store = new Store();
    assert.doesNotThrow(() => {
      store.triggerToast("Should not crash");
    });
  });

  test("setToastListener should replace the previous listener", () => {
    const store = new Store();
    let count1 = 0;
    let count2 = 0;

    store.setToastListener(() => { count1++; });
    store.setToastListener(() => { count2++; });

    store.triggerToast("Test message");

    assert.strictEqual(count1, 0, "First listener should not be called");
    assert.strictEqual(count2, 1, "Second listener should be called once");
  });

  test("triggerToast should be able to be called multiple times", () => {
    const store = new Store();
    const messages: string[] = [];
    store.setToastListener((msg) => {
      messages.push(msg);
    });

    store.triggerToast("Message 1");
    store.triggerToast("Message 2");

    assert.deepStrictEqual(messages, ["Message 1", "Message 2"]);
  });
});
