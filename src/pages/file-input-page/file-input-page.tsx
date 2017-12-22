import { Component } from '@stencil/core';

@Component({
  tag: 'file-input-page',
})
export class FileInputPage {
  render() {
    return [
      <div>
        <h2>Basic usage</h2>
        <scb-file-input></scb-file-input>

        <h2>Max length</h2>
        <scb-file-input max-files="3"></scb-file-input>
      </div>
    ];
  }
}
