import axios from "axios";

export const imageUpload = async (imageData: Blob) => {
  const formData = new FormData();
  formData.append("image", imageData);

  const { data } = await axios.post(
    `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMAGE_HOSTING_KEY}`,
    formData
  );

  return data.data.url;
};

export const imageUploadMessenger = async (
  imageData: Blob,
  onProgress?: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append("image", imageData);

  const { data } = await axios.post(
    `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMAGE_HOSTING_KEY_FOR_MASSENGER}`,
    formData,
    {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    }
  );

  return data.data.url;
};

// export const imageUploadSecond = async(imageData: string | Blob)=>{
//     const formData = new FormData()
//     formData.append('image', imageData)
//     const {data} = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_NODE_API_URL}`, formData);
//     return data.data.url
// }