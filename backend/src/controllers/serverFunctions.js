const s3 = require('../config/s3')

////////////////////////////////////////////////////////////
///// Upload to S3 /////////////////////////////////////////
////////////////////////////////////////////////////////////

const uploadToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${Date.now()}-${file.originalname}`, //Ruta dentro del bucket
    Body: file.buffer,
    ContentType: file.mimetype,
  }

  const { Location } = await s3.upload(params).promise()
  return Location // URL pública del archivo
}

const deleteFromS3 = async (url) => {
  let key = url
  try {
    const parsedUrl = new URL(url)
    key = parsedUrl.pathname.replace(/^\/+/, '')
  } catch (error) {
    key = url.replace(/^\/+/, '')
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  }
  await s3.deleteObject(params).promise()
}

module.exports = { uploadToS3, deleteFromS3 }
