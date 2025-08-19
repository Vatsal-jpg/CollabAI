
import React, { useState,useEffect,useContext,useRef} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { intializeSocket,recieveMessage,sendMessage } from '../config/socket'
import { UserContext } from '../context/User.context'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import { getWebContainer } from '../config/webContainer'


function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)

            // hljs won't reprocess the element unless this attribute is removed
            ref.current.removeAttribute('data-highlighted')
        }
    }, [ props.className, props.children ])

    return <code {...props} ref={ref} />
}



const Project = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useContext(UserContext)
    const [isSidePanelOpen, setisSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState([])
    const [users, setUsers] = useState([])
    const[project, setProject] = useState(location.state.project)
    const [message, setMessage] = useState('');
    const messageBoxRef = useRef(null);

    const [messages,setMessages]=useState([])
    const [fileTree, setFileTree] = useState({})   // ✅ start as empty object


  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)
    

  const handleUserSelect = (id) => {
    setSelectedUserId(prevSelectedId=>{
        const newSelectedId= new Set(prevSelectedId)
        if(newSelectedId.has(id)){
            newSelectedId.delete(id)
        } else{
            newSelectedId.add(id)
        }
        return newSelectedId
    })
  }

  
  function AddCollaborator() {

    axios.put('/projects/add-user', {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId)
    }).then((res)=>{
        console.log(res.data)
        setIsModalOpen(false)
        
    }).catch((err)=>{
        console.error(err)
    })
  }

  function send(){
     const messageData = {
        message,
        sender: user
    };
    sendMessage('project-message', messageData);
    setMessages(prev => [...prev, messageData]);
    setMessage('') // Clear the input field after sending the message
  }

  function WriteAiMsg(message){
      return (
      <div className='overflow-auto bg-slate-950 text-white rounded-sm p-2'>
            <Markdown
                options={{
                        overrides: {
                                code: { component: SyntaxHighlightedCode },
                                },
                            }}
                        >
                {message}
            </Markdown>
        </div>
      )                     
  }



  useEffect(()=>{

    intializeSocket(project._id)

    if(!webContainer){
        getWebContainer().then(container=>{
            setWebContainer(container)
            console.log("container started")
        })
    }

    function cleanJSONResponse(str) {
        return str.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "").trim();
    }

    recieveMessage('project-message', (data) => {
        const cleaned = cleanJSONResponse(data.message);

        let messageContent;
        if (data.sender._id === 'ai') {
            // AI messages are JSON
            try {
                messageContent = JSON.parse(cleaned);
            } catch (err) {
                console.error("Failed to parse AI JSON:", err, cleaned);
                messageContent = { text: cleaned };
            }
        } else {
            // Normal messages are plain text
            messageContent = { text: cleaned };
        }

        // Mount fileTree if present
        if (messageContent.fileTree) {
            webContainer?.mount(messageContent.fileTree);
            setFileTree(prev => ({ ...prev, ...messageContent.fileTree }));
        }

        // Update messages state
        setMessages(prev => [...prev, { ...data, message: messageContent.text }]);
    });


    axios.get(`/projects/get-project/${location.state.project._id}`).then((res)=>{
        setProject(res.data.project)

        // ✅ if fileTree is null, fallback to empty object
        setFileTree(res.data.project.fileTree || {})
    })

    axios.get('/users/all').then((res)=>{
        setUsers(res.data.users)
    }).catch((err)=>{
        console.error(err)
    })
  },[])

  useEffect(() => {
  if (messageBoxRef.current) {
    messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
  }
  }, [messages]);

  function saveFileTree(ft){
    axios.put('/projects/update-file-tree',{
        projectId:project._id,
        fileTree:ft
    }).then(res=>{
        console.log(res.data)
    }).catch(err=>{
        console.log(err)
    })
  }


function scrollToBottom() {
    messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
}
 

