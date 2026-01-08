'use server'

import { v2 as cloudinary } from 'cloudinary';
import { getSession } from '@/lib/auth/auth-service';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function getCloudinarySignature() {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  const timestamp = Math.round(new Date().getTime() / 1000);

  // Determine the folder based on user (optional, keeps things tidy)
  // We'll put profile images in a 'profiles' folder
  const folder = 'edpsych-connect/profiles';

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      // transformations can be added here if needed, e.g., 'c_limit,w_500,h_500'
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder
  };
}
