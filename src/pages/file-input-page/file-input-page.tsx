import { Component } from '@stencil/core';

@Component({
  tag: 'file-input-page',
})
export class FileInputPage {
  render() {
    return [
      <div class="container">
        <h2>Basic usage</h2>
        <scb-file-input></scb-file-input>

        <h2>Max length</h2>
        max-files="3"
        <scb-file-input max-files="3"></scb-file-input>

        <h2>No multiple</h2>
        max-files="1"
        <scb-file-input max-files="1"></scb-file-input>

        <h2>No drag and drop</h2>
        nodrop
        <scb-file-input nodrop></scb-file-input>

        <h2>Custom drop label</h2>
        <scb-file-input>
          <span slot="label">Drop your files here</span>
        </scb-file-input>
      </div>
    ];
  }
}
