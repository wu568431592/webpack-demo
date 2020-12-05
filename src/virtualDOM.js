function VirtualDOM(type, props, children){
  this.type = type;
  this.props = props;
  this.children = children;
}

function create(type, props, children){
  return new VirtualDOM(type, props, children)
}
export {
  VirtualDOM,
  create
}