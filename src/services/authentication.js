import {
  getAuth, signInAnonymously, connectAuthEmulator,
} from 'firebase/auth';

export default class Authentication {
  constructor() {
    this.userId = null;
  }

  static async initialize(isLocal) {
    const auth = getAuth();

    if (isLocal) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }

    await signInAnonymously(auth)
      .then((cred) => {
        this.userId = cred.user.uid;
        console.log(`signedIn with userId: ${this.userId}`);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
