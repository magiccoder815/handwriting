import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000"; // FastAPI backend URL

export const predictNumber = async (imageBase64) => {
    console.log("base64 image", imageBase64);

    const response = await axios.post(`${BASE_URL}/predict`, {
        image: imageBase64,
    });
    return response.data;
};
