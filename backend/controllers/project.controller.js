import projectModel from '../models/project.model.js';
import * as  projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import {validationResult} from 'express-validator';

export const createProject = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name } = req.body;
        const loggedINUser = await userModel.findOne({email: req.user.email});
        const userId = loggedINUser._id;

        const newProject = await projectService.createProject({ name, userId });
        res.status(201).json(newProject);

    }catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
}

export const getAllProjects = async (req, res) => {
    try {
        const loggedINUser = await userModel.findOne({email: req.user.email});
        const userId = loggedINUser._id;

        const allProjects = await projectService.getAllProjects(userId);
        res.status(200).json({ projects:allProjects});

    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
}

export const addToProject = async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const { projectId, users } = req.body;

        const loggedINUser = await userModel.findOne({email: req.user.email});
        
        const project= await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedINUser._id
        });

        return res.status(200).json({
            message: "Users added to project successfully",
            project
        });

    }catch (error) {
        console.error(error);
        res.status(400).send(error.message);

}

}

export const getProjectById = async (req, res) => {
    const { projectId } = req.params;
   try{
    const project = await projectService.getProjectById({ projectId });

    return res.status(200).json({project})
   }catch (error) {
        console.error(error);
        res.status(400).send(error.message);
   }
}

export const updateFileTree = async(req,res)=>{
      const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}