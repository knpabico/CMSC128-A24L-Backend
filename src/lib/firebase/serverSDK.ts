// this server side of firebase is for interacting with firestore database
 // from the server side
 
 
 import { Firestore, getFirestore } from 'firebase-admin/firestore';
 import { getApps, ServiceAccount } from 'firebase-admin/app';
 import admin from 'firebase-admin';
 import { Auth, getAuth } from 'firebase-admin/auth';
 
 const serviceAccount = {
   "type": "service_account",
   "project_id": "cmsc-128-a24l",
   "private_key_id": "f720e4710027e4698ce2511e5623846f27a66ab9",
   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDARE2ed5iK+DvZ\nUDw8rtqoRQs7OTk6xccUyiqK0ENrOJjPx3Estd5KHWcMxy2QmAtBBv105DteO7n5\nVpHswVl/YfaRn0nrePjzgwR/Qo9w5HaB3Al8RmH4g3+durZjjvONg1lNUXzmK6Oq\nXhcrz2vozUbuyhaVwNMwG6G9uKfl+m6Svn5mMTAPei+6A7h7tWTxP9eFo0O5H/6b\nZ4iBa2bTnSFoy3GZgV3uTxFnGWGyYTPfUpPER1Z5Alvx5lfGthbWoFlZMMTpAK2s\n1qSf7afgCYDNpUzMtu7ONcjTo5QIkIf5ZOiJYSi8XW1m0PXmnMGNpmW2Rbtb0DUl\nODzUstPXAgMBAAECgf81yNcSXIb7mw8UWOxGZUSShMyjLqukPf/rvqI98PYPwwOO\nxJ7gpNsngXE4zcEDn7DIFguWjepW1NrHe1aRem8sIPXyfYqS6pE9ja6pZ1Cxy1Sr\n8H8dMnXz0QE9j84ss9uhM2oNX0WjkuIU/YZgmiW97znO+VMHoBGf45dJGLpUOCu/\nb+SK8w5fAmPNCbDb1ABxAEsZZ8bIvi3ZqVJOFErVlN8RgUehAzYspidzv2bgqq/c\niWgEw21BlyubOxvw9kHI+PMBVh/AI7ChTjoUkeUoPIuOqhW3U/z496z+UJkuSPS9\nRJ2IKi4wkS/WCOW5uaPRcFZTCi7uKO1rah2Ebr0CgYEA6Ait0oKx2GQvbekrySFM\n8rThQKQC5G84UEQT0ejT1348TyPJoaXFaONxED26ML3aK+toZjFfgoB6Ncu2Ul3k\nol+yI8xkK41NM5u/uKuO66hpCdsQijyO4jSrF3o5CdFaeTQcr1zAJvveUfYyq2ob\nHssw6isptUuVUk58IenbLXUCgYEA1CAfik6woFC4VWoZbrokabbel7+EoJcMocCI\nqzncDPYhEbiN+Qq95+nqkTfRSWCLcogG8R3dmwMKetRsr0Gmnak6iMRpX36byj/H\n69oH6AnO+oTaxp2xtgnlHQlgWxihXx1WlP5UuCxvkHl6Un4pg+nbUS/iMCXHeNh5\ncJi1VpsCgYEA3lCyeqfOTk5vQxfNZAAMAd9cktqSCtylUAJqGwzBLA8/KXRYlBCI\nfF6uzajW5CyDBOGgPYnAwQDoFvL/1RsxHIIj5DjJIRFZjsEDiKSXYyMQwOiriEdN\nf16HLw9j5ww3azmK4lozoSZhdJY3JhWbtn1oeHSymYm5oAqi1LuDzKECgYEAhoS4\ne6TbLU8DFmdqKWWxobhuAB1bpdskD49hG/RdL3sGDY7TuZKuS1tzfRPAjJ/EzqSk\nglNGLP8Irkv3gExJtMGUdRbZG83WTbOUvGRPjz5pG0UU18842w/7UyaXDC3aZ87b\nETEX2JOVTDE8+QM4oIa0pg+PiKjsjh35JQYyOPECgYB1Ut9Pw6i0vcGsZenFsYIT\ns/tk+B/qXqBcxf9apzYmnL8BXpF4rD42FlWs9G3Sj6nAAv7t3SmmVFqQvdY3Co4z\nu0xD8ipnEN+0FPQij5iRr7sP7O+zDeIqgQvyLjalMvJOjMaaHylhA6pHxw13b/3l\nJkH9wi6CF7TbnSpf+BNkrQ==\n-----END PRIVATE KEY-----\n",
   "client_email": "firebase-adminsdk-fbsvc@cmsc-128-a24l.iam.gserviceaccount.com",
   "client_id": "106466980245832787139",
   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
   "token_uri": "https://oauth2.googleapis.com/token",
   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40cmsc-128-a24l.iam.gserviceaccount.com",
   "universe_domain": "googleapis.com"
 };
 
 let firestore: Firestore;
 let auth: Auth;
 
 const currentApps = getApps();
 
 // if there is no initialized app, then
 // create the app
 if (!currentApps.length) {
   // Initialize app
   const app = admin.initializeApp({
     credential: admin.credential.cert(serviceAccount as ServiceAccount)
   });
   // initialize firestore
   firestore = getFirestore(app);
   // initialize firebase auth
   auth = getAuth(app);
 } else {
   // else, get the app from the already
   // initialized apps
   const app = currentApps[0];
   // initialize firestore
   firestore = getFirestore(app);
   // initialize firebase auth
   auth = getAuth(app);
 }
 
 export { firestore, auth };