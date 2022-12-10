import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { states } from './main.js';

@customElement('simon-button')
export class SimonButton extends LitElement {
  @property() color: string = ''
  @property({ type: Number }) index;
  @property() audio!: string;

  private pushResolve;
  private pushReleaseTimeout;

  static styles = css`
  :host {
    display: block;
    cursor: pointer;
    /* border-radius: 25%; */
    opacity: .7;
  }
  `

  constructor () {
    super()
    this.addEventListener('click', () => {
      if (window.app.state == states.CPU) {
        return
      }
      this.dispatchEvent(new CustomEvent('pushed'))
      this.push()
    })
  }

  protected render() {
    this.style.backgroundColor = this.color
    return html``
  }

  async push () {
    this.resolvePush()
    return new Promise(async resolve => {
      this.pushResolve = resolve
      this.style.opacity = '1'
      this.playSound()
      this.pushReleaseTimeout = setTimeout(() => {
        this.resolvePush()
      }, 750)
    })
  }

  resolvePush () {
    if (this.pushReleaseTimeout) {
      clearTimeout(this.pushReleaseTimeout)
      this.pushReleaseTimeout = undefined
    }
    if (this.pushResolve) {
      this.style.opacity = '0.7'
      this.pushResolve()
    }
  }

  playSound () {
    (new Audio(`sounds/${this.audio}.mp3`)).play()
    // playAudio(`sounds/${this.audio}.mp3`)
  }
}