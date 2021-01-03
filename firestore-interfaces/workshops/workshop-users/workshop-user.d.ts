import {Id} from '../../_shared';

export interface WorkshopUserDoc {
  consentToEmails: boolean;
}

export type WorkshopUser = WorkshopUserDoc & Id;
