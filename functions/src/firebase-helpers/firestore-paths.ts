const paths = {
  user: {
    col: 'users',
    doc: (userID: string) => `${paths.user.col}/${userID}`,
    workshop: {
      colName: 'user-workshops',
      col: (userID: string) => `${paths.user.doc(userID)}/${paths.user.workshop.colName}`,
      doc: ({userID, workshopID}: {userID: string; workshopID: string}) => `${paths.user.workshop.col(userID)}/${workshopID}`
    }
  },
  workshop: {
    col: 'workshops',
    doc: (workshopID: string) => `${paths.workshop.col}/${workshopID}`,
    user: {
      colName: 'workshop-users',
      col: (workshopID: string) => `${paths.workshop.doc(workshopID)}/${paths.workshop.user.colName}`,
      doc: ({userID, workshopID}: {userID: string; workshopID: string}) => `${paths.workshop.user.col(workshopID)}/${userID}`
    }
  },
  publicWorkshop: {
    col: 'public-workshops',
    doc: (workshopID: string) => `${paths.publicWorkshop.col}/${workshopID}`
  }
};

export const FIRESTORE_PATHS = paths;
