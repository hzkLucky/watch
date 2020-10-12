// superagent 是用来发起请求的，是一个轻量的,渐进式的ajax api,可读性好,学习曲线低,内部依赖nodejs原生的请求api,适用于nodejs环境下，

// 也可以使用http发起请求

// superagent-charset防止爬取下来的数据乱码,用于将superagent获取到的数据进行转码

// superagent默认情况下，对响应4xx和5xx的认为不是错误，例如当响应返回一个500或者403的时候，这些状态信息可以通过response.error，response.status和其它的响应属性来查看。

// 不产生响应的网络故障、超时和其他错误将不包含response.error，response.status属性。

// 如果希望处理404个或其他HTTP错误响应，可以查询error.status属性。当发生HTTP错误（4xx或5xx响应）时，response.error属性是error对象，这可以用来作以下检查：
var http = require('http');
const nodemailer = require("nodemailer");
const server = http.createServer();
let charset = require('superagent-charset')
const request = charset(require('superagent'))
require('superagent-proxy')(request)
const transporter = nodemailer.createTransport({
  service: 'qq',
  secure: true,	//安全方式发送,建议都加上
  auth: {
    user: "1171732593@qq.com",
    pass: "qcjqmrzptamnhbfi" //这里的密码是客户端授权码，不是邮件的登陆密码
  }
});
const emailList = 'haozk1@lenovo.com';

var options = [{
  hostname: 'http://localhost:80',//这里可以填入你要监控的服务器url
  name: '测试',
  addCheck: true
}];

/**
 * @description 使用promise请求抓取的网页
 */
function getRequestPromise(url) {
  return new Promise(function (resolve, reject) {
    request
      .get(url)
      .timeout({
        response: 6000,
        deadline: 6000
      })
      .end((error, response) => {
        if (!error && (response.statusCode == 200 || response.statusCode == 304)) {
          //  console.log('response', response.text)
          resolve(response.text)
        } else {
          reject(error)
        }
      })
  })
}

var timer = setInterval(function () {
  options.forEach(item => {
    getRequestPromise(item.hostname).then(page => {
      if (!item.addCheck) {
        let restartOptions = {
          from: '1171732593@qq.com',
          to: emailList,
          subject: item.name + '系统恢复',
          text: item.name + '服务器已恢复'
        }
        transporter.sendMail(restartOptions, function (err, res) {
          if (err) {
            console.log('>>>>>>>' + err);
          }
          item.addCheck = true;
        })
      }
    }).catch(e => {
      if (item.addCheck) {
        //定义服务器宕机和恢复时要发送的邮件格式
        let errorOptions = {
          from: '1171732593@qq.com',
          to: emailList,
          subject: item.name + '出现问题',
          text: item.name + '出现问题,请及时查看尽快修复:'+e
        }
        transporter.sendMail(errorOptions, function (err, res) {
          if (err) {
            console.log('发送邮件失败：' + err);
          }
          else {
            console.log(new Date() + '系统挂掉了');
          }
          item.addCheck = false;
        });
      }
    })
  })

}, 6000);