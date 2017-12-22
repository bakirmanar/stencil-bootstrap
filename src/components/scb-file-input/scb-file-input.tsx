import {
  Component,
  Element,
  HostElement,
  Prop,
  State,
} from '@stencil/core';
import { BootstrapThemeColor } from '../../common/index';

@Component({
  tag: 'scb-file-input',
  styleUrl: './scb-file-input.scss',
})
export class ScbFileInput {
  @Element() el: HostElement;
  @Prop() type: BootstrapThemeColor = 'primary';
  @Prop() maxFiles: number = 0;
  @State() selectedFiles = [];

  openFileInput(): void {
    const hiddenInput:HTMLElement = this.el.getElementsByClassName('scb-file-input-hidden')[0] as HTMLElement;
    hiddenInput.click();
  }

  removeFile(index: number): void {
    let files = this.selectedFiles;

    files.splice(index, 1);
    this.selectedFiles = files;
  }

  render() {
    const buttonClasses = {
      btn: true,
      [`btn-${this.type}`]: true,
    };
    const buttonText = 'Upload Files';
    let attrs = {};
    if (this.maxFiles > 0 && this.maxFiles <= this.selectedFiles.length) {
      attrs['disabled'] = 'disabled';
    }
    return (
      <div class="scb-file-input-wrapper">
        <input class="scb-file-input-hidden" type="file" onChange={() => this.onFileSelect(event)}
               multiple/>
        <button class={buttonClasses} onClick={() => this.openFileInput()} {...attrs}>{buttonText}</button>
        {this.selectedFiles.map((file, i) =>
          <div class="scb-file-row">
            <span class="scb-file-name">{file.name}</span>
            <button class="icon-btn" onClick={() => this.removeFile(i)}><i class="scb-icon icon-close"></i></button>
          </div>
        )}
      </div>
    );
  }

  private onFileSelect(event): void {
    const inputFiles = event.target.files;
    const diff = this.maxFiles - this.selectedFiles.length;
    if (inputFiles.length > 0 && (this.maxFiles === 0 || diff > 0)) {
      const inputFilesArray = [];

      for (const item of inputFiles) {
        inputFilesArray.push(item);
      }
      if (this.maxFiles > 0 && inputFilesArray.length > diff) {
        inputFilesArray.length = diff;
      }

      this.selectedFiles = [...this.selectedFiles, ...inputFilesArray];
    }
  }
}
