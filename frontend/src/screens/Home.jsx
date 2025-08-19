import React,{useContext,useState,useEffect} from 'react'
import { UserContext } from '../context/User.context'
import axios from '../config/axios'
import { use } from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {

  const { user } = useContext(UserContext)
  const navigate = useNavigate();

  const[isModalOpen, setisModalOpen] = useState(false)
  const[projectName,setProjectName]= useState(null)
  const[projects,setProjects] = useState([])

  function createProject(e){
    e.preventDefault();
    console.log({projectName});

    axios.post('/projects/create', { 
      name: projectName 
    }).then((res)=>{
        console.log(res)
        setisModalOpen(false);
    }).catch((err)=>{
        console.error("Error creating project:", err);
    })
  }

useEffect(() => {
  axios.get('/projects/all')
    .then((res) => {
      setProjects(res.data.projects);
    })
    .catch((err) => {
      console.error("Error fetching projects:", err);
    });
}, []);



  return (
    <main className='p-4'>
      <div className="projects flex flex-wrap gap-3">

        <button 
        onClick={() => setisModalOpen(true)}
        className="project p-4 border border-slate-300 rounded-md">
          New Project
          <i className="ri-link ml-2"></i>
        </button>

        {
          projects.map((project)=>(
            <div key={project._id}
              onClick={()=> navigate(`/project/`,{
                state:{project}
              })}
            className="project flex flex-col gap-2 cursor-pointer p-4 border border-slate-300 rounded-md min-w-50 hover:bg-slate-200">
              <h2 className='font-semibold'>
                {project.name}
              </h2>
              <div className='flex gap-2'>
                <p><i className="ri-user-3-line"></i> <small>Collaborators:</small></p>
                {project.users?.length}
              </div>
            </div>
          ))
        }

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-30 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form
              onSubmit={createProject}
            >
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
              onChange={(e)=> setProjectName(e.target.value)}
              value={projectName}
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setisModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </main>
  )
}

export default Home