# Sahee Workshops

This project was generated with Angular CLI.

##Setup

First there are some files missing.

- In `projects/public/src/environments` create a file called `firebase-config.ts`
  which exports `firebaseConfig` which should be an object containing firebase configuration details.
  The format should be the same as `projects/public/src/environments/environments.ts#environment.firebase`.
  
- In `functions/src/email` create a file called `transporter.ts` which exports `transporter` which is a valid `node-mailer` transporter.

- In `functions/src/email` create a file called `send-email.ts` which exports `SUPPORT_EMAIL`, `CONTACT_EMAIL` and `NO_REPLY_EMAIL`.
  All three of these should be emails either expressed as strings or `node-mailer` Addresses.

Finally run `npm install` in the root folder of the project, as well as in the functions' subdirectory.

## Development server

First run `npm build` in the functions' folder.

Run `firebase emulators:start` and `ng serve`. The site will be available at `http://localhost:4200` and the firebase emulators console will be at `http://localhost:5000`.

## Build

Run `ng build --prod` in the root directory and `npm build` in the functions' subdirectory.
To deploy then run `firebase deploy`.
