import { Injectable } from '@nestjs/common';

import { initializeApp, cert, getApps } from 'firebase-admin/app';

import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService {
  constructor() {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,

          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,

          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async send(token: string, title: string, body: string) {
    try {
      const res = await getMessaging().send({
        token,
        notification: {
          title,
          body,
        },
      });

      console.log(res);

      return res;
    } catch (e) {
      console.error(e);

      throw e;
    }
  }
}
