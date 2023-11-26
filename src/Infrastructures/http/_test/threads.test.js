const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthHelper = require('../../../../tests/AuthHelper');
const container = require('../../container');
const createServer = require('../createServer');
const threads = require('../../../Interfaces/http/api/threads');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthHelper.cleanTable();
  });

  /*
  POST
  threads
  */
  describe('when POST /threads', () => {
    it('should response 401 when request payload did not contain auth', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread title',
        body: 'thread body',
        owner: 'user-123',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread title',
        body: 'thread body',
        owner: 'user-123',
      };

      const accessToken = await AuthHelper.getAccessToken({});
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread title',
        owner: 'user-123',
      };
      const accessToken = await AuthHelper.getAccessToken({});
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specifications', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread title',
        body: true,
        owner: 'user-123',
      };
      const accessToken = await AuthHelper.getAccessToken({});
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  /*
  GET
  threads/{id}
  */
  describe('when GET /threads/{id}', () => {
    it('should response 404 when request payload not found', async () => {
      // Arrange
      const server = await createServer(container);
      const threadId = 'xxx';

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      expect(response.statusCode).toEqual(404);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 200 when OK', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread title',
        body: 'thread body',
        owner: 'user-123',
      };

      const accessToken = await AuthHelper.getAccessToken({});
      const server = await createServer(container);

      // Add a new thread
      const addedThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const { data: { addedThread: { id: threadId } } } = JSON.parse(addedThreadResponse.payload);
      console.log('addedThreadResponse.payload:', addedThreadResponse.payload);
      console.log('Thread ID:', threadId);

      const getThreadResponse = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      console.log('getThreadResponse.payload:', getThreadResponse.payload);

      console.log('thread.payload:', getThreadResponse.payload);

      // Assert
      const responseJson = JSON.parse(getThreadResponse.payload);
      expect(getThreadResponse.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual(threadId);
    });
  });
});
