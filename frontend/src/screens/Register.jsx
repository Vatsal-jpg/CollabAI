import React, { useState,useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/User.context'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const { setUser } = useContext(UserContext)

  function submitHandler(e){
    e.preventDefault();
  axios.post('/users/register',{
    email,
    password
  }).then((res)=>{
    console.log(res.data);

    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    
    navigate('/');
  }).catch((err)=>{
    console.log(err.response.data);
  })
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Register</h2>
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
          >
            SignUp
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-400">Already have an account? </span>
          <Link
            to="/login"
            className="text-blue-400 hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register;