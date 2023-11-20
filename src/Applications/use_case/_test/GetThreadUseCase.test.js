const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const Thread = require('../../../Domains/threads/entities/Thread');
const Comment = require('../../../Domains/comments/entities/Comment');

describe('GetThreadUseCase', () => {
  it('should throw error when thread is not found', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(null));
    const mockCommentRepository = new CommentRepository();
    const useCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    const expectedError = new Error('GET_THREAD_USE_CASE.THREAD_NOT_FOUND');

    // Action & Assert
    await expect(useCase.execute('thread-123')).rejects.toThrowError(expectedError);
  });

  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThread = new Thread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date().toISOString(),
      username: 'dicoding',
    });
    const mockComments = [
      new Comment({
        id: 'comment-123',
        username: 'dicoding',
        date: new Date().toISOString(),
        content: 'sebuah comment',
        isDelete: false,
      }),
    ];

    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute('thread-123');

    // Assert
    expect(thread.id).toEqual('thread-123');
    expect(thread.title).toEqual('sebuah thread');
    expect(thread.body).toEqual('sebuah body thread');
    expect(thread.date).toBeDefined();
    expect(thread.username).toEqual('dicoding');
    expect(thread.comments).toHaveLength(1);
    expect(thread.comments[0].id).toEqual('comment-123');
    expect(thread.comments[0].username).toEqual('dicoding');
    expect(thread.comments[0].content).toEqual('sebuah comment');

    // validate mock function call
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
  });
});
