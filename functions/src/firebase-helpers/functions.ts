export const functions = {
  admin: {
    make: 'admin-make',
    remove: 'admin-remove',
    restore: 'admin-restore'
  },
  email: {
    promote: 'email-promote',
    send: 'email-send'
  },
  register: 'user-workshop-register',
  feedback: 'feedback'
};


export interface MakeAdminParam {
  emailAddress: string;
}
export type MakeAdminRes = void;


export type RemoveAdminParam = MakeAdminParam;
export type RemoveAdminRes = MakeAdminRes;


export type RestoreAdminsParam = void;
export type RestoreAdminsRes = string[];


export interface PromotionalEmailParam {
  workshopID: string;
  message: string;
}
export type PromotionalEmailRes = string[];


export type SendEmailParam = PromotionalEmailParam;
export type SendEmailRes = PromotionalEmailRes;


export interface RegisterParam {
  workshopID: string;
  consentToEmails: boolean;
}
export type RegisterRes = void;


export interface FeedbackParam {
  message: string;
  email?: string;
}
export type FeedbackRes = void;
