const NewThread = require('../NewThread');

describe('NewThread entities', () => {
  it('should throw error when payload is not contain needed property', () => {
    const payload = {};

    expect(() => new NewThread(payload))
      .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload is not meet data type specification', () => {
    const payload = {
      title: 123,
      body: 123,
      owner: 123,
    };

    expect(() => new NewThread(payload))
      .toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThread object correctly', () => {
    const payload = {
      title: 'this is title',
      body: 'this is body',
      owner: 'user-123',
    };

    const { title, body, owner } = new NewThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
