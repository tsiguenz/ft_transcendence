export const HOSTNAME = window.location.hostname;
export const BACKEND_URL = `http://${HOSTNAME}:3000`;
export const FRONTEND_URL = `http://${HOSTNAME}:8080`;
export const API_URL = `${BACKEND_URL}/api`;
export const AVATARS_URL = `${BACKEND_URL}/avatars`;
export const CHAT_SOCKET_URL = `${BACKEND_URL}/chat`;
export const STATUS_SOCKET_URL = `${BACKEND_URL}/status`;
export const GAME_SOCKET_URL = `${BACKEND_URL}/game`;
export const FRONTEND_GAME_URL = `${FRONTEND_URL}/game`;
export const UNAUTHENTICATED_ROUTES = [
  '/signin',
  '/signup',
  '/home',
  '/42/callback',
  '/2fa/verify'
];
export const UNAUTHENTICATED_ROUTES_WITHOUT_HOME =
  UNAUTHENTICATED_ROUTES.filter((route) => route != '/home');
export const PAD_UP = -1;
export const PAD_DOWN = 1;
export const PAD_STOP = 0;
export const GAME_STATUS = Object.freeze({
  IN_CHOOSE_MODE: 0,
  IN_MENU: 1,
  IN_QUEUE: 2,
  IN_GAME: 3,
  IN_SCORE_SCREEN: 4
});
