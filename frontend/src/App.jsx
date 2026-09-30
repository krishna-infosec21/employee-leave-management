import { useState } from 'react'

const API_URL = 'http://leaveapp-alb-99510939.ap-south-2.elb.amazonaws.com'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  const [employees, setEmployees] = useState([])
  const [leaves, setLeaves] = useState([])
  const [documents, setDocuments] = useState([])

  const [showEmployees, setShowEmployees] = useState(false)
  const [showLeaves, setShowLeaves] = useState(false)
  const [showDocuments, setShowDocuments] = useState(false)

  const [showRegister, setShowRegister] = useState(false)
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  async function login(event) {
  event.preventDefault()
  setMessage('Logging in...')

  try {
    const response = await fetch(
      `${API_URL}/api/auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        }
      }
    )

    const data = await response.json()

    console.log('LOGIN STATUS:', response.status)
    console.log('LOGIN RESPONSE:', data)

    if (!response.ok) {
      setMessage(data.detail || 'Invalid username or password')
      return
    }

    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data))

    setUser(data)
    setLoggedIn(true)
    setMessage('')
  } catch (error) {
    console.error('LOGIN ERROR:', error)
    setMessage('Unable to connect to server')
  }
}

  async function register(event) {
    event.preventDefault()
    setMessage('Registering...')

    try {
      const response = await fetch(
        API_URL + '/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: registerUsername,
            password: registerPassword,
            name: registerUsername,
            email: registerUsername + '@example.com',
            department_id: 1,
            role: 'EMPLOYEE'
          })
        }
      )

      const data = await response.json()

      if (response.ok) {
        setMessage('Registration successful! Please login.')
        setShowRegister(false)
        setUsername(registerUsername)
        setPassword('')
        setRegisterUsername('')
        setRegisterPassword('')
      } else {
        setMessage(data.detail || 'Registration failed')
      }
    } catch (error) {
      setMessage('Cannot connect to backend')
    }
  }

  async function loadEmployees() {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        API_URL + '/api/employees/',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (response.ok) {
        setEmployees(data)
        setShowEmployees(true)
        setShowLeaves(false)
        setShowDocuments(false)
        setMessage('')
      } else {
        setMessage(data.detail || 'Unable to load employees')
      }
    } catch (error) {
      setMessage('Cannot connect to backend')
    }
  }

  async function loadLeaves() {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        API_URL + '/api/leaves/',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (response.ok) {
        setLeaves(data)
        setShowLeaves(true)
        setShowEmployees(false)
        setShowDocuments(false)
        setMessage('')
      } else {
        setMessage(data.detail || 'Unable to load leave requests')
      }
    } catch (error) {
      setMessage('Cannot connect to backend')
    }
  }

  async function loadDocuments() {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        API_URL + '/api/documents/',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (response.ok) {
        setDocuments(data)
        setShowDocuments(true)
        setShowEmployees(false)
        setShowLeaves(false)
        setMessage('')
      } else {
        setMessage(data.detail || 'Unable to load documents')
      }
    } catch (error) {
      setMessage('Cannot connect to backend')
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setLoggedIn(false)
    setUser(null)
    setUsername('')
    setPassword('')
    setMessage('')
    setEmployees([])
    setLeaves([])
    setDocuments([])
    setShowEmployees(false)
    setShowLeaves(false)
    setShowDocuments(false)
  }

  if (!loggedIn) {
    if (showRegister) {
      return (
        <div className="auth-container">
          <div className="auth-card">
            <div className="brand">LeaveFlow</div>

            <h1>Create Account</h1>
            <p className="auth-subtitle">
              Register for Employee Leave Management
            </p>

            {message && (
              <div className="error-message">
                {message}
              </div>
            )}

            <form onSubmit={register}>
              <input
                type="text"
                value={registerUsername}
                onChange={(event) =>
                  setRegisterUsername(event.target.value)
                }
                placeholder="Username"
                required
              />

              <input
                type="password"
                value={registerPassword}
                onChange={(event) =>
                  setRegisterPassword(event.target.value)
                }
                placeholder="Password"
                required
              />

              <button
                type="submit"
                className="primary-btn"
              >
                Create Account
              </button>
            </form>

            <button
              className="secondary-btn"
              onClick={() => {
                setShowRegister(false)
                setMessage('')
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="brand">LeaveFlow</div>

          <h1>Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to manage employee leave requests
          </p>

          {message && (
            <div className="error-message">
              {message}
            </div>
          )}

          <form onSubmit={login}>
            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Username"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Password"
              required
            />

            <button
              type="submit"
              className="primary-btn"
            >
              Sign In
            </button>
          </form>

          <button
            className="secondary-btn"
            onClick={() => {
              setShowRegister(true)
              setMessage('')
            }}
          >
            Create New Account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          LeaveFlow
        </div>

        <div className="user-area">
          <span>
            {user?.username} · {user?.role}
          </span>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <h1>Employee Leave Management</h1>
          <p>
            Manage employees, leave requests and documents from one place.
          </p>
        </section>

        <div className="nav-grid">
          <button
            className="nav-card"
            onClick={loadEmployees}
          >
            <div style={{ fontSize: '30px' }}>👥</div>
            <h3>Employees</h3>
            <p>View employee information</p>
          </button>

          <button
            className="nav-card"
            onClick={loadLeaves}
          >
            <div style={{ fontSize: '30px' }}>📅</div>
            <h3>Leave Requests</h3>
            <p>View employee leave records</p>
          </button>

          <button
            className="nav-card"
            onClick={loadDocuments}
          >
            <div style={{ fontSize: '30px' }}>📄</div>
            <h3>Documents</h3>
            <p>View uploaded documents</p>
          </button>
        </div>

        {showEmployees && (
          <section className="data-section">
            <h2>Employees</h2>

            {employees.length === 0 ? (
              <p>No employees found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>{employee.department_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {showLeaves && (
          <section className="data-section">
            <h2>Leave Requests</h2>

            {leaves.length === 0 ? (
              <p>No leave requests found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>{leave.id}</td>
                      <td>{leave.employee_id}</td>
                      <td>{leave.leave_type_id}</td>
                      <td>{leave.from_date}</td>
                      <td>{leave.to_date}</td>
                      <td>
                        <strong>{leave.status}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {showDocuments && (
          <section className="data-section">
            <h2>Documents</h2>

            {documents.length === 0 ? (
              <p>No documents found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
<th>File Name</th>
<th>S3 Key</th>
<th>Uploaded At</th>
<th>Download</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td>{document.id}</td>
                      <td>{document.file_name}</td>
                      <td>{document.s3_key}</td>
                      <td>{document.uploaded_at}</td>
<td>
  <button
  onClick={async () => {
    const token = localStorage.getItem('token')

    const response = await fetch(
      `${API_URL}/api/documents/${document.id}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()

    if (response.ok) {
      window.open(data.download_url, '_blank')
    } else {
      alert(data.detail || 'Download failed')
    }
  }}
>
  Download
</button>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
