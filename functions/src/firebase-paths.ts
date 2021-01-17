const workshopsCol = 'workshops';
const workshopDoc = (workshopID: string) => `${workshopsCol}/${workshopID}`;
const workshopUsersColName = 'workshop-users';
const workshopUsersCol = (workshopID: string) => `${workshopDoc(workshopID)}/${workshopUsersColName}`;
const workshopUserDoc = (workshopID: string, userID: string) => `${workshopUsersCol(workshopID)}/${userID}`;

const usersCol = 'users';
const userDoc = (userID: string) => `${usersCol}/${userID}`;
const userWorkshopsColName = `user-workshops`;
const userWorkshopsCol = (userID: string) => `${userDoc(userID)}/${userWorkshopsColName}`;
const userWorkshopDoc = (userID: string, workshopID: string) => `${userWorkshopsCol(userID)}/${workshopID}`;

const publicWorkshopsCol = 'public-workshops';
const publicWorkshopDoc = (workshopID: string) => `${publicWorkshopsCol}/${workshopID}`;

export const PATHS = {
  workshopsCol,
  workshopDoc,
  workshopUsersColName,
  workshopUsersCol,
  workshopUserDoc,
  usersCol,
  userDoc,
  userWorkshopsColName,
  userWorkshopsCol,
  userWorkshopDoc,
  publicWorkshopsCol,
  publicWorkshopDoc,
};
