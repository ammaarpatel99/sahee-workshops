import {Id} from '../../shared';

export interface WorkshopUserDoc {
  consentToEmails: boolean;
}

export type WorkshopUser = WorkshopUserDoc & Id;