return (
    <main className="h-screen w-screen flex">
        <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
            <header className="flex justify-between items-center absolute top-0  p-2 px-4 w-full bg-slate-100 z-10">
                <button
                    className="flex gap-2"
                    onClick={() =>{ console.log('clicked'); setIsModalOpen(true)}}
                >
                    <i className="ri-add-large-fill"></i>
                    <p>Add Collaborator</p>
                </button>
                <button
                    onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
                    className="p-2"
                >
                    <i className="ri-group-fill"></i>
                </button>
            </header>

            <div className="converasation-area pt-14 pb-10 h-full relative flex-grow flex flex-col">
              <div
                ref={messageBoxRef}
                 className="message-box p-1 flex-grow flex-col flex gap-1 overflow-auto max-h-full"
                >
                   {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`max-w-54 message flex flex-col p-2 bg-slate-50 w-fit rounded-md ${
                            msg.sender._id === "ai" ? 'max-w-80':' max-w-52' 
                            } ${msg.sender._id==user._id.toString() && 'ml-auto'}`}
                        >
                            <small className="opacity-65 text-xs">
                            {msg.sender?.email?.split('@')[0]}
                            </small>
                            <div className="text-sm">
                            {msg.sender._id === "ai" ? 
                              WriteAiMsg(msg.message): 
                                msg.message
                            }
                            </div>
                        </div>
                        ))}

                </div>

                <div className="inputField w-full absolute bottom-0 flex">
                    <input
                        className="p-2 ml-auto px-4 outline-none bg-white border border-none flex-grow "
                        type="text"
                        placeholder="Enter message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                    onClick={send}
                    className="bg-slate-950 text-white">
                        <i className="px-5 ri-send-plane-fill"></i>
                    </button>
                </div>
            </div>

            <div
                className={`sidePanel w-full h-full transition-all flex flex-col gap-2 bg-slate-50 top-0 absolute ${
                    isSidePanelOpen ? '-translate-x-0' : '-translate-x-full'
                }`}
            >
                <header className="flex justify-between  items-center p-2 px-3 bg-slate-300">
                    <h1 className='font-semibold text-lg'>Collaborators</h1>
                    <button
                        onClick={() => setisSidePanelOpen(false)}
                        className="p-2"
                    >
                        <i className="ri-close-line"></i>
                    </button>
                </header>

               <div className="users flex flex-col gap-2">
                 {project.users?.map(user => (
                <div
                key={user._id}
                className="user flex gap-2 hover:bg-slate-200 cursor-pointer items-center"
                >
                <div className="aspect-square w-fit h-fit p-5 flex items-center justify-center rounded-full bg-slate-600">
                    <i className="ri-user-3-line absolute text-white"></i>
                </div>
                <h1 className="font-normal text-lg">{user.email}</h1>
                </div>
            ))}
            </div>

             
            </div>

            
        </section>

        <section className="right bg-red-50 flex-grow h-full flex">

            <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
                <div className="file-tree w-full">
                  {fileTree && Object.keys(fileTree).length > 0 ? (   // ✅ safe guard
                    Object.keys(fileTree).map((file,index)=>(
                          <button 
                          key={index}
                          onClick={()=>{
                            setCurrentFile(file)
                            setOpenFiles([...new Set([...openFiles,file])])
                        }}
                          className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full">
                        <p className='font-semibold text-lg'>{file}</p>
                    </button>
                    ))
                  ) : (
                    <p className="p-2 text-gray-500 italic">No files in this project yet</p>
                  )}
                </div>
            </div>
               
                    <div className="code-editor flex flex-col flex-grow h-full">
                        <div className="top flex justify-between w-full">
                            <div className="files flex ">

                            
                           {
                                openFiles.map((file, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentFile(file)}
                                        className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${currentFile === file ? 'bg-slate-400' : ''}`}>
                                        <p
                                            className='font-semibold text-lg'
                                        >{file}</p>
                                    </button>
                                ))
                            }
                            </div>
                            <div className="actions flex gap-2">
                                <button
                                onClick={async()=>{
                                    await webContainer.mount(fileTree);

                                   const installProcess = await webContainer.spawn("npm",["install"])
                                   installProcess.output.pipeTo(new WritableStream({
                                    write(chunk){
                                        console.log(chunk);
                                    }
                                   }))

                                   if(runProcess){
                                    runProcess.kill()
                                   }

                                   let tempRunProcess = await webContainer.spawn("npm",["start"])
                                   tempRunProcess.output.pipeTo(new WritableStream({
                                    write(chunk){
                                        console.log(chunk);
                                    }
                                   }))

                                   setRunProcess(tempRunProcess)

                                   webContainer.on('server-ready',(port,url)=>{
                                    console.log(port,url)
                                    setIframeUrl(url)
                                   })

                                }}
                                className='p-2 px-4 bg-slate-600 text-white'
                                >
                                    run
                                </button>
                            </div>
                        </div>
                        <div className="bottom flex flex-grow">
                            {
                                 fileTree && fileTree[currentFile] && (   // ✅ safe check
                                <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                                    <pre
                                        className="hljs h-full">
                                        <code
                                            className="hljs h-full outline-none"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const updatedContent = e.target.innerText;
                                               const ft = {
                                                    ...fileTree,
                                                    [ currentFile ]: {
                                                        file: {
                                                            contents: updatedContent
                                                        }
                                                    }
                                                }
                                                setFileTree(ft)
                                                saveFileTree(ft)
                                            }}
                                            dangerouslySetInnerHTML={{
                                            __html: hljs.highlight(fileTree[currentFile].file?.contents, { language: 'javascript' }).value
                                            }}

                                            style={{
                                                whiteSpace: 'pre-wrap',
                                                paddingBottom: '25rem',
                                                counterSet: 'line-numbering',
                                            }}
                                        />
                                    </pre>
                                </div>
                            )
                            }
                        </div>
                   
                    </div>
                {iframeUrl && webContainer && 
                (
                    <div className='flex flex-col min-w-96 h-full'>
                        <div className="address-bar">
                            <input type="text" 
                                onChange={(e)=>setIframeUrl(e.target.value)}
                                value={iframeUrl} className='w-full p-2 px-4 bg-slate-200'
                            />
                        </div>
                        <iframe src={iframeUrl} className='w-full h-full'></iframe>

                    </div>
                )
                }
        </section>

        {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-60">
                        <div className="bg-white  rounded-lg shadow-lg w-full max-w-md mx-4 p-6 relative">
                        <div className="flex justify-between items-center mb-4 ">
                            <h3 className="text-lg font-semibold">Select a User</h3>
                            <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                            >
                            <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>
                        <ul className="space-y-2 pb-16 max-h-96 overflow-auto">
                            {users.map((user) => (
                            <li
                                key={user._id}
                                className={`flex items-center border border-gray-2 justify-center gap-3 p-3 rounded cursor-pointer transition hover:bg-blue-100 
                                ${Array.from(selectedUserId).indexOf(user._id)!=-1 ? 'bg-slate-200' : ''}
                                `}
                                onClick={() => handleUserSelect(user._id)}
                            >
                               
                                <div>
                                
                                <div className=" w-full  flex gap-2 font-semibold">{user.email}</div>
                                </div>
                            </li>
                            ))}
                        </ul>
                        <button
                        onClick={AddCollaborator}
                            className="absolute left-40 bottom-2 px-2  bg-blue-600 text-white py-3 rounded-sm font-semibold"
                            style={{}}
                        >
                            Add Collaborator
                        </button>
                    </div>
                 
                </div>
            )}
    </main>
)
}

export default Project





