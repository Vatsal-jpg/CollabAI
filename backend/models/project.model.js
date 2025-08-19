import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        unique: [true, 'Project name must be unique'],
        lowercase: true
    },
    users:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
],
fileTree:{
    type:Object,
    default:{}
}
   
})

const Project =mongoose.model('project', ProductSchema)
export default Project