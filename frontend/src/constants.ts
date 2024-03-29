export const HOSTNAME = window.location.hostname;
export const BACKEND_URL = `http://${HOSTNAME}:3000`;
export const FRONTEND_URL = `http://${HOSTNAME}:8080`;
export const API_URL = `${BACKEND_URL}/api`;
export const AVATARS_URL = `${BACKEND_URL}/avatars`;
export const CHAT_SOCKET_URL = `${BACKEND_URL}/chat`;
export const STATUS_SOCKET_URL = `${BACKEND_URL}/status`;
export const GAME_SOCKET_URL = `${BACKEND_URL}/game`;
export const GAME_CUSTOM_URL = `${FRONTEND_URL}/game/`;
export const UNAUTHENTICATED_ROUTES = ['/home', '/42/callback', '/2fa/verify'];
export const UNAUTHENTICATED_ROUTES_WITHOUT_HOME =
  UNAUTHENTICATED_ROUTES.filter((route) => route != '/home');
export const PAD_UP = -1;
export const PAD_DOWN = 1;
export const PAD_STOP = 0;
export const GAME_STATUS = Object.freeze({
  IN_CHOOSE_MODE: 'choose_mode',
  IN_MENU: 'menu',
  IN_QUEUE: 'queue',
  IN_GAME: 'game',
  IN_SCORE_SCREEN: 'score_screen'
});
export const USER_STATUS = Object.freeze({
  OFFLINE: 'offline',
  ONLINE: 'online',
  IN_GAME: 'in_game'
});
