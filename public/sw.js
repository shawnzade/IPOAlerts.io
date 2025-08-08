self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'IPO Alert';
  const body = data.body || 'A company you follow may have filed for an IPO.';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/icon.png'
    })
  );
});
