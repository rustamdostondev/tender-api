import { Proposals, Users } from '@prisma/client';

export interface ITender {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  budget?: number;
  deadline?: Date;
  fileId?: string | null;
  status?: any;

  userId?: string;
  user?: Users | any;

  proposals?: Proposals[] | any;

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
