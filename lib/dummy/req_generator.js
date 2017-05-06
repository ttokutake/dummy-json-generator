const faker      = require('faker');
const {Map}      = require('immutable');
const is         = require('is_js');
const {validate} = require('jsonschema');

const RatioMap = require('../ratio_map');


const NOTHING = '-';

class ReqGenerator {
  constructor(reqParams) {
    const reqs = ReqGenerator.validate(reqParams)
      .map((p) => Map(p).update('statusRatio', (rs) => new RatioMap(rs)))
      .reduce((map, param) => map.set(param.delete('ratio'), param.get('ratio')), Map());
    this.reqRatio = new RatioMap(reqs);
  }

  randomRequest() {
    const req = this.reqRatio.randomKey();
    if (is.null(req)) {
      return ReqGenerator.defaultRequest();
    } else {
      const status = req.get('statusRatio').randomKey();
      return req.delete('statusRatio')
        .set('status', is.null(status) ? NOTHING : status)
        .toJSON();
    }
  }

  static validate(reqParams) {
    const schema = {
      $schema: "http://json-schema.org/schema#",
      type   : 'array',
      items  : {
        type      : 'object',
        properties: {
          method     : {type: 'string'},
          path       : {type: 'string'},
          ratio      : {type: 'integer', minimum: 0},
          statusRatio: {
            type                : 'object',
            additionalProperties: {type: 'integer', minimum: 0},
          },
        },
        required: ['method', 'path', 'ratio', 'statusRatio'],
      },
    };
    const result = validate(reqParams, schema);
    if (!result.valid) {
      throw new Error(result.toString());
    }
    for (const {statusRatio} of reqParams) {
      RatioMap.validate(statusRatio);
    }
    return reqParams;
  }

  static defaultRequest() {
    return {method: NOTHING, path: NOTHING, status: NOTHING};
  }
}

class CrudReqGenerator extends ReqGenerator {
  constructor(crudParam) {
    CrudReqGenerator.validate(crudParam)

    const reqParams = Map(crudParam.methodRatio)
      .map(({ratio, statusRatio}, method) => {
        return {method: method, path: `/v1/${crudParam.resource}`, ratio, statusRatio};
      })
      .valueSeq();
    super(reqParams.toJSON());

    this.resource = crudParam.resource;
  }

  randomRequest(id) {
    if (is.not.string(id)) {
      throw new Error('1st argument(id) must be "String"');
    }
    const map = Map(super.randomRequest());
    return map
      .update('path', (path) => path === NOTHING || map.get('method') === 'POST' ? path : `${path}/${id}`)
      .toJSON();
  }

  static validate(crudParam) {
    const schema = {
      $schema   : "http://json-schema.org/schema#",
      type      : 'object',
      properties: {
        resource   : {type: 'string'},
        methodRatio: {
          type      : 'object',
          properties: {
            POST  : {$ref: '#/definitions/reqRatio'},
            GET   : {$ref: '#/definitions/reqRatio'},
            PUT   : {$ref: '#/definitions/reqRatio'},
            DELETE: {$ref: '#/definitions/reqRatio'},
          },
          additionalProperties: false,
        },
      },
      required: ['resource', 'methodRatio'],
      definitions: {
        reqRatio: {
          type: 'object',
          properties: {
            ratio      : {type: 'integer', minimum: 0},
            statusRatio: {
              type                : 'object',
              additionalProperties: {type: 'integer', minimum: 0},
            },
          },
          required: ['ratio', 'statusRatio'],
        },
      },
    };
    const result = validate(crudParam, schema);
    if (!result.valid) {
      throw new Error(result.toString());
    }
    Map(crudParam.methodRatio).forEach(({statusRatio}) => RatioMap.validate(statusRatio));
    return crudParam;
  }
}

module.exports = {
  CrudReqGenerator,
  ReqGenerator,
};