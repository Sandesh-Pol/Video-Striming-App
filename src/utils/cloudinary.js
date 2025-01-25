import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises'; // Use the promise-based fs module

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Corrected the environment variable
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        if (localFilePath.fieldname === "avatar" || localFilePath.fieldname === "coverImage") {
            const localPath = localFilePath.path;
            const response = await cloudinary.uploader.upload(localPath, {
                resource_type: "auto",
                folder: "videoweb",
                width: 150,
                crop: "scale",
            });
            await fs.unlink(localFilePath.path); // Asynchronous unlink
            return response;
        }

        // upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "videoweb",
            crop: "scale",
        });
        // file has been uploaded successfully
        await fs.unlink(localFilePath); // Asynchronous unlink
        return response;
    } catch (error) {
        if (localFilePath.fieldname === "avatar" || localFilePath.fieldname === "coverImage") {
            await fs.unlink(localFilePath.path); // Remove the temporary file if upload fails
        } else {
            await fs.unlink(localFilePath); // Remove the temporary file if upload fails
        }
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) throw new Error("No public_id provided");

        const response = await cloudinary.uploader.destroy(publicId);

        if (response.result === "ok") {
            console.log("File deleted successfully:", publicId);
            return "File deleted successfully.";
        } else {
            throw new Error(`Failed to delete file: ${response.result}`);
        }
    } catch (error) {
        console.error("Error during deletion:", error.message);
        return `Error during deletion: ${error.message}`;
    }
};

const destroyCloudVideo = async (localFilePath) => {
    try {
        const result = await cloudinary.uploader.destroy(localFilePath, { resource_type: 'video' });
        return true;
    } catch (error) {
        console.error('Error deleting video:', error);
        return false;
    }
};

const destroyCloudImage = async (localFilePath) => {
    try {
        await cloudinary.uploader.destroy(localFilePath);
        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary, destroyCloudImage, destroyCloudVideo };
