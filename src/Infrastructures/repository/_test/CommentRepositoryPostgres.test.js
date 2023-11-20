const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'this is new comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      expect(addedComment.id).toEqual('comment-123');
      expect(addedComment.content).toEqual(newComment.content);
      expect(addedComment.owner).toEqual(newComment.owner);

      const foundComment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(foundComment.id).toEqual('comment-123');
      expect(foundComment.content).toEqual(newComment.content);
      expect(foundComment.owner).toEqual(newComment.owner);
      expect(foundComment.thread_id).toEqual(newComment.threadId);
      expect(foundComment.is_delete).toEqual(false);
      expect(foundComment.date).toBeDefined();
    });
  });

  describe('isCommentExist function', () => {
    it('should return true if comment exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const isCommentExist = await commentRepositoryPostgres.isCommentExist('comment-123');

      // Assert
      expect(isCommentExist).toEqual(true);
    });

    it('should return false if comment not exists', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const isCommentExist = await commentRepositoryPostgres.isCommentExist('comment-123');

      // Assert
      expect(isCommentExist).toEqual(false);
    });
  });

  describe('isCommentOwner function', () => {
    it('should return true if user is comment owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const isCommentOwner = await commentRepositoryPostgres.isCommentOwner('comment-123', 'user-123');

      // Assert
      expect(isCommentOwner).toEqual(true);
    });

    it('should return false if user is not comment owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const isCommentOwner = await commentRepositoryPostgres.isCommentOwner('comment-123', 'user-456');

      // Assert
      expect(isCommentOwner).toEqual(false);
    });
  });

  describe('deleteComment', () => {
    it('should update is_delete to true', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const foundComment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(foundComment.is_delete).toEqual(true);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return comments correctly', async () => {
      const wait = (ms) => new Promise((resolve) => {
        setTimeout(resolve, ms);
      });

      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });
      await wait(250);
      await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123' });
      await wait(250);
      await CommentsTableTestHelper.addComment({ id: 'comment-789', threadId: 'thread-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(3);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[1].id).toEqual('comment-456');
      expect(comments[2].id).toEqual('comment-789');
    });
  });
});
