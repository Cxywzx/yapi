/*
 * @Author: caizeyong
 * @Date: 2021-02-03 18:45:15
 * @Description: 
 */
import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchSubGroupList } from '../../../reducer/modules/subGroup.js'
import { Input, Button, message } from 'antd';
import Axios from 'axios';
import './SubGroupSetting.scss'

@connect(
  state => {
    return {
      currGroup: state.group.currGroup,
      subGroupList: state.subGroup.subGroupList
    }
  },
  {
    fetchSubGroupList
  }
)
class SubGroupSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ''
    }
  }
  static propTypes = {
    currGroup: PropTypes.object,
    subGroupList: PropTypes.array,
    fetchSubGroupList: PropTypes.func
  };
  handleClick = () => {
    let isExists = this.props.subGroupList.some(g => {
      return g.name === this.state.name.trim()
    })
    if (isExists) {
      message.error('分类已存在，请勿重复添加');
      return
    }
    Axios.post('/api/subgroup/add', {
      name: this.state.name.trim(),
      group_id: this.props.currGroup._id
    }).then(res => {
      console.log(res);
      this.props.fetchSubGroupList(this.props.currGroup._id);
      this.setState({
        name: ''
      });
    })
  }
  handleChange = (e) => {
    this.setState({
      name: e.target.value
    })
  }
  render () {
    return (
      <div className="sub-group">
        <div className="sub-group__form">
          <div>
            <Input placeholder="请输入分类名称" value={this.state.name} onChange={this.handleChange} onPressEnter={this.handleClick}/>
          </div>
          <Button type="primary" onClick={this.handleClick}>添加</Button>
        </div>
        <div className="sub-group__title">已添加分组</div>
        <ul className="sub-group__list">
          {this.props.subGroupList.map(subGroup => (
            <li key={subGroup._id}>{subGroup.name}</li>
          ))}
        </ul>
      </div>
    )
  }
  componentWillReceiveProps(nextProps) {
    // 切换分组时，更新分组信息并关闭删除分组操作
    if (this.props.currGroup._id !== nextProps.currGroup._id) {
      this.props.fetchSubGroupList(nextProps.currGroup._id)
    }
  }
  componentDidMount () {
    this.props.fetchSubGroupList(this.props.currGroup._id)
  }
}

export default SubGroupSetting;