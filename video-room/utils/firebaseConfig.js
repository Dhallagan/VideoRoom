import firebase from 'firebase';

const config = {

};

if (firebase.apps.length === 0) {
  firebase.initializeApp(config);
}

export default firebase;