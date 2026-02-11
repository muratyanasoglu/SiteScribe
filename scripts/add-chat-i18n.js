const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'messages');

const chatTr = {
  title: 'Sohbet',
  conversations: 'Sohbetler',
  noConversations: 'Henüz sohbet yok. Mesajlaşmak için arkadaş ekleyin.',
  selectConversation: 'Bir sohbet seçin veya arkadaşınızla yeni bir sohbet başlatın.',
  typeMessage: 'Mesaj yazın...',
  send: 'Gönder',
  errorSend: 'Mesaj gönderilemedi. Tekrar deneyin.',
  errorNotFriends: 'Yalnızca arkadaşlarınıza mesaj atabilirsiniz.',
  errorInvalidUser: 'Geçersiz kullanıcı.',
};
const chatEs = {
  title: 'Chat',
  conversations: 'Conversaciones',
  noConversations: 'Aún no hay conversaciones. Añade amigos para chatear.',
  selectConversation: 'Selecciona una conversación o inicia un chat con un amigo.',
  typeMessage: 'Escribe un mensaje...',
  send: 'Enviar',
  errorSend: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
  errorNotFriends: 'Solo puedes enviar mensajes a amigos.',
  errorInvalidUser: 'Usuario no válido.',
};
const chatFr = {
  title: 'Chat',
  conversations: 'Conversations',
  noConversations: 'Pas encore de conversations. Ajoutez des amis pour discuter.',
  selectConversation: 'Sélectionnez une conversation ou démarrez un chat avec un ami.',
  typeMessage: 'Écrivez un message...',
  send: 'Envoyer',
  errorSend: 'Impossible d\'envoyer le message. Réessayez.',
  errorNotFriends: 'Vous ne pouvez envoyer des messages qu\'à vos amis.',
  errorInvalidUser: 'Utilisateur invalide.',
};
const navChat = { tr: 'Sohbet', es: 'Chat', fr: 'Chat' };

['tr', 'es', 'fr'].forEach((locale) => {
  const file = path.join(dir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data.nav) data.nav = {};
  data.nav.chat = navChat[locale];
  data.chat = locale === 'tr' ? chatTr : locale === 'es' ? chatEs : chatFr;
  fs.writeFileSync(file, JSON.stringify(data), 'utf8');
  console.log('Updated', locale + '.json (chat + nav.chat)');
});
