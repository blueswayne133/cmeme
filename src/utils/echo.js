// src/lib/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const getEchoInstance = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true, // Always use TLS for Pusher Cloud
    enabledTransports: ['ws', 'wss'],

    // 👇 Only needed if using private/presence channels
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });
};

export default getEchoInstance;
