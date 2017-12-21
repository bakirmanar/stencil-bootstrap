import {
  Component,
  Element,
  HostElement,
  Prop,
} from '@stencil/core';
import { BootstrapThemeColor } from './../../common/index';

@Component({
  tag: 'scb-file-input',
  styleUrl: './scb-file-input.scss',
})
export class ScbFileInput {
  @Element() el: HostElement;
  @Prop() type: BootstrapThemeColor = 'primary';

  openFileInput () {
    const hiddenInput:HTMLElement = this.el.getElementsByClassName('scb-file-input-hidden')[0] as HTMLElement;
    hiddenInput.click();
  }

  render() {
    const buttonClasses = {
      btn: true,
      [`btn-${this.type}`]: true,
    };
    const buttonText = 'Upload Files';
    return (
      <div class="scb-file-input-wrapper">
        <input class="scb-file-input-hidden" type="file"/>
        <button class={buttonClasses} onClick={() => this.openFileInput()}>{buttonText}</button>
      </div>
    );
  }
}
