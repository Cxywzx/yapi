/*
 * @Author: caizeyong
 * @Date: 2021-02-03 17:02:37
 * @Description: 
 */
const baseController = require('./base.js');
const yapi = require('../yapi.js');
const subGroupModel = require('../models/subGroup')
const projectModel = require('../models/project.js');

class subGroupController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.schemaMap = {
      add: {
        name: 'string',
        group_id: 'number'
      },
      del: {
        id: 'number'
      },
      list: {
        group_id: 'number'
      },
      up: {
        id: 'number',
        name: 'string'
      }
    }
  }
  async add (ctx) {
    let params = ctx.params;
    let data = {
      name: params.name,
      group_id: params.group_id,
      uid: this.getUid()
    }
    let subGroupInst = yapi.getInst(subGroupModel);
    let result = await subGroupInst.save(data);
    ctx.body = yapi.commons.resReturn(result);
  }
  async up (ctx) {
    let params = ctx.params;
    let data = {
      id: params.id,
      name: params.name,
    }
    let subGroupInst = yapi.getInst(subGroupModel);
    let result = await subGroupInst.up(data.id, data);
    ctx.body = yapi.commons.resReturn(result);
  }
  async del (ctx) {
    let params = ctx.params;
    let projectInst = yapi.getInst(projectModel);
    await projectInst.upSubGroup(params.id, 0);
    let subGroupInst = yapi.getInst(subGroupModel);
    let result = await subGroupInst.del(params.id);
    ctx.body = yapi.commons.resReturn(result);
  }
  async list (ctx) {
    let params = ctx.params;
    let subGroupInst = yapi.getInst(subGroupModel);
    let result = await subGroupInst.list(params.group_id);
    ctx.body = yapi.commons.resReturn(result);
  }
}

module.exports = subGroupController;