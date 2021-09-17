import {
  getAuth, signInAnonymously, connectAuthEmulator,
} from 'firebase/auth';

export default class Authentication {
  constructor() {
    this.userId = null;
  }

  static async initialize(isLocal) {
    return new Promise((resolve, reject) => {
      const auth = getAuth();
      if (isLocal) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }

      signInAnonymously(auth)
        .then((cred) => {
          this.userId = cred.user.uid;
          console.log(`signedIn with userId: ${this.userId}`);
          resolve();
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }
}
