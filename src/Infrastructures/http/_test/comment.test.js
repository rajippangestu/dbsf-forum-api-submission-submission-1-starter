const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthHelper = require('../../../../tests/AuthHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint/{threadId}/comments', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 when request payload did not contain auth', async () => {
      // Arrange
      const requestPayload = {
        content: 'thread comment',
        owner: 'user-123',
        threadId: 'thread-123',
      };

      // eslint-disable-next-lint no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
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
        content: 'thread comment',
        owner: 'user-123',
        threadId: 'thread-123',
      };

      const accessToken = await AuthHelper.getAccessToken({});
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        owner: 'user-123',
        threadId: 'thread-123',
      };

      const accessToken = await AuthHelper.getAccessToken({});
      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({});

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specifications', async () => {
      // Arrange
      const requestPayload = {
        content: true,
        owner: 123,
        threadId: 'thread-123',
      };
      const accessToken = await AuthHelper.getAccessToken({});

      const server = await createServer(container);

      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 if commentId valid', async () => {
      // Arrange
      const server = await createServer(container);
      const accessToken = await AuthHelper.getAccessToken({});
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
