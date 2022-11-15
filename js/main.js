const url = "../docs/pdf.pdf";

let pdfDoc = null;
let pageNum = 1;
let pageIsRendering = false;
let pageNumIsPending = null;

const scale = 1.5;
const canvas = document.querySelector("#pdf-render");
const ctx = canvas.getContext("2d");

// Render page
const renderPage = num => {
  pageIsRendering = true;

  // get page
  pdfDoc.getPage(num)
    .then(page => {
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height
      canvas.width = viewport.width
      const renderContext = { canvasContext: ctx, viewport }
      const renderTask = page.render(renderContext);
      renderTask.promise.then(() => {
        pageIsRendering = false
        if(pageNumIsPending != null){
          renderPage(pageNumIsPending);
          pageNumIsPending = null;
        }
      });
      document.querySelector(".page-num").innerHTML = num; 
    });
}

// check for pages rendering
const queueRenderPage = num => {
  if(pageIsRendering){
    pageNumIsPending = num
  } 
  else{
    renderPage(num);
  }
}

// previous page
const showPreviousPage = () => {
  if(pageNum <= 1){
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

// next page
const showNextPage = () => {
  if(pageNum >= pdfDoc.numPages){
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

// Get document
pdfjsLib.getDocument(url)
  .promise.then(_pdfDoc => {
    pdfDoc = _pdfDoc;

    document.querySelector(".page-count").innerHTML = pdfDoc.numPages;
    renderPage(pageNum);
  })
  .catch(err => {
    // display error
    const div = document.createElement("div");
    div.className = "error";
    console.log(err);
    div.appendChild(document.createTextNode(err.message));
    document.body.insertBefore(div, canvas);
    document.querySelector("header").style.display = "none";
  });

// button events
document.querySelector(".prev-page").addEventListener("click", showPreviousPage);
document.querySelector(".next-page").addEventListener("click", showNextPage);