import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

function getCloudinaryCredentials() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET;
  return { cloudName, apiKey, apiSecret, uploadPreset };
}

export const isCloudinaryConfigured = (): boolean => {
  const { cloudName, apiKey, apiSecret, uploadPreset } = getCloudinaryCredentials();
  return Boolean(cloudName && ((apiKey && apiSecret) || uploadPreset));
};

export async function uploadImageToCloudinary(
  buffer: Buffer,
  folder = 'after-bells/avatars'
): Promise<UploadApiResponse> {
  const { cloudName, apiKey, apiSecret, uploadPreset } = getCloudinaryCredentials();

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not set in environment variables.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    ...(apiKey && apiSecret && { api_key: apiKey, api_secret: apiSecret }),
    secure: true,
  });

  const base64Data = `data:image/jpeg;base64,${buffer.toString('base64')}`;

  let result: UploadApiResponse;

  if (uploadPreset) {
    // Unsigned Upload using Upload Preset
    result = await cloudinary.uploader.unsigned_upload(base64Data, uploadPreset, {
      folder,
    });
  } else {
    // Signed Direct API Upload
    result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'image',
    });
  }

  // Inject CDN face-crop and auto-format transformation into the secure URL
  if (result && result.secure_url && result.secure_url.includes('/upload/')) {
    result.secure_url = result.secure_url.replace(
      '/upload/',
      '/upload/c_fill,g_face,w_400,h_400,f_auto,q_auto/'
    );
  }

  return result;
}
