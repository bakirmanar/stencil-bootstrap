import {
  Component,
  Element,
  HostElement,
  Listen,
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
  @Prop() nodrop: boolean = false;
  @State() selectedFiles = [];

  openFileInput(): void {
    const hiddenInput:HTMLElement = this.el.getElementsByClassName('scb-file-input-hidden')[0] as HTMLElement;
    hiddenInput.click();
  }

  removeFile(index: number): void {
    let files = this.selectedFiles;

    this.selectedFiles = [];
    files.splice(index, 1);
    setTimeout(() => this.selectedFiles = [...files]);
  }

  retryUpload(index: number): void {
    const file = this.selectedFiles[index];

    file.loadStatus < 100 && file.fileReader.readAsDataURL(file);
  }

  render() {
    const buttonClasses = {
      btn: true,
      [`btn-outline-${this.type}`]: true,
    };
    const isMultiple = this.maxFiles !== 1;
    const buttonText:string = isMultiple ? 'Upload Files' : 'Select File';
    const dropLabel:string = isMultiple ? 'Drop files here...' : 'Drop file here...';
    const label = this.nodrop ? '' : <span class="scb-file-input-label">
        <slot name="label"></slot>
        <span class="default-label">{dropLabel}</span>
      </span>;
    let buttonAttrs:object = {};
    let inputAttrs:object = {};

    if (this.maxFiles > 0 && this.maxFiles <= this.selectedFiles.length) {
      buttonAttrs['disabled'] = 'disabled';
    }
    if (isMultiple) {
      inputAttrs['multiple'] = true;
    }

    console.log(this.selectedFiles);

    return (
      <div class="scb-file-input-wrapper">
        <input class="scb-file-input-hidden" type="file" onChange={() => this.onFileSelect(event)} {...inputAttrs}/>
        <button class={buttonClasses} onClick={() => this.openFileInput()} {...buttonAttrs}>{buttonText}</button>
        {label}
        {this.selectedFiles.map((file, i) =>
          <div class="scb-file-row" id={file.elemId}>
            <div class="scb-file-row-header">
              <span class="scb-file-name">{file.name}</span>
              <div class="scb-file-controls">
                <button class={{
                  'icon-btn': true,
                  'scb-file-retry-btn': true,
                  'd-none': this.selectedFiles[i].fileReader.readyState === 2 && this.selectedFiles[i].loadStatus === 100,
                }} onClick={() => this.retryUpload(i)}>
                  <span class="scb-icon icon-reload"></span>
                </button>
                <button class="icon-btn close" onClick={() => this.removeFile(i)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </div>
            <div class="progress">
              <div class="progress-bar" style={{ width: file.loadStatus + '%' }} role="progressbar"
                   aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>,
        )}
      </div>
    );
  }

  @Listen('dragenter')
  private cancelDefaultDragEnter(event): boolean {
    event.preventDefault();
    return false;
  }
  @Listen('dragover')
  private cancelDefaultDragOver(event): boolean {
    event.preventDefault();
    return false;
  }
  @Listen('drop')
  private onDrop(e): boolean {
    event.preventDefault();
    if (!this.nodrop) {
      const dt = e.dataTransfer;
      this.addFiles(dt.files);
    }

    return false;
  }

  private onFileSelect(event): void {
    this.addFiles(event.target.files);
    event.target.value = '';
  }

  private addFiles(files): void {
    const diff = this.maxFiles - this.selectedFiles.length;

    if (files.length > 0 && (this.maxFiles === 0 || diff > 0)) {
      const lastSelectedFiles = this.selectedFiles;
      const filesArray = [];

      this.selectedFiles = [];
      for (const item of files) {
        filesArray.push(item);
      }
      if (this.maxFiles > 0 && filesArray.length > diff) {
        filesArray.length = diff;
      }
      filesArray.forEach((file, i) => {
        file.elemId = 'file' + i + Date.now();
      });
      setTimeout(() => this.selectedFiles = [...lastSelectedFiles, ...filesArray]);
      filesArray.forEach((file) => this.readFile(file));
    }
  }

  private readFile(file): void {
    const reader = new FileReader();
    file.loadStatus = 0;

    reader.onprogress = (e) => {
      const percentage = Math.round(e.loaded / e.total * 100);
      const prBar = this.el.querySelector('#' + file.elemId + ' .progress-bar') as HTMLElement;

      file.loadStatus = percentage;
      prBar && (prBar.style.width = percentage + '%');
    };

    reader.onloadend = () => {
      const retryBtn = this.el.querySelector('#' + file.elemId + ' .scb-file-retry-btn') as HTMLElement;
      const isLoaded = file.fileReader.readyState === 2 && file.loadStatus === 100;

      retryBtn && retryBtn.classList.toggle('d-none', isLoaded);
    };

    reader.onload = () => {
      const prBar = this.el.querySelector('#' + file.elemId + ' .progress-bar') as HTMLElement;

      file.loadStatus = 100;
      prBar && (prBar.style.width = '100%');
    };

    reader.readAsDataURL(file);
    file.fileReader = reader;
  }
}
