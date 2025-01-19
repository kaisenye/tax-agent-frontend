const template = document.createElement('template');
template.innerHTML = `
  <iframe frameborder="0" 
    width="100%" 
    height="100%">
  </iframe>
`;

class PdfViewer extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ['src'];
  }

  connectedCallback() {
    this.updateIframeSrc();
  }

  attributeChangedCallback(name) {
    if (['src', 'viewerPath'].includes(name)) {
      this.updateIframeSrc();
    }
  }

  updateIframeSrc() {
    const pdfUrl = encodeURIComponent(this.getAttribute('src'));
    this.shadowRoot?.querySelector('iframe')?.setAttribute(
      'src',
      `https://mozilla.github.io/pdf.js/web/viewer.html?file=${pdfUrl}`
    );
  }
}

customElements.define('pdf-viewer', PdfViewer);