exports.config = {
  bundles: [
    { components: ['stencil-bootstrap-demo', 'alerts-page', 'scb-alert'] },
    { components: ['badge-page', 'scb-badge'] },
    { components: ['breadcrumb-page', 'scb-breadcrumb'] },
    { components: ['file-input-page', 'scb-file-input'] },
  ],
  collections: [
    { name: '@stencil/router' }
  ]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
}
