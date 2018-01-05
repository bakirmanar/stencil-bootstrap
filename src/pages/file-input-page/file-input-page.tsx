import { Component } from '@stencil/core';

@Component({
  tag: 'file-input-page',
})
export class FileInputPage {
  render() {
    return (
      <div class="container">
        <h2>Basic usage</h2>
        <scb-file-input class="mb-0"></scb-file-input>
        <code class="mb-3 d-block p-3">&lt;scb-file-input&gt;&lt;/scb-file-input&gt;</code>

        <h2>Bootstrap styles</h2>
        <scb-file-input type="info" class="mb-0"></scb-file-input>
        <code class="mb-3 d-block p-3">&lt;scb-file-input type="info"&gt;&lt;/scb-file-input&gt;</code>

        <h2>Max length</h2>
        <scb-file-input max-files="3" class="mb-0"></scb-file-input>
        <code class="mb-3 d-block p-3">&lt;scb-file-input max-files="3"&gt;&lt;/scb-file-input&gt;</code>

        <h2>No multiple</h2>
        <scb-file-input max-files="1" class="mb-0"></scb-file-input>
        <code class="mb-3 d-block p-3">&lt;scb-file-input max-files="1"&gt;&lt;/scb-file-input&gt;</code>

        <h2>No drag and drop</h2>
        <scb-file-input nodrop class="mb-0"></scb-file-input>
        <code class="mb-3 d-block p-3">&lt;scb-file-input nodrop&gt;&lt;/scb-file-input&gt;</code>

        <h2>Upload Request Properties</h2>
        <scb-file-input method="post" target="http://someurl" form-data-name="file" class="mb-0"></scb-file-input>
        <code class="mb-3 d-block p-3">
          &lt;scb-file-input method="post" target="http://someurl" form-data-name="file"&gt;&lt;/scb-file-input&gt;
        </code>

        <h2>Custom drop label</h2>
        <scb-file-input class="mb-0">
          <span slot="label">Drop your files here</span>
        </scb-file-input>
        <code class="mb-3 d-block p-3">
          <div>&lt;scb-file-input&gt;</div>
          <div class="ml-2">&lt;span slot="label"&gt;Drop your files here&lt;/span&gt;</div>
          <div>&lt;/scb-file-input&gt;</div>
        </code>

        <h2>Custom button</h2>
        <scb-file-input class="mb-0">
          <button slot="button">Select files</button>
        </scb-file-input>
        <code class="mb-3 d-block p-3">
          <div>&lt;scb-file-input&gt;</div>
          <div class="ml-2">&lt;button slot="button"&gt;Select files&lt;/button&gt;</div>
          <div>&lt;/scb-file-input&gt;</div>
        </code>

        <h2>Setting Restrictions on Files to Upload</h2>
        accept="image/*" maxFileSize="1000000"
        <scb-file-input accept="image/*" max-file-size="1000000" class="mb-0">
          <span slot="label">Drop images(up to 1 MB) here...</span>
        </scb-file-input>
        <code class="mb-3 d-block p-3">
          <div>&lt;scb-file-input accept="image/*" max-file-size="1000000"&gt;</div>
          <div class="ml-2">&lt;span slot="label"&gt;Drop images(up to 1 MB) here...&lt;/span&gt;</div>
          <div>&lt;/scb-file-input&gt;</div>
        </code>
      </div>
    );
  }
}
