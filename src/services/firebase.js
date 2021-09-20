import {
  initializeApp,
} from 'firebase/app';

import Authentication from './authentication';
import Database from './database';
import DatabaseLogic from './database-logic';

const isDevelop = process.env.NODE_ENV === 'develop';

const config = {
  apiKey: process.env.REACT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.REACT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: isDevelop ? 'http://localhost:9000/?ns=jaysc-wwrando-tracker-default-rtdb' : `https://${process.env.REACT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  projectId: process.env.REACT_PUBLIC_FIREBASE_PROJECT_ID,
};

export default class Firebase {
  static async initialize(permaId, gameId) {
    initializeApp(config);

    const auth = Authentication.initialize(isDevelop);
    const database = Database.initialize(isDevelop, permaId, gameId);
    await Promise.all([auth, database]);

    DatabaseLogic.init();

    console.log(config.databaseURL);
  }
}
