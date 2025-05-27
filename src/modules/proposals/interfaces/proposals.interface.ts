import { IUser } from '@modules/users/interfaces/user.interface';

export interface IProposal {
  id?: string;
  price?: number;
  deliveryTime?: Date;
  message?: string;
  fileId?: string | null;
  status?: any;
  matchPercent?: number | null;
  tenderId?: string;
  userId?: string;
  tender?: IProposal | any;
  user?: IUser | any;
  isDeleted?: boolean;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  // User IDs
  deletedById?: string | null;
  createdById?: string | null;
  updatedById?: string | null;
}
