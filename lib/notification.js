export const sendPushNotification = async (fcmToken, title, body) => {
  if (!fcmToken) return;
  try {
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=BMPd5AdlH0nMWs5ud8OjuA0YAuspnGkgOciggnp6S55mvCBlaavRgMz8RpHVVcPaX_i7KJeKchSb_zaZ91H-kes',
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: { title, body, icon: '/icon-192.png' },
      }),
    });
  } catch (error) { console.error(error); }
};
