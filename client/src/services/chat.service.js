import api from './api';

export const chatService = {
  sendMessage: (message, conversationHistory = []) =>
    api.post('/chat', { message, conversationHistory }),
};

export default chatService;
