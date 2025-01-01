import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises'; // Use the promise-based fs module

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Corrected the environment variable
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error("No file path provided");

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("File uploaded successfully:", response.url);
        return response;
    } catch (error) {
        console.error("Error during upload:", error.message);
        
        try {
            await fs.unlink(localFilePath);
        } catch (unlinkError) {
            console.error("Error deleting temporary file:", unlinkError.message);
        }

        return "Failed to upload...!";
    }
};

export { uploadOnCloudinary };
