import { getAuth } from "firebase/auth";
import { url } from "inspector";

export const uploadImage = async (file: File, path: string) => {
  try {
    if (!file) {
      return { result: "No image selected", success: false };
    }

    // Check if the file is an image
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
    ];

    if (!validImageTypes.includes(file.type)) {
      return {
        result: "Only image files are allowed (JPEG, PNG, GIF, WEBP, SVG, BMP)",
        success: false,
      };
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];

    if (!extension || !validExtensions.includes(extension)) {
      return {
        result: "Invalid file extension. Please upload a valid image file",
        success: false,
      };
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return {
        result: "You must be logged in to upload images",
        success: false,
      };
    }

    const idToken = await user.getIdToken();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { result: errorData.error, success: false };
    }

    const data = await response.json();
    return { result: data, success: true, url: data.url };
  } catch (error) {
    return { result: error, success: false };
  }
};
