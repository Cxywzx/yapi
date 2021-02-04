/*
 * @Author: caizeyong
 * @Date: 2021-02-03 18:45:15
 * @Description: 
 */
import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchSubGroupList } from '../../../reducer/modules/subGroup.js'
import { Input, Button, Icon, Alert, message, Modal } from 'antd';
import Axios from 'axios';
import './SubGroupSetting.scss';
const confirm = Modal.confirm;

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
      name: '',
      currentSubGroup: ''
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
    });
  }
  handleChange = (e) => {
    this.setState({
      name: e.target.value
    });
  }
  editSubGroup = (e) => {
    this.setState({
      currentSubGroup: e.target.dataset.id * 1
    });
  }
  setListRef = element => {
    this.ulList = element
  }
  upSubGroup = (e) => {
    let id = e.target.dataset.id * 1;
    let name = e.target.value.trim();
    if (!name) {
      return
    }
    // 判断是否重复
    let isExists = this.props.subGroupList.some(g => {
      return g.name === name && g._id !== id
    })
    if (isExists) {
      message.error('分类名称已存在，请重新输入');
      return
    }
    Axios.post('/api/subgroup/edit', {
      name: name,
      id: id
    }).then(res => {
      console.log(res);
      this.props.fetchSubGroupList(this.props.currGroup._id);
      this.setState({
        currentSubGroup: ''
      })
    })
  }
  delSubGroup = (e) => {
    let that = this;
    let id = e.target.dataset.id * 1;
    confirm({
      title: '确认删除该分类吗吗？',
      content: (
        <div style={{ marginTop: '10px', fontSize: '13px', lineHeight: '25px' }}>
          <Alert
            message="删除分类仅会将该分类下的项目规划到未分类！"
            type="warning"
          />
        </div>
      ),
      onOk() {
        Axios.post('/api/subgroup/del', {
          id
        }).then(() => {
          message.success('已删除');
          that.props.fetchSubGroupList(that.props.currGroup._id);
        });
      },
      iconType: 'delete',
      onCancel() {}
    });
  }
  render () {
    return (
      <div className="sub-group">
        <div className="sub-group__form">
          <div>
            <Input placeholder="请输入分类名称" maxLength={30} value={this.state.name} onChange={this.handleChange} onPressEnter={this.handleClick}/>
          </div>
          <Button type="primary" onClick={this.handleClick}>添加</Button>
        </div>
        <div className="sub-group__title">已添加分类</div>
        <ul className="sub-group__list" ref={this.setListRef}>
          {this.props.subGroupList.map(subGroup => (
            <li key={subGroup._id}>
              {
                this.state.currentSubGroup === subGroup._id ? (
                  <Input placeholder="请输入分类名称" maxLength={30} data-id={subGroup._id} defaultValue={subGroup.name} onBlur={this.upSubGroup} onPressEnter={this.upSubGroup} />
                ) : (
                  <React.Fragment>
                    <div>
                      {subGroup.name}
                    </div>
                    <Icon data-id={subGroup._id} type="edit" onClick={this.editSubGroup} />
                    <Icon data-id={subGroup._id} type="delete" onClick={this.delSubGroup} />
                  </React.Fragment>
                )
              }
            </li>
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
  componentDidUpdate () {
    let input = this.ulList.querySelector('input');
    input && input.focus();
    input && input.select();
  }
}

export default SubGroupSetting;