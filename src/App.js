import React, { useState } from 'react'


function App() {

  const [loadedFiles, setLoadedFiles] = useState([])

  
  const handleDrop = (e) => {
    let dt = e.dataTransfer
    let files = dt.files
    handleFiles(files)
  }
  
  const handleClick = (e) => {
    let targetFromClick = e.target
    let files = targetFromClick.files
    handleFiles(files)
  }

  const handleFiles = (files) => {
    ([...files]).forEach(previewFile)
  }

  const prepareForLoad = (file, data) => {
    setLoadedFiles([...loadedFiles, {
      name: file.name,
      size: file.size,
      type: file.type,
      data
    }])
  }

  const previewFile = (file) => {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function() {
      let img = document.createElement('img')
      img.src = reader.result
      document.getElementById('gallery').appendChild(img)
      prepareForLoad(file, reader.result)
    }
    
  }

  const showUploaded = () => {
    console.log(loadedFiles)
  }

  return (
    <div className="App">
      <div className="drag-section-container">
        <div className="drag-header">Drag and drop multiple files</div>
        <div 
          id="drop-area"
          onDragEnter={(e)=>{
            e.preventDefault()
            e.stopPropagation()
          }}
          onDragLeave={(e)=>{
            e.preventDefault()
            e.stopPropagation()
          }}
          onDragOver={(e)=>{
            e.preventDefault()
            e.stopPropagation()
          }}
          onDrop={(e)=>{
            e.preventDefault()
            e.stopPropagation()
            handleDrop(e)
          }}
        >
          <form className="my-form">
            <p>Upload multiple files with the file dialog or by dragging and dropping images onto the dashed region</p>
            <input type="file" id="fileElem" multiple accept="image/*" onChange={handleClick} />
            <label className="button" htmlFor="fileElem">Select some files</label>
          </form>
          <div id="gallery">
          </div>
        </div>
        </div>
        <div className="form-control">
          <div>
          <button className="button" type="button" onClick={showUploaded}>Upload</button>
          </div>
          <p>Look at console</p>
        </div>
      </div>
  );
}

export default App;
