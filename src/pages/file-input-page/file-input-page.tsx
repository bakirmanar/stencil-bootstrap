import { Component } from '@stencil/core';

@Component({
  tag: 'file-input-page',
})
export class FileInputPage {
  render() {
    return (
      <div class="container">
        <h2>Basic usage</h2>
        <scb-file-input></scb-file-input>

        <h2>Bootstrap styles</h2>
        type="info"
        <scb-file-input type="info"></scb-file-input>

        <h2>Max length</h2>
        max-files="3"
        <scb-file-input max-files="3"></scb-file-input>

        <h2>No multiple</h2>
        max-files="1"
        <scb-file-input max-files="1"></scb-file-input>

        <h2>No drag and drop</h2>
        nodrop
        <scb-file-input nodrop></scb-file-input>

        <h2>Upload Request Properties</h2>
        method="post" target="http://someurl" form-data-name="file"
        <scb-file-input method="post" target="http://someurl" form-data-name="file">
        </scb-file-input>

        <h2>Custom drop label</h2>
        <scb-file-input>
          <span slot="label">Drop your files here</span>
        </scb-file-input>

        <h2>Custom button</h2>
        <scb-file-input>
          <span slot="button"><button>Select files</button></span>
        </scb-file-input>

        <h2>Setting Restrictions on Files to Upload</h2>
        accept="image/*" maxFileSize="1000000"
        <scb-file-input accept="image/*" max-file-size="1000000">
          <span slot="label">Drop images(up to 1 MB) here...</span>
        </scb-file-input>
      </div>
    );
  }
}
