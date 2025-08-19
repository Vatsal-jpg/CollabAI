
import mongoose from "mongoose";
import projectModel  from "../models/project.model.js";
import User from "../models/user.model.js";

export const createProject = async ({
    name,userId
})=>{
    if (!userId) {
        throw new Error("User ID is required to create a project.");
    }
    if (!name) {
        throw new Error("Name is required to create a project.");
    }
    const project = new projectModel({
        name,
        users: [userId]
    });
    return await project.save();
}

export const getAllProjects = async (userId) => {
    if (!userId) {
        throw new Error("User ID is required to fetch projects.");
    }
    
    const allUsersProject = await projectModel.find({
        users: userId
    })

    return allUsersProject;
}

export const addUsersToProject = async ({ projectId, users,userId }) => {
    if (!projectId) {
        throw new Error("Project ID is required to add users.");
    }
    if (!users) {
        throw new Error("Users must be a non-empty array.");
    }
    if(!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid Project ID.");
    }

    if(!Array.isArray(users) || users.some(userId=> !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId in users array");
    }

    if (!userId) {
        throw new Error("User ID is required to add users to a project.");
    }
    if(!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid User ID.");
    }

    const project = await projectModel.findOne({ _id: projectId,users: userId });
    if (!project) {
        throw new Error("User doesnt belongs to this project");
    }

    const updatedProject = await projectModel.findByIdAndUpdate({
        _id: projectId
    }, {
        $addToSet: { users: { $each: users } }
    }, {
        new: true
    })
    return updatedProject
}

export const getProjectById = async ({projectId}) => {
    if (!projectId) {
        throw new Error("Project ID is required to fetch project details.");
    }
    if(!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid Project ID.");
    }

    const project = await projectModel.findOne({_id: projectId}).populate('users');
    if (!project) {
        throw new Error("Project not found.");
    }
    
    return project;
}

export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}