import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { file, userId, fileName } = req.body;

    // Upload to Cloudinary with 15-day expiration
    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
      folder: `slimifypdf/users/${userId}`,
      public_id: fileName,
      expires_at: Math.floor(Date.now() / 1000) + (15 * 24 * 60 * 60), // 15 days
      transformation: [
        { quality: 'auto:good' } // Optimize file size
      ]
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      size: result.bytes,
      format: result.format
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
} 