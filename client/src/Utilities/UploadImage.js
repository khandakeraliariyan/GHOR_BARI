export const uploadImageToImgBB = async (imageFile) => {
    const apiKey = import.meta.env.VITE_IMGBB_KEY;
    const formData = new FormData();
    formData.append("image", imageFile);

    const url = `https://api.imgbb.com/1/upload?key=${apiKey}`;

    const res = await fetch(url, {
        method: "POST",
        body: formData,
    });

    const data = await res.json();

    if (data.success) {
        return data.data.url;
    } else {
        throw new Error("Image upload failed");
    }
};
