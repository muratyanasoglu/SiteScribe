const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'messages');

const friendsTr = {
  title: 'Arkadaşlar',
  addFriend: 'Arkadaş ekle',
  searchByUsername: 'Kullanıcı adıyla ara',
  username: 'Kullanıcı adı',
  usernameHint: 'Harfler, rakamlar, alt çizgi. Başkaları sizi bulabilsin diye.',
  sendRequest: 'Arkadaşlık isteği gönder',
  requestSent: 'İstek gönderildi',
  alreadyFriends: 'Zaten arkadaşsınız',
  pendingSent: 'İstek gönderildi',
  pendingReceived: 'Size istek göndermiş',
  accept: 'Kabul et',
  decline: 'Reddet',
  incomingRequests: 'Gelen istekler',
  outgoingRequests: 'Gönderilen istekler',
  myFriends: 'Arkadaşlarım',
  noIncoming: 'Gelen istek yok',
  noOutgoing: 'Gönderilen istek yok',
  noFriends: 'Henüz arkadaş yok. Kullanıcı adıyla arayıp ekleyin.',
  noResults: 'Bu kullanıcı adıyla kimse bulunamadı.',
  searchMinChars: 'En az 2 karakter girin.',
  profile: 'Profil',
  inviteToOrg: 'Organizasyona davet et',
  inviteFromFriends: 'Veya arkadaşlarınızdan davet edin',
  setUsername: 'Kullanıcı adı belirle',
  setUsernameTitle: 'Başkalarının sizi bulabilmesi için kullanıcı adınızı belirleyin',
  usernameUpdated: 'Kullanıcı adı kaydedildi.',
};
const friendsEs = {
  title: 'Amigos',
  addFriend: 'Añadir amigo',
  searchByUsername: 'Buscar por nombre de usuario',
  username: 'Nombre de usuario',
  usernameHint: 'Letras, números, guión bajo. Para que otros te encuentren.',
  sendRequest: 'Enviar solicitud de amistad',
  requestSent: 'Solicitud enviada',
  alreadyFriends: 'Ya sois amigos',
  pendingSent: 'Solicitud enviada',
  pendingReceived: 'Te enviaron una solicitud',
  accept: 'Aceptar',
  decline: 'Rechazar',
  incomingRequests: 'Solicitudes recibidas',
  outgoingRequests: 'Solicitudes enviadas',
  myFriends: 'Mis amigos',
  noIncoming: 'No hay solicitudes recibidas',
  noOutgoing: 'No hay solicitudes enviadas',
  noFriends: 'Aún no tienes amigos. Busca por nombre de usuario para añadir.',
  noResults: 'No se encontró ningún usuario con este nombre.',
  searchMinChars: 'Introduce al menos 2 caracteres.',
  profile: 'Perfil',
  inviteToOrg: 'Invitar a la organización',
  inviteFromFriends: 'O invitar desde amigos',
  setUsername: 'Establecer nombre de usuario',
  setUsernameTitle: 'Establece tu nombre de usuario para que otros te encuentren',
  usernameUpdated: 'Nombre de usuario guardado.',
};
const friendsFr = {
  title: 'Amis',
  addFriend: 'Ajouter un ami',
  searchByUsername: 'Rechercher par nom d\'utilisateur',
  username: 'Nom d\'utilisateur',
  usernameHint: 'Lettres, chiffres, tiret bas. Pour que d\'autres vous trouvent.',
  sendRequest: 'Envoyer une demande d\'ami',
  requestSent: 'Demande envoyée',
  alreadyFriends: 'Déjà amis',
  pendingSent: 'Demande envoyée',
  pendingReceived: 'Ils vous ont envoyé une demande',
  accept: 'Accepter',
  decline: 'Refuser',
  incomingRequests: 'Demandes reçues',
  outgoingRequests: 'Demandes envoyées',
  myFriends: 'Mes amis',
  noIncoming: 'Aucune demande reçue',
  noOutgoing: 'Aucune demande envoyée',
  noFriends: 'Pas encore d\'amis. Recherchez par nom d\'utilisateur pour ajouter.',
  noResults: 'Aucun utilisateur trouvé avec ce nom.',
  searchMinChars: 'Entrez au moins 2 caractères.',
  profile: 'Profil',
  inviteToOrg: 'Inviter à l\'organisation',
  inviteFromFriends: 'Ou inviter parmi vos amis',
  setUsername: 'Définir le nom d\'utilisateur',
  setUsernameTitle: 'Définissez votre nom d\'utilisateur pour que d\'autres vous trouvent',
  usernameUpdated: 'Nom d\'utilisateur enregistré.',
};

const navFriends = { tr: 'Arkadaşlar', es: 'Amigos', fr: 'Amis' };

['tr', 'es', 'fr'].forEach((locale) => {
  const file = path.join(dir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data.nav) data.nav = {};
  data.nav.friends = navFriends[locale];
  data.friends = locale === 'tr' ? friendsTr : locale === 'es' ? friendsEs : friendsFr;
  fs.writeFileSync(file, JSON.stringify(data), 'utf8');
  console.log('Updated', locale + '.json (friends + nav.friends)');
});
