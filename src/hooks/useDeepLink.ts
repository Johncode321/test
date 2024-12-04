// src/hooks/useDeepLink.ts

const createDeepLink = (type: 'phantom' | 'solflare', message: string) => {
  const baseUrl = window.location.href;
  const encodedMessage = encodeURIComponent(message);
  const encodedUrl = encodeURIComponent(baseUrl);

  // Créer un objet avec les paramètres de la transaction
  const params = {
    message: encodedMessage,
    redirect: encodedUrl
  };

  // Construire l'URL de deep link
  const deepLink = type === 'phantom'
    ? `https://phantom.app/ul/v1/signMessage?${new URLSearchParams(params)}`
    : `https://solflare.com/ul/v1/signMessage?${new URLSearchParams(params)}`;

  return deepLink;
};

export const useDeepLink = () => {
  const openDeepLink = (type: 'phantom' | 'solflare', message: string) => {
    const deepLink = createDeepLink(type, message);
    window.location.href = deepLink;
  };

  return { openDeepLink };
};
