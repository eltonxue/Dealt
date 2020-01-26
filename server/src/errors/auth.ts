export const INVALID_LOGIN_ERROR = {
  errors: [
    {
      path: "email",
      message: "incorrect email or password"
    }
  ]
};

export const USERNAME_EXISTS_ERROR = {
  errors: [
    {
      path: "username",
      message: "username already exists"
    }
  ]
};

export const EMAIL_EXISTS_ERROR = {
  errors: [
    {
      path: "email",
      message: "email already exists"
    }
  ]
};

export const EMAIL_DOES_NOT_EXIST_ERROR = {
  errors: [
    {
      path: "email",
      message: "email does not exist"
    }
  ]
};

export const INVALID_CODE_ERROR = {
  errors: [
    {
      path: "code",
      message: "invalid code"
    }
  ]
};

export const INVALID_RESET_TOKEN_ERROR = {
  errors: [
    {
      path: "resetToken",
      message: "invalid reset token"
    }
  ]
};
