// import png1 from '../assets/images/radio-checked.png'
import _ from 'lodash';   // 同步引入文件会 自动 code spliting
const { join} = _;
// import style from './index.less'
import './index.less'
// import '../assets/fonts/iconfont'
import createImg from './img'
// import './babelDemo'
import './reactDemo'
// console.log(this)
// import './typeScriptDemo.tsx'

// Tree shaking 只支持ES Module 引入
import { add } from './treeShakingDemo'

// 实现虚拟DOM
import { create } from './virtualDOM'
import { render } from './render'
let vdom = create('div', {'class': 'content'}, [
  create('h3', {}, ['内容']),
  create('ul', { 'style': 'list-style-type: none;border: 1px solid;padding: 20px;'}, [
              create('li', {'class':'li'}, ['选项一']),
              create('li', {'class':'li'}, ['选项二'])
  ])
])
console.log(vdom);
const realDom = render(vdom)
document.body.appendChild(realDom)




add(1, 5)
console.log(join(['a','b']))
createImg()
// console.log(_.join(['a','b','c'],'***'))
// console.log(_join(['a','b','c'],'***'))


const span = document.createElement('span')
span.innerHTML= '2'
// span.classList.add(style.iconfont)
// span.classList.add(style.icondili)
// span.innerHTML = '&#xe60c;'
document.querySelector('#root').append(span)


// function getComponent(){
//   return import(/*webpackChunkName:"loadsh"*/'lodash').then(({default: _ })=>{
//     var element= document.createElement('div');
//     element.innerHTML = _.join(['Wu','wenchao'],'*')
//     return element
//   })
// }

// getComponent().then(element=>{
//   document.body.appendChild(element)
// })


if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('/service-worker.js')
    .then(registration =>{
      console.log('registration',registration)
    })
    .catch(error =>{
      console.log('err',error)
    })
  })
}
