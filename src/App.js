import React from "react";
import AWS from "aws-sdk";
import { FaTimes } from "react-icons/fa";

import ProgressBar from "./UI/ProgressBar";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewFiles: [],
      loadedAwsFiles: [],
      filesForUpload: [],
      uploadPercentage: 0,
      loadedTotal: 0,
      loading: false,
      uploaded: false,
    };
  }

  handleDrop = (e) => {
    let dt = e.dataTransfer;
    let files = dt.files;
    this.handleFiles(files);
    this.setState({
      loadedAwsFiles: [],
      filesForUpload: [],
      previewFiles: [],
      uploaded: false,
      uploadPercentage: 0,
    });
  };

  handleClick = (e) => {
    let targetFromClick = e.target;
    let files = targetFromClick.files;
    this.handleFiles(files);
    this.setState({
      loadedAwsFiles: [],
      filesForUpload: [],
      previewFiles: [],
      uploaded: false,
      uploadPercentage: 0,
    });
  };

  handleFiles = (files) => {
    let objs = [...files];

    objs.forEach((file) => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function () {
        updatePreviewFiles(file, reader.result);
      };
      const updatePreviewFiles = (file, data) => {
        const { previewFiles } = this.state;
        this.setState({
          previewFiles: [
            ...previewFiles,
            {
              name: file.name,
              size: file.size,
              type: file.type,
              data,
            },
          ],
        });
      };
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onloadend = function () {
        updateFilesForUpload(file, fileReader.result);
      };
      const updateFilesForUpload = (file, data) => {
        const { filesForUpload } = this.state;
        this.setState({
          filesForUpload: [
            ...filesForUpload,
            {
              name: file.name,
              size: file.size,
              type: file.type,
              data,
            },
          ],
        });
      };
    });
  };

  removeFileHandler = (file) => {
    const { previewFiles, filesForUpload } = this.state;
    const previewFilesFilter = previewFiles.filter(
      (image) => image.name !== file.name
    );
    const filesForUploadFilter = filesForUpload.filter(
      (obj) => obj.name !== file.name
    );
    this.setState({
      previewFiles: previewFilesFilter,
      filesForUpload: filesForUploadFilter,
    });
  };

  uploadHandle = () => {
    const { filesForUpload } = this.state;
    const totalsize = filesForUpload.reduce((sum, value) => {
      return (sum += value.size);
    }, 0);
    const albumBucketName = "propets";
    const bucketRegion = "us-east-2";
    const IdentityPoolId = "us-east-2:70744c2d-d49f-4d02-abd9-4f4d51bce5ad";
    const albumName = "avatars";
    let uploadingProgress = [];

    AWS.config.update({
      region: bucketRegion,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId,
      }),
    });
    const promisses = filesForUpload.map((file) => {
      const fileName = file.name;
      const albumPhotosKey = encodeURIComponent(albumName) + "/";
      const photoKey = albumPhotosKey + fileName;

      const upload = new AWS.S3.ManagedUpload({
        params: {
          Bucket: albumBucketName,
          Key: photoKey,
          Body: file.data,
          ACL: "public-read",
        },
      }).on("httpUploadProgress", (event) => {
        let { loadedTotal } = this.state;
        const { loaded, key } = event;
        let workingFile = uploadingProgress.find((file) => file.name === key);
        if (workingFile !== undefined) {
          workingFile.loaded = loaded;
          const workedFiles = uploadingProgress
            .filter((file) => file.name !== key)
            .concat(workingFile);
          uploadingProgress = workedFiles;
        } else {
          workingFile = {
            name: key,
            loaded: loaded,
          };
          const workedFiles = uploadingProgress.concat(workingFile);
          uploadingProgress = workedFiles;
        }

        let uploadingSize = uploadingProgress.reduce((sum, value) => {
          return (sum += value.loaded);
        }, 0);
        const percent = Math.round((uploadingSize * 100) / totalsize);
        if (percent < 100) {
          this.setState({
            uploadPercentage: percent,
            loadedTotal,
          });
        }
      });
      const promise = upload.promise();
      return promise
        .then((data) => {
          const { loadedAwsFiles } = this.state;
          const newFiles = [...loadedAwsFiles, data.Location];
          this.setState({
            loadedAwsFiles: newFiles,
          });
        })
        .catch((err) => {
          console.log("There was an error uploading your photo: ", err.message);
        });
    });

    Promise.all(promisses).then(() => {
      const { loadedAwsFiles, filesForUpload } = this.state;
      if (loadedAwsFiles.length === filesForUpload.length) {
        this.setState({
          uploadPercentage: 0,
          uploaded: true,
          previewFiles: [],
        });
      }
    });
  };

  render() {
    const {
      previewFiles,
      loadedAwsFiles,
      uploadPercentage,
      uploaded,
    } = this.state;
    return (
      <div className="App">
        <div className="drag-section-container">
          <div className="drag-header">Drag and drop multiple files</div>
          <div
            id="drop-area"
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.handleDrop(e);
            }}
          >
            <form className="my-form">
              <p>
                Upload multiple files with the file dialog or by dragging and
                dropping images onto the dashed region
              </p>
              <input
                type="file"
                id="fileElem"
                multiple
                accept="image/*"
                onChange={this.handleClick}
              />
              <label className="button" htmlFor="fileElem">
                Select some files
              </label>
              <div id="gallery">
                {previewFiles.map((image, i) => {
                  return (
                    <div className="image-container" key={i} >
                      <img src={image.data} alt="" />
                      <div className="image-control">
                        <span
                          className="remove-btn"
                          onClick={() => this.removeFileHandler(image)}
                        >
                          <FaTimes />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </form>
          </div>
        </div>
        <div className="form-control">
          <button className="button" type="button" onClick={this.uploadHandle}>
            Upload
          </button>
        </div>
        {uploadPercentage > 0 && (
          <div className="progress-container">
            <ProgressBar percentage={uploadPercentage} />
          </div>
        )}
        {uploaded > 0 && (
          <div className="aws-gallery">
            <p>Congratulations!!! You've uploaded your photos to Amazon</p>
            <div className="aws-images">
              {loadedAwsFiles.map((image, i) => {
                return <img src={image} alt="" key={i} />;
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;
