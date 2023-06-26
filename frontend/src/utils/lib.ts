import { useSessionStore } from '@/store/session';
import { useChatStore } from '@/store/chat';
import { useFriendStore } from '@/store/friend';
import { useConnectedUsersStore } from '@/store/connectedUsers';

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
    useConnectedUsersStore()
  ];

  for (const store of stores) {
    store.$reset;
  }
  useChatStore().poormansReset();
}
