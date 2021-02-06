# Sahee Workshops

The purpose of this project is to provide a website for managing workshops done by Sahee Counseling.
The main branch is the code that is deployed, and is live at `https://workshops.sahee.co.uk`.

The system allows admins to create and edit workshops displayed on the site.
Other users can register (and unregister) for workshops as well as setting and changing their consent
for general emails regarding workshops they aren't registered for, as well as emails for each individual
workshop they are registered for. The admins are able to send emails of both sorts, as well as view the number
of people that are signed up for workshops, the total number of people, and the number that have consented
from those that have signed up.

The project was built with angular and angular/fire, and is deployed using firebase.

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
