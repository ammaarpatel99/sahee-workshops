const workshopsCol = 'workshops';
const workshopDoc = (workshopID: string) => `${workshopsCol}/${workshopID}`;
const workshopUsersCol = (workshopID: string) => `${workshopDoc(workshopID)}/workshop-users`;
const workshopUserDoc = (workshopID: string, userID: string) => `${workshopUsersCol(workshopID)}/${userID}`;

const usersCol = 'users';
const userDoc = (userID: string) => `${usersCol}/${userID}`;
const userWorkshopsCol = (userID: string) => `${userDoc(userID)}/user-workshops`;
const userWorkshopDoc = (userID: string, workshopID: string) => `${userWorkshopsCol(userID)}/${workshopID}`;

const publicWorkshopsCol = 'public-workshops';
const publicWorkshopDoc = (workshopID: string) => `${publicWorkshopsCol}/${workshopID}`;

export const PATHS = {
  workshopsCol,
  workshopDoc,
  workshopUsersCol,
  workshopUserDoc,
  usersCol,
  userDoc,
  userWorkshopsCol,
  userWorkshopDoc,
  publicWorkshopsCol,
  publicWorkshopDoc,
};
