/*
 * @Author: caizeyong
 * @Date: 2021-02-03 17:51:37
 * @Description: 
 */
import axios from 'axios';

const FETCH_SUB_GROUP_LIST = 'yapi/subgroup/FETCH_SUB_GROUP_LIST'

let defaultState = {
  subGroupList: []
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_SUB_GROUP_LIST: {
      return {
        ...state,
        subGroupList: action.payload.data.data
      };
    }
    default:
      return state
  }
}

export function fetchSubGroupList (group_id) {
  return {
    type: FETCH_SUB_GROUP_LIST,
    payload: axios.post('/api/subgroup/list', {
      group_id
    })
  }
}