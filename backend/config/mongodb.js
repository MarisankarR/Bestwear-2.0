import mongoose from 'mongoose'

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log('MONGODB Connected Successful')
    })

    const dbName = process.env.MONGODB_DB || 'PROJECT'
    const uri = process.env.MONGODB_URI

    if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables')
    }

    const connectionUri = uri.includes('?')
        ? uri.replace(/\/?\?/, `/${dbName}?`)
        : `${uri}/${dbName}`

    await mongoose.connect(connectionUri)
}

export default connectDB;
