import { VirtualDOM } from "./virtualDOM";

function render(vdom){
  const { type, props, children } =  vdom
  const element = document.createElement(type)
  setProps(element, props);
  let childEle = undefined
  children.forEach(child => {
    if(child instanceof VirtualDOM){
      childEle = render(child)
    }else{
      childEle = document.createTextNode(children)
    }
    element.appendChild(childEle)
  });
  return element
}

function setProps (element, props){
  for (var key in props) {
    element.setAttribute(key,props[key]);
}
}



export { render}