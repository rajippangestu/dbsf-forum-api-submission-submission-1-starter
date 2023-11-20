const DeleteComment = require('../DeleteComment');

describe('DeleteComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
    };

    // Action and Assert
    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      owner: true,
      threadId: {},
    };

    // Action and Assert
    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create deleteComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    // Action
    const deleteComment = new DeleteComment(payload);

    // Assert
    expect(deleteComment.id).toEqual(payload.id);
    expect(deleteComment.owner).toEqual(payload.owner);
    expect(deleteComment.threadId).toEqual(payload.threadId);
  });
});
