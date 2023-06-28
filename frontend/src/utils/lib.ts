import { useSessionStore } from '@/store/session';
import { useChatStore } from '@/store/chat';
import { useFriendStore } from '@/store/friend';
import { useConnectedUsersStore } from '@/store/connectedUsers';
import { useInGameUsersStore } from '@/store/inGameUsers';
import swal from 'sweetalert';

export function formatError(message) {
  return typeof message == 'string' ? message : message.join(',\n');
}

export function convertDate(dateToConvert) {
  const lastCoUTC = new Date(dateToConvert).getTime();
  return new Date(lastCoUTC).toLocaleString();
}

export function resetStores() {
  const stores = [
    useSessionStore(),
    useChatStore(),
    useFriendStore(),
    useConnectedUsersStore(),
    useInGameUsersStore()
  ];

  for (const store of stores) {
    store.$reset;
  }
  useChatStore().poormansReset();
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function displayError(payload) {
  swal({
    icon: 'error',
    text: formatError(payload.message)
  });
}
