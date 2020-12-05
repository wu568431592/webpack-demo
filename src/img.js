import png1 from '../assets/images/radio-checked.png'
export default function img(){
  const img1 = new Image()
  img1.src = png1
  img1.classList.add('img')
  document.querySelector('#root').append(img1)
}