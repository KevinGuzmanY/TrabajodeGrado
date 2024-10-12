export interface SignInResponsePayload{
  message: string;
  user: {
    email?: string;
    username?: string;
    user_id?: string;
  };
}
