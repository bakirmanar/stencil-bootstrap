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
  @Prop() accept: string;
  @Prop() maxFileSize: number = 0;
  @Prop() method: string;
  @Prop() target: string;
  @Prop() timeout: number;
  @Prop() headers: string;
  @Prop() formDataName: string;
  @State() selectedFiles = [];

  openFileInput(): void {
    const hiddenInput:HTMLElement = this.el.getElementsByClassName('scb-file-input-hidden')[0] as HTMLElement;
    hiddenInput.click();
  }

  removeFile(index: number): void {
    let files = this.selectedFiles;
    let file = files[index];

    file.reading && file.fileReader.abort();
    file.uploading && file.xhr.abort();
    files.splice(index, 1);
    this.selectedFiles = [];
    setTimeout(() => this.selectedFiles = [...files]);
  }

  retryUpload(index: number): void {
    const file = this.selectedFiles[index];

    // file.loadStatus < 100 && file.fileReader.readAsDataURL(file);
    this.isLoadingAborted && this.uploadFile(file);
  }

  isLoadingAborted(file): boolean {
    return file.uploadEnded && file.loadStatus !== 100;
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
        this.isAcceptedFileType(item) && this.isPassedFileSize(item) && filesArray.push(item);
      }
      if (this.maxFiles > 0 && filesArray.length > diff) {
        filesArray.length = diff;
      }
      filesArray.forEach((file, i) => {
        file.elemId = 'file' + i + Date.now();
      });
      setTimeout(() => this.selectedFiles = [...lastSelectedFiles, ...filesArray]);
      filesArray.forEach(file => this.readFile(file));
    }
  }

  private isAcceptedFileType(file): boolean {
    if (!this.accept) {
      return true;
    }

    const fileName = file.name.match(/\.[^\.]*$|$/)[0];
    const template = new RegExp('^(' + this.accept.replace(/[, ]+/g, '|').replace(/\/\*/g, '/.*') + ')$', 'i');

    return template.test(file.type) || template.test(fileName);
  }

  private isPassedFileSize(file): boolean {
    return !this.maxFileSize || file.size <= this.maxFileSize;
  }

  private toggleRetryBtn(file): void {
    const retryBtn = this.el.querySelector('#' + file.elemId + ' .scb-file-retry-btn') as HTMLElement;
    const isAborted = this.isLoadingAborted(file);

    retryBtn && retryBtn.classList.toggle('d-inline-block', isAborted);
  }

  private readFile(file): void {
    const reader = new FileReader();
    const isRequestDataPresent = this.method && this.target && this.formDataName;
    this.changeFileUploadProgress(file, 0, 'start reading');

    reader.onprogress = (e) => {
      const percentage = Math.round(e.loaded / e.total * 100);
      this.changeFileUploadProgress(file, percentage, 'reading');
    };
    reader.onloadend = () => {
      this.toggleRetryBtn(file);
    };
    reader.onload = () => {
      file.reading = false;
      file.isRead = true;
      this.changeFileUploadProgress(file, 100, 'processing');
      isRequestDataPresent && this.uploadFile(file);
    };

    file.reading = true;
    reader.readAsDataURL(file);
    file.fileReader = reader;
  }

  private uploadFile(file): void {
    if (!file.uploading) {
      // const startDate = Date.now();
      const request = new XMLHttpRequest;
      let stalledTimeout;
      let progDate;

      file.xhr = request;
      request.upload.onprogress = (e) => {
        clearTimeout(stalledTimeout);
        progDate = Date.now();
        // const diff = (progDate - startDate) / 1000;
        const loaded = e.loaded;
        const total = e.total;
        const progress = Math.round(100 * (loaded / total));
        
        file.loaded = loaded;
        file.indeterminate = 0 >= loaded || loaded >= total;
        
        if (file.error) {
          file.status = '';
          file.indeterminate = undefined;
        } else if (!file.abort) {
          if (100 > progress) {
            stalledTimeout = setTimeout(() => {
              this.changeFileUploadProgress(file, progress, 'stalled');
            }, 2000);
          } else {
            file.uploading = false;
          }

          this.changeFileUploadProgress(file, progress, 'uploading');

          /* this.dispatchEvent(new CustomEvent('upload-progress', {
             detail: {
               file: file,
               xhr: request,
             },
           }));*/
        }
      };
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          // clearTimeout(stalledTimeout);
          file.indeterminate = file.uploading = false;
          if (file.abort) {
            this.changeFileUploadProgress(file, file.loadStatus,'error');
          } else {
            this.changeFileUploadProgress(file, 100,'');
            file.udloaded = true;
            /* const uploadResponseNotCanceled = this.dispatchEvent(new CustomEvent('upload-response',{
            detail: {
              file: file,
              xhr: request,
            },
            cancelable: true,
          }));
          if (!uploadResponseNotCanceled) {
            return;
          }*/
            /*if (request.status === 0) {
              file.error = 'serverUnavailable';
            } else if (request.status >= 500) {
              file.error = 'unexpectedServerError';
            } else if (request.status >= 400) {
              file.error = 'forbidden';
              file.complete = false;
              this.dispatchEvent(new CustomEvent(`upload-${file.error ? 'error' : 'success'}`, {
                detail: {
                  file: file,
                  xhr: request,
                },
              }));
              this._notifyFileChanges(file);
            }*/
          }
        }
      };
      request.upload.onloadstart = () => {
        /*this.dispatchEvent(new CustomEvent('upload-start',{
          detail: {
            file: file,
            xhr: request,
          },
        }));
        this._notifyFileChanges(file);*/
      };
      request.upload.onloadend = () => {
        file.uploadEnded = true;
        this.toggleRetryBtn(file);
      };
      request.upload.onerror = () => {
        this.changeFileUploadProgress(file, file.loadStatus, 'error');
      };


      /*const uploadBeforeNotCanceled = this.dispatchEvent(new CustomEvent('upload-before', {
        detail: {
          file: file,
          xhr: request,
        },
        cancelable: true,
      }));
       // code below is running if uploadBefore is not canceled
      if (uploadBeforeNotCanceled) {

      }*/
      const formData = new FormData;
      file.uploadTarget = this.target || '';
      file.formDataName = this.formDataName;
      this.changeFileUploadProgress(file, 0, 'start uploading');
      formData.append(file.formDataName, file, file.name);
      request.open(this.method, file.uploadTarget, true);
      this.configureXhr(request);

      file.indeterminate = true;
      file.uploading = true;
      file.uploadEnded = false;
      file.complete = file.abort = file.error = file.held = false;

      /*const uploadRequestNotCanceled = this.dispatchEvent(new CustomEvent('upload-request', {
        detail: {
          file: file,
          xhr: request,
          formData: formData,
        },
        cancelable: true,
      }));
      uploadRequestNotCanceled && request.send(formData);*/
      request.send(formData);
    }
  }

  private configureXhr(request) {
    let headers: object;
    if (typeof this.headers === 'string') {
      try {
        headers = JSON.parse(this.headers.replace(new RegExp('\'', 'g'), '\"'));
      } catch (error) {
        headers = undefined;
      }
    }
    for (const header in headers) {
      request.setRequestHeader(header, headers[header]);
    }

    this.timeout && (request.timeout = this.timeout);
  }

  private changeFileUploadProgress(file, loadedPercentage: number, status: string) {
    const prBar = this.el.querySelector('#' + file.elemId + ' .progress-bar') as HTMLElement;
    const statusBar = this.el.querySelector('#' + file.elemId + ' .scb-file-status') as HTMLElement;

    file.loadStatus = loadedPercentage;
    file.status = status;
    prBar && (prBar.style.width = loadedPercentage + '%');
    statusBar && (statusBar.innerHTML = file.status || '');
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
    if (this.accept) {
      inputAttrs['accept'] = this.accept;
    }

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
                  'd-inline-block': this.isLoadingAborted(file),
                }} onClick={() => this.retryUpload(i)}>
                  <span class="scb-icon icon-reload"></span>
                </button>
                <button class="icon-btn close" onClick={() => this.removeFile(i)}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </div>
            <div class="scb-file-status">{file.status}</div>
            <div class="progress">
              <div class={{
                'progress-bar': true,
                [`bg-${this.type}`]: true,
              }} style={{ width: file.loadStatus + '%' }} role="progressbar" aria-valuenow="0"
                   aria-valuemin="0" aria-valuemax="100">
              </div>
            </div>
          </div>,
        )}
      </div>
    );
  }
}
