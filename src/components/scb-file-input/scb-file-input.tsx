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
  styleUrl: './scb-file-input.scss'
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

  /**
   * Fire hidden input click event on Button click
   */
  openFileInput(): void {
    const hiddenInput:HTMLElement = this.el.getElementsByClassName('scb-file-input-hidden')[0] as HTMLElement;
    hiddenInput.click();
  }

  /**
   * Remove the file from files list and aborting all pending actions about it
   * @param {number} index - index of a file in a list
     */
  removeFile(index: number): void {
    let files = this.selectedFiles;
    let file = files[index];

    file.reading && file.fileReader.abort();
    file.uploading && file.xhr.abort();
    files.splice(index, 1);
    this.selectedFiles = [];
    setTimeout(() => this.selectedFiles = [...files]);
  }

  /**
   * Retry the upload action for a single file
   * @param {number} index - index of a file in a list
     */
  retryUpload(index: number): void {
    const file = this.selectedFiles[index];

    // file.loadStatus < 100 && file.fileReader.readAsDataURL(file);
    this.isLoadingAborted && this.uploadFile(file);
  }

  /**
   * Check if loading of a file was aborted
   * @param {Object} file - file object
   * @returns {boolean}
     */
  isLoadingAborted(file): boolean {
    return file.uploadEnded && file.loadStatus !== 100;
  }

  @Listen('dragenter')
  /**
   * Cancel default Drag Enter event
   * @param {Object} event - dragenter event
   * @returns {boolean}
   */
  private cancelDefaultDragEnter(event): boolean {
    event.preventDefault();
    return false;
  }

  @Listen('dragover')
  /**
   * Cancel default Drag Over event
   * @param {Object} event - dragover event
   * @returns {boolean}
   */
  private cancelDefaultDragOver(event): boolean {
    event.preventDefault();
    return false;
  }

  @Listen('drop')
  /**
   * Trigger addFiles function on drop event
   * @param {Object} event - drop event
   * @returns {boolean}
   */
  private onDrop(e): boolean {
    event.preventDefault();
    if (!this.nodrop) {
      const dt = e.dataTransfer;
      this.addFiles(dt.files);
    }

    return false;
  }

  /**
   * Handle the file select event
   * @param {Object} event - Files select event
     */
  private onFileSelect(event): void {
    this.addFiles(event.target.files);
    event.target.value = '';
  }

  /**
   * Validate, add files to files list and read them
   * @param {Array} files
     */
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

  /**
   * Check if file is accepted type
   * @param {Object} file
   * @returns {boolean}
     */
  private isAcceptedFileType(file): boolean {
    if (!this.accept) {
      return true;
    }

    const fileName = file.name.match(/\.[^\.]*$|$/)[0];
    const template = new RegExp('^(' + this.accept.replace(/[, ]+/g, '|').replace(/\/\*/g, '/.*') + ')$', 'i');

    return template.test(file.type) || template.test(fileName);
  }

  /**
   * Check if file is accepted size
   * @param {Object} file
   * @returns {boolean}
     */
  private isPassedFileSize(file): boolean {
    return !this.maxFileSize || file.size <= this.maxFileSize;
  }

  /**
   * Change the Retry button state
   * @param {Object} file
     */
  private toggleRetryBtn(file): void {
    const retryBtn = this.el.querySelector('#' + file.elemId + ' .scb-file-retry-btn') as HTMLElement;
    const isAborted = this.isLoadingAborted(file);

    retryBtn && retryBtn.classList.toggle('d-inline-block', isAborted);
  }

  /**
   * Read file after add
   * @param {Object} file
     */
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

  /**
   * Upload file after read or retry button click
   * @param {Object} file
     */
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

          this.el.dispatchEvent(new CustomEvent('upload-progress', {
            detail: {
              file: file,
              xhr: request,
            },
          }));
        }
      };
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          // clearTimeout(stalledTimeout);
          file.indeterminate = file.uploading = false;
          if (file.abort) {
            this.changeFileUploadProgress(file, file.loadStatus, 'error');
          } else {
            const uploadResponseNotCanceled = this.el.dispatchEvent(new CustomEvent('upload-response', {
              detail: {
                file: file,
                xhr: request,
              },
              cancelable: true,
            }));
            if (!uploadResponseNotCanceled) {
              return;
            }
            if (request.status === 0) {
              file.error = 'serverUnavailable';
            } else if (request.status >= 500) {
              file.error = 'unexpectedServerError';
            } else if (request.status >= 400) {
              file.error = 'forbidden';
            }
            file.complete = false;
            this.el.dispatchEvent(new CustomEvent(`upload-${file.error ? 'error' : 'success'}`, {
              detail: {
                file: file,
                xhr: request,
              },
            }));
            this.changeFileUploadProgress(file, 100,'');
            file.udloaded = true;
          }
        }
      };
      request.upload.onloadstart = () => {
        this.el.dispatchEvent(new CustomEvent('upload-start',{
          detail: {
            file: file,
            xhr: request,
          },
        }));
      };
      request.upload.onloadend = () => {
        file.uploadEnded = true;
        this.toggleRetryBtn(file);
      };
      request.upload.onerror = () => {
        this.changeFileUploadProgress(file, file.loadStatus, 'error');
      };


      const uploadBeforeNotCanceled = this.el.dispatchEvent(new CustomEvent('upload-before', {
        detail: {
          file: file,
          xhr: request,
        },
        cancelable: true,
      }));
       // code below is running if uploadBefore is not canceled
      if (uploadBeforeNotCanceled) {
        return;
      }
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

      const uploadRequestNotCanceled = this.el.dispatchEvent(new CustomEvent('upload-request', {
        detail: {
          file: file,
          xhr: request,
          formData: formData,
        },
        cancelable: true,
      }));
      uploadRequestNotCanceled && request.send(formData);
      request.send(formData);
    }
  }

  /**
   * Setup the XHR Request
   * @param {Object} request - upload request
     */
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

  /**
   * Show the upload progress of a file
   * @param {Object} file
   * @param {number} loadedPercentage
   * @param {string} status
     */
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
