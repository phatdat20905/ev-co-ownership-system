// src/providers/index.js
import emailProvider from './email/emailProvider.js';
import pushProvider from './push/pushProvider.js';
import smsProvider from './sms/smsProvider.js';
import inAppProvider from './inApp/inAppProvider.js';

export {
  emailProvider,
  pushProvider,
  smsProvider,
  inAppProvider,
};

export default {
  email: emailProvider,
  push: pushProvider,
  sms: smsProvider,
  in_app: inAppProvider,
};