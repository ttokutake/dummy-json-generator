const UserGenerator = require('../../lib/dummy/user_generator');

const {
  Map,
  fromJS
} = require('immutable');
const is  = require('is_js');
const jsc = require('jsverify');

const {
  jscPosInteger,
} = require('../util');

describe('UserGenerator', () => {
  test('constructor() should throw Error', () => {
    const userParamBase = fromJS({
      num      : 1,
      typeRatio: {
        anonymous: 1,
        normal   : 1,
      },
    });

    const inputs = [
      undefined,
      null,
      0,
      '0',
      [],

      userParamBase.set('num', undefined).toJS(),
      userParamBase.set('num', null     ).toJS(),
      userParamBase.set('num', -1       ).toJS(),
      userParamBase.set('num', '0'      ).toJS(),
      userParamBase.set('num', []       ).toJS(),
      userParamBase.set('num', {}       ).toJS(),
      userParamBase.delete('num')        .toJS(),

      userParamBase.set('typeRatio', null        ).toJS(),
      userParamBase.set('typeRatio', 0           ).toJS(),
      userParamBase.set('typeRatio', '0'         ).toJS(),
      userParamBase.set('typeRatio', []          ).toJS(),
      userParamBase.set('typeRatio', {premium: 1}).toJS(),

      userParamBase.setIn(['typeRatio', 'anonymous'], undefined).toJS(),
      userParamBase.setIn(['typeRatio', 'anonymous'], null     ).toJS(),
      userParamBase.setIn(['typeRatio', 'anonymous'], -1       ).toJS(),
      userParamBase.setIn(['typeRatio', 'anonymous'], '0'      ).toJS(),
      userParamBase.setIn(['typeRatio', 'anonymous'], []       ).toJS(),
      userParamBase.setIn(['typeRatio', 'anonymous'], {}       ).toJS(),

      userParamBase.setIn(['typeRatio', 'normal'], undefined).toJS(),
      userParamBase.setIn(['typeRatio', 'normal'], null     ).toJS(),
      userParamBase.setIn(['typeRatio', 'normal'], -1       ).toJS(),
      userParamBase.setIn(['typeRatio', 'normal'], '0'      ).toJS(),
      userParamBase.setIn(['typeRatio', 'normal'], []       ).toJS(),
      userParamBase.setIn(['typeRatio', 'normal'], {}       ).toJS(),
    ];

    for (const input of inputs) {
      expect(() => new UserGenerator(input)).toThrow();
    }
  });

  test('randomUser() should return some user', () => {
    const inputGenerator = jsc.record({
      num      : jscPosInteger,
      typeRatio: jsc.record({
        anonymous: jsc.nat(),
        normal   : jsc.nat(),
      }),
    });
    jsc.assertForall(inputGenerator, (input) => {
      const user = Map(new UserGenerator(input).randomUser());
      return user.has('email') && user.has('uuid') && user.has('userAgent') && user.has('ipAddress');
    });
  });

  test('randomUser() should return some anonymous user', () => {
    const inputGenerator = jsc.record({
      num      : jscPosInteger,
      typeRatio: jsc.record({
        anonymous: jscPosInteger,
      }),
    });
    jsc.assertForall(inputGenerator, (input) => {
      const user = Map(new UserGenerator(input).randomUser());
      return user.get('email') === '-' && is.null(user.get('uuid')) && user.has('userAgent') && user.has('ipAddress');
    });
  });

  test('randomUser() should return null', () => {
    const input = {num: 0};
    expect(new UserGenerator(input).randomUser()).toBeNull();
  });

  test('all() should return all users', () => {
    const inputGenerator = jsc.record({
      num: jscPosInteger,
      typeRatio: jsc.record({
        anonymous: jsc.nat(),
        normal   : jsc.nat(),
      }),
    });
    jsc.assertForall(inputGenerator, (input) => {
      const users = new UserGenerator(input)
        .all()
        .map((user) => Map(user));
      const sizeIsCorrect   = users.length === input.num;
      const allElemsAreUser = users.every((user) => user.has('email') && user.has('uuid') && user.has('userAgent') && user.has('ipAddress'));
      return sizeIsCorrect && allElemsAreUser;
    });
  });
});
