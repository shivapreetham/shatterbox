import { AnonymousMessage } from '@prisma/client';

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingAnonymousMessages?: boolean;
  anonymousMessages?: Array<AnonymousMessage>
};