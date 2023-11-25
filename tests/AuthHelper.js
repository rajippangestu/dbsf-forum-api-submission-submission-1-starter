const Jwt = require('@hapi/jwt');
const UsersTableTestHelper = require('./UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('./AuthenticationsTableTestHelper');

const ServerTestHelper = {
  async getAccessToken({
    id = 'user-123',
    username = 'dicoding',
    password = 'secret',
    fullname = 'Dicoding Indonesia',
  }) {
    const userPayload = {
      id, username, password, fullname,
    };
    await UsersTableTestHelper.addUser(userPayload);
    const accessToken = Jwt.token.generate(userPayload, process.env.ACCESS_TOKEN_KEY);
    const refreshToken = Jwt.token.generate(userPayload, process.env.REFRESH_TOKEN_KEY);
    await AuthenticationsTableTestHelper.addToken(refreshToken);

    return accessToken;
  },

  async cleanTable() {
    AuthenticationsTableTestHelper.cleanTable();
    UsersTableTestHelper.cleanTable();
  },
};

module.exports = ServerTestHelper;
