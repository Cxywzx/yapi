import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Button, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import {
  addProject,
  fetchProjectList,
  delProject,
  changeUpdateModal
} from '../../../reducer/modules/project';
import { fetchSubGroupList } from '../../../reducer/modules/subGroup.js'
import ProjectCard from '../../../components/ProjectCard/ProjectCard.js';
import ErrMsg from '../../../components/ErrMsg/ErrMsg.js';
import { autobind } from 'core-decorators';
import { setBreadcrumb } from '../../../reducer/modules/user';

import './ProjectList.scss';

@connect(
  state => {
    return {
      projectList: state.project.projectList,
      userInfo: state.project.userInfo,
      tableLoading: state.project.tableLoading,
      subGroupList: state.subGroup.subGroupList,
      currGroup: state.group.currGroup,
      currPage: state.project.currPage
    };
  },
  {
    fetchProjectList,
    addProject,
    delProject,
    changeUpdateModal,
    setBreadcrumb,
    fetchSubGroupList
  }
)
class ProjectList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      protocol: 'http://',
      projectData: []
    };
  }
  static propTypes = {
    form: PropTypes.object,
    subGroupList: PropTypes.array,
    fetchProjectList: PropTypes.func,
    addProject: PropTypes.func,
    delProject: PropTypes.func,
    changeUpdateModal: PropTypes.func,
    projectList: PropTypes.array,
    userInfo: PropTypes.object,
    tableLoading: PropTypes.bool,
    currGroup: PropTypes.object,
    setBreadcrumb: PropTypes.func,
    currPage: PropTypes.number,
    studyTip: PropTypes.number,
    study: PropTypes.bool,
    fetchSubGroupList: PropTypes.func
  };

  // 取消修改
  @autobind
  handleCancel() {
    this.props.form.resetFields();
    this.setState({
      visible: false
    });
  }

  // 修改线上域名的协议类型 (http/https)
  @autobind
  protocolChange(value) {
    this.setState({
      protocol: value
    });
  }

  // 获取 ProjectCard 组件的关注事件回调，收到后更新数据

  receiveRes = () => {
    this.props.fetchProjectList(this.props.currGroup._id, this.props.currPage);
  };

  componentWillReceiveProps(nextProps) {
    this.props.setBreadcrumb([{ name: '' + (nextProps.currGroup.group_name || '') }]);

    // 切换分组
    if (this.props.currGroup !== nextProps.currGroup && nextProps.currGroup._id) {
      this.props.fetchProjectList(nextProps.currGroup._id, this.props.currPage);
      this.props.fetchSubGroupList(nextProps.currGroup._id)
    }

    // 切换项目列表
    if (this.props.projectList !== nextProps.projectList) {
      // console.log(nextProps.projectList);
      const data = nextProps.projectList.map((item, index) => {
        item.key = index;
        return item;
      });
      this.setState({
        projectData: data
      });
    }
  }

  render() {
    let projectData = this.state.projectData;
    let noFollow = [];
    let followProject = [];
    let subGroup = this.props.subGroupList;
    let projectDataWithGroup = [];
    let projectDataWithGroupMap = {};
    let noGroup = [];
    for (var i in projectData) {
      if (projectData[i].follow) {
        followProject.push(projectData[i]);
      } else {
        noFollow.push(projectData[i]);
      }
      if (projectData[i].sub_group_id) {
        if (!projectDataWithGroupMap[projectData[i].sub_group_id]) {
          projectDataWithGroupMap[projectData[i].sub_group_id] = [];
        }
        projectDataWithGroupMap[projectData[i].sub_group_id].push(projectData[i]);
      } else {
        noGroup.push(projectData[i]);
      }
    }
    followProject = followProject.sort((a, b) => {
      return b.up_time - a.up_time;
    });
    noFollow = noFollow.sort((a, b) => {
      return b.up_time - a.up_time;
    });
    projectData = [...followProject, ...noFollow];

    subGroup.forEach(item => {
      if (projectDataWithGroupMap[item._id]) {
        projectDataWithGroup.push({
          subGroupName: item.name,
          subGroupId: item._id,
          children: [...projectDataWithGroupMap[item._id]]
        });
      } else {
        noGroup = noGroup.concat(projectDataWithGroupMap[item._id] || []);
      }
      delete projectDataWithGroupMap[item._id];
    });
    Object.keys(projectDataWithGroupMap).forEach(k => {
      noGroup = noGroup.concat(projectDataWithGroupMap[k] || [])
    })
    projectDataWithGroup.push({
      subGroupName: '未分类',
      subGroupId: -1,
      children: [...noGroup]
    });


    const isShow = /(admin)|(owner)|(dev)/.test(this.props.currGroup.role);

    const Follow = () => {
      return followProject.length ? (
        <Row>
          <h3 className="owner-type">我的关注</h3>
          {followProject.map((item, index) => {
            return (
              <Col xs={8} lg={6} xxl={4} key={index}>
                <ProjectCard projectData={item} callbackResult={this.receiveRes} />
              </Col>
            );
          })}
        </Row>
      ) : null;
    };
    const NoFollow = () => {
      return noFollow.length ? (
        <Row style={{ borderBottom: '1px solid #eee', marginBottom: '15px' }}>
          <h3 className="owner-type">我的项目</h3>
          {noFollow.map((item, index) => {
            return (
              <Col xs={8} lg={6} xxl={4} key={index}>
                <ProjectCard projectData={item} callbackResult={this.receiveRes} isShow={isShow} />
              </Col>
            );
          })}
        </Row>
      ) : null;
    };

    const OwnerSpace = () => {
      return projectData.length ? (
        <div>
          <NoFollow />
          <Follow />
        </div>
      ) : (
        <ErrMsg type="noProject" />
      );
    };

    return (
      <div style={{ paddingTop: '24px' }} className="m-panel card-panel card-panel-s project-list">
        <Row className="project-list-header">
          <Col span={16} style={{ textAlign: 'left' }}>
            {this.props.currGroup.group_name} 分组共 ({projectData.length}) 个项目
          </Col>
          <Col span={8}>
            {isShow ? (
              <Link to="/add-project">
                <Button type="primary">添加项目</Button>
              </Link>
            ) : (
              <Tooltip title="您没有权限,请联系该分组组长或管理员">
                <Button type="primary" disabled>
                  添加项目
                </Button>
              </Tooltip>
            )}
          </Col>
        </Row>
        <Row>
          {/* {projectData.length ? projectData.map((item, index) => {
            return (
              <Col xs={8} md={6} xl={4} key={index}>
                <ProjectCard projectData={item} callbackResult={this.receiveRes} />
              </Col>);
          }) : <ErrMsg type="noProject" />} */}
          {this.props.currGroup.type === 'private' ? (
            <OwnerSpace />
          ) : projectDataWithGroup.length ? (
            projectDataWithGroup.map(item => {
              return (
                item.children.length > 0 ? (
                  <React.Fragment key={item.subGroupId}>
                    <Col span={24} className="sub-group-title" >{item.subGroupName}</Col>
                    {item.children.map((project,index) => {
                        return (
                          <Col xs={8} lg={6} xxl={4} key={index}>
                            <ProjectCard
                              projectData={project}
                              callbackResult={this.receiveRes}
                              isShow={isShow}
                            />
                          </Col>
                        )
                    })}
                  </React.Fragment>
                ) : null
              )
            })
          ) : (
            <ErrMsg type="noProject" />
          )}
        </Row>
      </div>
    );
  }
}

export default ProjectList;
