export async function withNotificationTimeout<T>(
  operation: Promise<T>,
  message: string,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), 15000);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

export async function getNotificationWorker(): Promise<ServiceWorkerRegistration> {
  const registration = await withNotificationTimeout(
    navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    }),
    "The notification service could not start. Check your connection and try again.",
  );
  if (registration.active) return registration;
  // Wait for this registration instead of an unrelated controlling worker.
  let cleanup = () => {};
  try {
    await withNotificationTimeout(
      new Promise<void>((resolve, reject) => {
        const workers = new Set<ServiceWorker>();
        const check = () => {
          if (registration.active) {
            resolve();
            return;
          }
          const worker = registration.installing ?? registration.waiting;
          if (!worker || worker.state === "redundant") {
            reject(
              new Error(
                "The notification service failed to install. Please try again.",
              ),
            );
            return;
          }
          if (!workers.has(worker)) {
            workers.add(worker);
            worker.addEventListener("statechange", check);
          }
        };
        registration.addEventListener("updatefound", check);
        cleanup = () => {
          registration.removeEventListener("updatefound", check);
          workers.forEach((worker) =>
            worker.removeEventListener("statechange", check),
          );
        };
        check();
      }),
      "The notification service did not become ready. Please try again.",
    );
  } finally {
    cleanup();
  }
  return registration;
}
