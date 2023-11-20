const Thread = require('../Thread');
const Comment = require('../../../comments/entities/Comment');

describe('Thread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'dummy title',
      body: 'dummy body',
    };

    // Action and Assert
    expect(() => new Thread(payload))
      .toThrowError('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 123,
      body: {},
      date: 123,
      username: 123,
    };

    // Action and Assert
    expect(() => new Thread(payload))
      .toThrowError('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create thread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'dummy title',
      body: 'dummy body',
      date: '2021-08-08T07:59:18.807Z',
      username: 'dicoding',
    };

    // Action
    const thread = new Thread(payload);

    // Assert
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.date);
    expect(thread.username).toEqual(payload.username);
    expect(thread.comments).toEqual([]);
  });

  it('should throw error when comments not contain array', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'dummy title',
      body: 'dummy body',
      date: '2021-08-08T07:59:18.807Z',
      username: 'dicoding',
    };

    const thread = new Thread(payload);

    // Action and Assert
    expect(() => thread.setComments({})).toThrowError('THREAD.COMMENTS_NOT_ARRAY');
  });

  it('should throw error when comments not contain Comment object', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'dummy title',
      body: 'dummy body',
      date: '2021-08-08T07:59:18.807Z',
      username: 'dicoding',
    };

    const thread = new Thread(payload);

    // Action and Assert
    expect(() => thread.setComments([
      {},
    ])).toThrowError('THREAD.COMMENTS_CONTAINS_INVALID_MEMBER');
  });

  it('should set comments correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'dummy title',
      body: 'dummy body',
      date: '2021-08-08T07:59:18.807Z',
      username: 'dicoding',
    };

    const thread = new Thread(payload);
    const comments = [
      new Comment({
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:59:18.807Z',
        content: 'sebuah comment',
        isDelete: false,
      }),
    ];

    // Action
    thread.setComments(comments);

    // Assert
    expect(thread.comments).toEqual(comments);
  });
});
