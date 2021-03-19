/* eslint-disable max-len */
const jsonLayout = require('../index');

const eventGeneratorWithCategory = (categoryName, ...values) => ({
  startTime: 'startTime',
  level: {
    levelStr: 'mock',
  },
  categoryName,
  data: values,
  fileName: 'foo.js',
  lineNumber: '42',
});

const eventGenerator = (...values) => eventGeneratorWithCategory('default', ...values);

describe('log4json', () => {
  test('should return string', () => {
    const logger = jsonLayout();
    const result = logger(eventGenerator('test'));
    expect(typeof result).toBe('string');
  });
  test('should return default props if no args', () => {
    const logger = jsonLayout();
    const result = JSON.parse(logger(eventGenerator()));
    expect(result).not.toHaveProperty('msg');
    expect(result).not.toHaveProperty('category');
    expect(result).toHaveProperty('ts', 'startTime');
    expect(result).toHaveProperty('level', 'mock');
  });
  test('should have msg ts and level if no category', () => {
    const logger = jsonLayout();
    const result = JSON.parse(logger(eventGenerator('test')));
    expect(result).not.toHaveProperty('category');
  });
  test('should have category if is defined', () => {
    const logger = jsonLayout();
    const result = JSON.parse(logger(eventGeneratorWithCategory('test-category', 'test')));
    expect(result).toHaveProperty('category', 'test-category');
  });
  test('should concat all string messages', () => {
    const logger = jsonLayout();
    const result = JSON.parse(logger(eventGenerator('concat', 'this message', 'with this one')));
    expect(result).toHaveProperty('msg', 'concat this message with this one');
  });
  test('should assign all props in to output', () => {
    const logger = jsonLayout();
    const result = JSON.parse(logger(eventGenerator('extend', { a: 1 }, { b: 2 }, { c: 3 })));
    expect(result).toHaveProperty('a', 1);
    expect(result).toHaveProperty('b', 2);
    expect(result).toHaveProperty('c', 3);
  });
  test('should return the stack of error', () => {
    const logger = jsonLayout();
    const result = JSON.parse(logger(eventGenerator('error', new Error('test'))));
    expect(result).toHaveProperty('stack');
  });
  test('should concat the message with given separator', () => {
    const logger = jsonLayout({ separator: '.$.' });
    const result = JSON.parse(logger(eventGenerator('concat with', 'this message', 'with this one')));
    expect(result).toHaveProperty('msg', 'concat with.$.this message.$.with this one');
  });
  test('should format the message with given space', () => {
    [null, 1, 2, 3, 4]
      .forEach((space) => {
        const logger = jsonLayout({ space });
        const result = logger(eventGenerator('space'));
        expect(result).toBe(JSON.stringify(JSON.parse(result), null, space));
      });
  });
  test('should omit invalid data', () => {
    const logger = jsonLayout();
    const result = JSON.parse(logger(eventGenerator('valid', undefined, null)));
    expect(result).toHaveProperty('msg', 'valid');
  });

  test('should include fileNumber and lineNumber if config has them', () => {
    const logger = jsonLayout({
      props: {
        category: 'category',
        fileName: 'file',
        lineNumber: 'line',
        msg: 'message',
        level: 'level',
        ts: 'ts',
        stack: 'error',
      },
    });
    const result = JSON.parse(logger(eventGeneratorWithCategory('my-category', 'custom props', new Error('stack'))));

    expect(result).toHaveProperty('file', 'foo.js');
    expect(result).toHaveProperty('line', '42');
    expect(result).toHaveProperty('message', 'custom props');
  });

  test('should change the pre-reserved keys if the config has', () => {
    const logger = jsonLayout({
      props: {
        ts: '@timestamp',
        level: 'lvl',
        category: 'cat',
        stack: 'error',
        msg: 'message',
      },
    });
    const result = JSON.parse(logger(eventGeneratorWithCategory('my-category', 'custom props', new Error('stack'))));

    expect(result).not.toHaveProperty('ts');
    expect(result).toHaveProperty('@timestamp', 'startTime');

    expect(result).not.toHaveProperty('level');
    expect(result).toHaveProperty('lvl', 'mock');

    expect(result).not.toHaveProperty('category');
    expect(result).toHaveProperty('cat', 'my-category');

    expect(result).not.toHaveProperty('stack');
    expect(result).toHaveProperty('error');

    expect(result).not.toHaveProperty('msg');
    expect(result).toHaveProperty('message', 'custom props');
  });
});
