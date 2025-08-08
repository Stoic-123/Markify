import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import PhotoCameraBackIcon from "@mui/icons-material/PhotoCameraBack";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { message, Upload } from "antd";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Input } from "antd";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ImageIcon from "@mui/icons-material/Image";
import Button from "@mui/material/Button";
import axios from "axios";
import Swal from "sweetalert2";
import "./App.css";
const { TextArea } = Input;
const { Dragger } = Upload;

const App = () => {
  const [preview, setPreview] = React.useState(null);
  const [selectInputImage, setSelectInputImage] = React.useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = React.useState(false);
  const [textValue, setTextValue] = React.useState("");
  const [isFormValid, setIsFormValid] = React.useState(false);
  const [isDownloadBtn, setIsDownloadBtn] = React.useState(true);
  const [imageFile, setImageFile] = React.useState(null);
  const [logoFile, setLogoFile] = React.useState(null);
  const [logoFileList, setLogoFileList] = React.useState([]);
  const [inputImageFileList, setInputImageFileList] = React.useState([]);
  const [value, setValue] = React.useState("1");

  const handleSelectFile = ({ fileList }) => {
    setLogoFileList(fileList);
    setSelectedLogoFile(fileList.length > 0);
    if (fileList.length > 0) {
      setLogoFile(fileList[0].originFileObj);
    } else {
      setLogoFile(null);
    }
  };
  const handleSelectInputImageFile = ({ fileList }) => {
    setInputImageFileList(fileList);
    setSelectInputImage(fileList.length > 0);
    if (fileList.length > 0) {
      setImageFile(fileList[0].originFileObj);
      setPreview(URL.createObjectURL(fileList[0].originFileObj));
    } else {
      setImageFile(null);
      setPreview(null);
    }
  };
  const handleTextValue = (e) => {
    setTextValue(e.target.value);
  };

  useEffect(() => {
    if (selectInputImage) {
      setIsFormValid(selectedLogoFile || textValue.trim() !== "");
    } else {
      setIsFormValid(false);
    }
  }, [selectInputImage, selectedLogoFile, textValue]);
  const generateWaterMark = async () => {
    try {
      const formData = new FormData();
      formData.append("inputImage", imageFile);
      if (textValue) {
        formData.append("waterMarkText", textValue);
      } else {
        formData.append("logoImage", logoFile);
      }
      const res = await axios.post(
        "http://localhost:8080/generateWaterMark",
        formData
      );
      if (res.status === 200) {
        Swal.fire({
          title: "Good job!",
          text: "You clicked the button!",
          icon: "success",
        });
        setIsDownloadBtn(false);
        setIsFormValid(true);
        setTextValue("");
        setLogoFileList([]);
        setInputImageFileList([]);
        setPreview(`http://localhost:8080${res.data.outputImageUrl}`);
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Oops!",
        text: "Something went wrong.",
        icon: "error",
      });
    }
  };
  const handleDownload = async () => {
    try {
      const response = await axios.get(preview, {
        responseType: "blob",
      });

      const blob = response.data;

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "watermarked-image.jpg";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);
      window.location.reload();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const imageUploadProps = {
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    accept: "image/*",
    beforeUpload: (file) => {
      setPreview(URL.createObjectURL(file));
      return false; // prevent upload
    },
    onDrop: (e) => {
      const file = e.dataTransfer.files[0];
      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    },
  };
  const propsLogo = {
    multiple: false,
    accept: "image/png",
    beforeUpload: (file) => {
      const isPng = file.type === "image/png";
      if (!isPng) {
        message.error("Only PNG files are allowed!");
        return Upload.LIST_IGNORE; // Prevent upload
      }
      return false; // Block automatic upload
    },
    onDrop: (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type === "image/png") {
        console.log("Dropped PNG logo:", file);
      } else {
        message.error("Only PNG files are allowed!");
      }
    },
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <div className="container pb-5">
      <div className="mt-4 d-flex align-items-center justify-content-center text-center  text-uppercase ">
        <img
          style={{
            width: "80px",
            height: "80px",
            objectFit: "cover",
          }}
          src="./assets/image/logo.png"
          alt=""
        />
        <h1
          style={{
            color: "#7886C7",
          }}
        >
          Markify
        </h1>
      </div>
      <div>
        <p className="mb-0 text-center text-secondary fs-5">
          ដាក់ watermark លើរូបភាព
        </p>
      </div>
      <div className="row gy-4 mt-5">
        <div className="col-12 col-md-6">
          <div className="col-12">
            <div
              className="card p-4 "
              style={{
                border: "2px dashed #A9B5DF",
              }}
            >
              <div>
                <div className="d-flex align-items-center">
                  <PhotoCameraBackIcon />
                  <p className="ms-2 mb-0 fw-medium fs-5">ជ្រើសរូបភាព</p>
                </div>
                <p className="mb-0 text-secondary mt-1">
                  ជ្រើសរូបភាពដែលចង់បន្ថែម​ Watermark
                </p>
              </div>
              <div className="my-3">
                <Dragger
                  fileList={inputImageFileList}
                  onChange={handleSelectInputImageFile}
                  name="inputImage"
                  style={{
                    padding: "20px",
                  }}
                  {...imageUploadProps}
                >
                  <p className="ant-upload-drag-icon">
                    <FileUploadIcon
                      fontSize="large"
                      sx={{ fontSize: "70px", color: "#99A1AF" }}
                    />
                  </p>
                  <p className="ant-upload-text">ចុច ឬអូសរូបភាពមកទីនេះ</p>
                  <p className="ant-upload-hint">JPG, PNG ត្រឹម 10MB</p>
                </Dragger>
              </div>
            </div>
          </div>
          <div className="col-12 mt-4">
            <div className="card p-4">
              <div>
                <p className="mb-0 fs-5 fw-medium">ជម្រើស Watermark</p>
                <p className="mb-0 mt-1 text-secondary">
                  ជ្រើសរវាងអក្សរ ឬ ឡូហ្គោ
                </p>
              </div>
              <div className="mt-3">
                <Box sx={{ width: "100%", typography: "body1" }}>
                  <TabContext value={value}>
                    <Box>
                      <TabList
                        sx={{
                          borderBottom: 0,
                          backgroundColor: "#F5F5F5",
                          borderRadius: "9px",
                          padding: "5px",
                          minHeight: "25px",
                        }}
                        variant="fullWidth"
                        TabIndicatorProps={{
                          style: { display: "none" },
                        }}
                        onChange={handleChange}
                        aria-label="lab API tabs example"
                      >
                        <Tab
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              <TextFieldsIcon />
                              <span>អក្សរ</span>
                            </Box>
                          }
                          sx={{
                            textTransform: "none",
                            fontWeight: "bold",
                            paddingY: "5px",
                            color: "#333",
                            minHeight: "25px",
                            "&.Mui-selected": {
                              backgroundColor: "#FFFFFFFF",
                              color: "black",
                              borderRadius: "6px",
                              transition: ".1s ease-in-out",
                            },
                          }}
                          value="1"
                        />
                        <Tab
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              <ImageIcon />
                              <span>ឡូហ្គោ</span>
                            </Box>
                          }
                          sx={{
                            textTransform: "none", // Keep label casing
                            fontWeight: "bold",
                            paddingY: "5px",
                            color: "#333",
                            minHeight: "25px",
                            transition: "all 0.2s ease-in-out", // Smooth transitions for hover/select
                            "&.Mui-selected": {
                              backgroundColor: "#fff",
                              color: "black",
                              borderRadius: "6px",
                            },
                          }}
                          value="2"
                        />
                      </TabList>
                    </Box>
                    <TabPanel sx={{ padding: "10px 0" }} value="1">
                      <div>
                        <label
                          className="fw-medium"
                          style={{
                            fontSize: "14px",
                          }}
                          htmlFor="text"
                        >
                          អក្សរសម្រាប់ Watermark{" "}
                        </label>
                        <TextArea
                          type="text"
                          onChange={handleTextValue}
                          id="text"
                          rows={4}
                          placeholder="ច្រើនបំផុត 25 តួ"
                          maxLength={25}
                          value={textValue}
                        />
                      </div>
                    </TabPanel>
                    <TabPanel
                      sx={{
                        padding: "11px 0",
                      }}
                      value="2"
                    >
                      <div>
                        <Dragger
                          onChange={handleSelectFile}
                          multiple={false}
                          fileList={logoFileList}
                          accept="image/*"
                          name="logoImage"
                          maxCount={1}
                          {...propsLogo}
                        >
                          <p className="ant-upload-drag-icon">
                            <FileUploadIcon
                              fontSize="large"
                              sx={{ fontSize: "40px", color: "#99A1AF" }}
                            />
                          </p>
                          <p className="ant-upload-text">
                            ចុច ឬអូសរូបភាពមកទីនេះ
                          </p>
                          <p className="ant-upload-hint">JPG, PNG ត្រឹម 10MB</p>
                        </Dragger>
                      </div>
                    </TabPanel>
                  </TabContext>
                </Box>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 ">
          <div className="card p-4">
            <div>
              <p className="mb-0 fs-5 fw-medium">
                មើលរូបភាពបន្ទាប់ពីដាក់​ Watermark
              </p>
              <p className="mb-0 mt-1 text-secondary">
                មើលរូបភាពបន្ទាប់ពីដាក់ watermark{" "}
              </p>
            </div>
            <div
              className="my-3 d-flex justify-content-center align-items-center"
              style={{
                height: "450px",
                backgroundColor: "#F3F4F6",
                borderRadius: "6px",
              }}
            >
              {preview === null ? (
                <div className="text-center">
                  <div>
                    <PhotoCameraBackIcon
                      sx={{
                        fontSize: "70px",
                        color: "#AEB3BC",
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="mb-0 text-secondary"
                      style={{
                        fontSize: "17px",
                      }}
                    >
                      ផ្ទុករូបភាពមកមើលសាកល្បង{" "}
                    </p>
                  </div>
                </div>
              ) : (
                <img
                  src={preview}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={generateWaterMark}
              disabled={!isFormValid}
              sx={{
                backgroundColor: "#2D336B",
                textTransform: "none",
                padding: "10px 0",
              }}
              fullWidth
              variant="contained"
            >
              ដាក់ Watermark{" "}
            </Button>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleDownload}
              disabled={isDownloadBtn}
              sx={{
                backgroundColor: "#7886C7",
                textTransform: "none",
                padding: "10px 0",
              }}
              fullWidth
              variant="contained"
            >
              ទាញយករូបភាព{" "}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
