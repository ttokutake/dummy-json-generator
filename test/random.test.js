const {
  randomInt,
} = require('../lib/random');

const is  = require('is_js');
const jsc = require('jsverify');

test('randomInt() should return integer between range of min and max', () => {
  jsc.assertForall(jsc.integer(), jsc.integer(), (x, y) => {
    const [min, max] = x < y ? [x, y] : [y, x];
    const result     = randomInt(min, max);
    return min <= result && result <= max;
  });
});

test('randomInt() should return null', () => {
  jsc.assertForall(jsc.integer(), jsc.integer(), (x, y) => {
    if (x === y) {
      return true;
    }
    const [min, max] = x < y ? [y, x] : [x, y];
    const result = randomInt(min, max);
    return is.null(result);
  });
});

test('randomInt() should throw Error', () => {
  const inputs = [
    undefined,
    null,
    '0',
    [],
    {},
  ];

  for (input of inputs) {
    expect(() => randomInt(input, 0    )).toThrow(/min/);
    expect(() => randomInt(0    , input)).toThrow(/max/);
  }
});
