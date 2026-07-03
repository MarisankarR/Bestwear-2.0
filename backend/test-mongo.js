import 'dotenv/config'
import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'PROJECT'

if (!uri) {
  console.error('MONGODB_URI not set in .env')
  process.exit(1)
}

const connectionUri = uri.includes('?')
  ? uri.replace(/\/?\?/, `/${dbName}?`)
  : `${uri}/${dbName}`

console.log('Testing MongoDB connection to:', connectionUri)

mongoose.connect(connectionUri, { connectTimeoutMS: 10000 })
  .then(() => {
    console.log('MongoDB connection successful')
    return mongoose.disconnect()
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message || err)
    process.exit(1)
  })
