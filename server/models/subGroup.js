/*
 * @Author: caizeyong
 * @Date: 2021-02-03 16:53:56
 * @Description: 
 */
const baseModel = require('./base.js');

class subGroupModel extends baseModel {
  getName () {
    return 'subGroup';
  }
  getSchema () {
    return {
      uid: {
        type: Number,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      group_id: { type: Number, required: true },
    }
  }
  save (data) {
    let m = new this.model(data);
    return m.save();
  }
  list(group_id) {
    let params = { group_id: group_id };
    return this.model
      .find(params)
      .select(
        '_id uid name group_id'
      )
      .exec();
  }
  del (id) {
    return this.model.remove({
      _id: id
    });
  }
  up(id, data) {
    return this.model.update(
      {
        _id: id
      },
      {
        name: data.name
      }
    );
  }
}

module.exports = subGroupModel;
