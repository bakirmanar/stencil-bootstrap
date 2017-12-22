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
  @State() selectedFiles = {};
  @State() selectedFilesArray = [];

  openFileInput(): void {
    const hiddenInput:HTMLElement = this.el.getElementsByClassName('scb-file-input-hidden')[0] as HTMLElement;
    hiddenInput.click();
  }

  removeFile(index: number): void {
    let files = this.selectedFiles;
    let filesArray = this.selectedFilesArray;

    delete files[index];
    filesArray.splice(index, 1);
    this.selectedFiles = files;
    this.selectedFilesArray = [...filesArray];
  }

  render() {
    const buttonClasses = {
      btn: true,
      [`btn-${this.type}`]: true,
    };
    const buttonText = 'Upload Files';
    return (
      <div class="scb-file-input-wrapper">
        <input class="scb-file-input-hidden" type="file" onChange={() => this.onFileSelect(event)}
               multiple/>
        <button class={buttonClasses} onClick={() => this.openFileInput()}>{buttonText}</button>
        {this.selectedFilesArray.map((file, i) =>
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

    if (inputFiles.length > 0) {
      const inputFilesArray = [];

      for (const item of inputFiles) {
        inputFilesArray.push(item);
      }
      this.selectedFiles = inputFiles;
      this.selectedFilesArray = inputFilesArray;
    }
  }
}
