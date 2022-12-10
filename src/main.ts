import { LitElement, html, css, PropertyValueMap, TemplateResult } from 'lit'
import { customElement, queryAll, state } from 'lit/decorators.js'
import '@material/mwc-snackbar'
import '@material/mwc-button'
// import '@material/mwc-icon-button'
// import '@material/mwc-dialog'
// import '@material/mwc-textfield'
// import '@material/mwc-checkbox'
import gamecontrol from 'gamecontroller.js'
import './simon-button.js'
import { SimonButton } from './simon-button.js'
import { sleep } from './utils.js'

declare global {
  interface Window {
    app: AppContainer;
    toast: (labelText: string, timeoutMs?: number) => void;
  }
}

@customElement('app-container')
export class AppContainer extends LitElement {
  private level = 3;
  private line: number[] = []
  private testline: number[] = []
  @state() cpuMode = true;

  @state() feedback: string|TemplateResult = '';

  @queryAll('simon-button') simonButtons!: SimonButton[];

  reset () {
    this.level = 3
    for (let i = 0; i < this.level; ++i) {
      this.addRandomButtonToTheLine()
    }
  }

  static styles = css`
  :host {
    display: flex;
    flex-wrap: wrap;
    height: 100vh;
    background-color: #d4d4d4;
  }
  .box {
    display: inline-block;
    width:calc(100% / 3);
    height:calc(100% / 3);
    box-sizing: border-box;
  }
  `

  addRandomButtonToTheLine () {
    this.line.push(this.getRandomSimonButton().index)
  }

  getButtonFromIndex (index: number) {
    return [...this.simonButtons].find(b => b.index === index)!
  }

  async playLine () {
    this.feedback = `level ${this.level}`
    this.cpuMode = true
    for (let i = 0; i < this.level; ++i) {
      // await (this.getButtonFromIndex(this.line[i]).push())
      await this.getButtonFromIndex(this.line[i]).push()
      await sleep(250)
    }

    this.testline = []
    this.cpuMode = false
  }

  getRandomSimonButton () {
    const buttons = this.simonButtons
    return buttons[Math.floor(Math.random() * buttons.length)]
  }

  clickOnButton (index: number) {
    this.getButtonFromIndex(index).click()
  }

  render () {
    return html`
    <!-- <div style="background-color:grey"> -->
      <div class=box></div>
      <simon-button index=1 color="#ffc107" class=box audio=65></simon-button>
      <div class=box></div>

      <simon-button index=2 color="blue" class=box audio=71></simon-button>
      <div class=box style="background-color:white;display:flex;flex-direction:column;justify-content:center;align-items:center;font-size:2em">${this.feedback}</div>
      <simon-button index=3 color="red" class=box audio=78></simon-button>

      <div class=box></div>
      <simon-button index=4 color="green" class=box audio=83></simon-button>
      <div class=box></div>
    <!-- </div> -->
    `
  }


  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    window.app = this;
    this.reset()

    this.feedback = html`
    <mwc-button unelevated @click=${()=>{
      this.feedback = `level ${this.level}`
      this.playLine()
    }}>start</mwc-button>
    `

    const buttons = this.simonButtons
    buttons.forEach(b => {
      b.addEventListener('pushed', () => {
        this.testline.push(b.index)
        this.compareLines()
        buttons.forEach(b2 => {
          if (b2 == b) { return }
          b2.resolvePush()
        })
      })
    })


    /* controller */
    gamecontrol.on('connect', gamepad => {
      gamepad.before('button3', () => {
        this.clickOnButton(1)
      })
      gamepad.before('button2', () => {
        this.clickOnButton(2)
      })
      gamepad.before('button1', () => {
        this.clickOnButton(3)
      })
      gamepad.before('button0', () => {
        this.clickOnButton(4)
      })
      gamepad.before('button9', () => {
        this.shadowRoot!.querySelector('mwc-button')?.click()
      })
    })
  }

  compareLines () {
    for (let i = 0; i < this.testline.length; ++i) {
      if (this.testline[i] != this.line[i]) {
        this.gameOver()
        return;
        // return -1;
      }
    }

    if (this.testline.length == this.line.length) {
      this.success()
      return 1;
    }
    else {
      /* continue */
    }
  }

  gameOver () {
    this.cpuMode = true
    this.feedback = html`GAME OVER<br>
    Level ${this.level}<br>
    <mwc-button unelevated @click=${()=>{
      this.feedback = `level ${this.level}`
      this.reset()
      this.playLine()
    }}>retry</mwc-button>
    `
    this.cpuMode
  }

  async success() {
    this.level++;
    this.feedback = `level ${this.level}`
    this.addRandomButtonToTheLine()
    await sleep(2000)
    this.playLine()
  }

  writeFeedback (text: string) {
    this.shadowRoot!.querySelector('#feedback')!.textContent = text
  }
}
