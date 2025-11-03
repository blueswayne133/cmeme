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
        forceTLS: !isLocal, // 🔥 Disable TLS locally
        wsHost: isLocal ? window.location.hostname : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
        wsPort: isLocal ? 6001 : 443, // 🔥 If using Laravel WebSockets locally
        wssPort: 6001,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
        auth: {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        },
    });
};

export default getEchoInstance;
