const AddedComment = require('../AddedComment');

describe('AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'abc',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddedComment(payload))
      .toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: true,
      content: 123,
      owner: {},
    };

    // Action and Assert
    expect(() => new AddedComment(payload))
      .toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'this is a content of comment',
      owner: 'user-123',
    };

    // Action
    const addedComment = new AddedComment(payload);

    // Assert
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
