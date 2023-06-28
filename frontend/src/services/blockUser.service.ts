import axios from 'axios';
import * as constants from '@/constants';
import { useChatStore } from '@/store/chat';

class BlockUserService {
  constructor(private chatStore: useChatStore = useChatStore()) {}

  async getBlockedUsers(username) {
    try {
      const response = await axios.get(
        constants.API_URL + '/users/' + username + '/blocked',
        {}
      );
      this.chatStore.addBlockedUser(...response.data.blockedUsers);
    } catch (error) {
      window.location.href = '/logout';
    }
  }

  async blockUser(username) {
    const response = await axios.post(
      constants.API_URL + '/users/' + username + '/block',
      {}
    );
    this.chatStore.addBlockedUser(response.data.blockedId);
  }

  async unblockUser(username) {
    const response = await axios.post(
      constants.API_URL + '/users/' + username + '/unblock',
      {}
    );
    this.chatStore.removeBlockedUser(response.data.blockedId);
  }

  isUserBlocked(userId) {
    return this.chatStore.isUserBlocked(userId);
  }
}

export default new BlockUserService();
