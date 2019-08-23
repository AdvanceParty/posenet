export class Hud {
  constructor(id = 'hud') {
    this.el = document.createElement('aside');
    this.el.id = id;
  }

  print(message) {
    const p = document.createElement('p');
    p.innerText = message;
    this.el.appendChild(p);
  }

  clear() {
    this.el.innerHTML = '';
  }

  get container() {
    return this.el;
  }
}

export default Hud;
