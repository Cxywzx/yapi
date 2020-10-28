const _ = require('underscore');
const axios = require('axios');


const isNode = typeof global == 'object' && global.global === global;

async function handle(
  res,
  projectId,
  selectCatid,
  menuList,
  basePath,
  dataSync,
  messageError,
  messageSuccess,
  callback,
  token,
  port
) {

  const taskNotice = _.throttle((index, len)=>{
    messageSuccess(`正在导入，已执行任务 ${index+1} 个，共 ${len} 个`)
  }, 3000)

  const handleAddCat = async cats => {
    // 对 cats 中的数据按照 parent_id 调整顺序
    // 这样上传的时候才能确保父级先创建，子级才有父级创建后的 id 可用
    function sortByParentId (list) {
      list.sort((a,b) => {
        a.parent_id - b.parent_id
      })
    }
    // 找到 cats 中 cat 的的父级 id
    function findParentId (list, target) {
      const parent = list.find(item => {
        return item._id == target.parent_id
      })
      return parent ? parent.id : 0
    }

    let catsObj = {};
    if (cats && Array.isArray(cats)) {
      sortByParentId(cats);
      for (let i = 0; i < cats.length; i++) {
        let cat = cats[i];
        let findCat = _.find(menuList, menu => menu.name === cat.name);
        catsObj[cat.name] = cat;
        if (findCat) {
          cat.id = findCat._id;
        } else {
          let apipath = '/api/interface/add_cat';
          if (isNode) {
            apipath = 'http://127.0.0.1:' + port + apipath;
          }

          let data = {
            name: cat.name,
            parent_id: findParentId(cats, cat),
            project_id: projectId,
            desc: cat.desc,
            index: cat.index || 0,
            token
          };
          let result = await axios.post(apipath, data);

          if (result.data.errcode) {
            messageError(result.data.errmsg);
            callback({ showLoading: false });
            return false;
          }
          cat.id = result.data.data._id;
        }
      }
    }
    return catsObj;
  };

  const handleAddInterface = async info => {
    const cats = await handleAddCat(info.cats);
    if (cats === false) {
      return;
    }
    
    const res = info.apis;
    let len = res.length;
    let count = 0;
    let successNum = len;
    let existNum = 0;
    if (len === 0) {
      messageError(`解析数据为空`);
      callback({ showLoading: false });
      return;
    }

    if(info.basePath){
      let projectApiPath = '/api/project/up';
      if (isNode) {
        projectApiPath = 'http://127.0.0.1:' + port + projectApiPath;
      }

      await axios.post(projectApiPath, {
        id: projectId,
        basepath: info.basePath,
        token
      })
    }

    for (let index = 0; index < res.length; index++) {
      let item = res[index];
      let data = Object.assign(item, {
        project_id: projectId,
        catid: selectCatid
      });
      if (basePath) {
        data.path =
          data.path.indexOf(basePath) === 0 ? data.path.substr(basePath.length) : data.path;
      }
      if (
        data.catname &&
        cats[data.catname] &&
        typeof cats[data.catname] === 'object' &&
        cats[data.catname].id
      ) {
        data.catid = cats[data.catname].id;
      }
      data.token = token;

      if (dataSync !== 'normal') {
        // 开启同步功能
        count++;
        let apipath = '/api/interface/save';
        if (isNode) {
          apipath = 'http://127.0.0.1:' + port + apipath;
        }
        data.dataSync = dataSync;
        let result = await axios.post(apipath, data);
        if (result.data.errcode) {
          successNum--;
          callback({ showLoading: false });
          messageError(result.data.errmsg);
        } else {
          existNum = existNum + result.data.data.length;
        }
      } else {
        // 未开启同步功能
        count++;
        let apipath = '/api/interface/add';
        if (isNode) {
          apipath = 'http://127.0.0.1:' + port + apipath;
        }
        let result = await axios.post(apipath, data);
        if (result.data.errcode) {
          successNum--;
          if (result.data.errcode == 40022) {
            existNum++;
          }
          if (result.data.errcode == 40033) {
            callback({ showLoading: false });
            messageError('没有权限');
            break;
          }
        }
      }
      if (count === len) {
        callback({ showLoading: false });
        messageSuccess(`成功导入接口 ${successNum} 个, 已存在的接口 ${existNum} 个`);
        return;
      }

      taskNotice(index, res.length)
    }
  };

  return await handleAddInterface(res);
}

module.exports = handle;
