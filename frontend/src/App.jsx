import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [managerTeam, setManagerTeam] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [profile, setProfile] = useState(null);

  const [showEmployees, setShowEmployees] = useState(false);
  const [showLeaves, setShowLeaves] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showApplyLeave, setShowApplyLeave] = useState(false);
  const [showLeaveBalance, setShowLeaveBalance] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerDepartment, setRegisterDepartment] = useState("1");

  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [managerComment, setManagerComment] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser || savedUser === "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      if (!parsedUser?.role) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }

      setUser(parsedUser);
      setLoggedIn(true);
      loadRoleData(parsedUser.role);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  function authHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    };
  }

  function loadRoleData(role) {
    if (role === "ADMIN") {
      loadAdminDashboard();
      loadEmployees();
      loadLeaves();
    } else if (role === "MANAGER") {
      loadManagerTeam();
      loadLeaves();
    } else {
      loadMyProfile();
      loadLeaves();
      loadDocuments();
    }
  }

  async function login(e) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login?username=${encodeURIComponent(
          username
        )}&password=${encodeURIComponent(password)}`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Login failed.");
        return;
      }

      if (!data.access_token || !data.user_id || !data.role) {
        setMessage("Invalid login response from server.");
        return;
      }

      const loggedInUser = {
        id: data.user_id,
        username: data.username || username,
        role: String(data.role).toUpperCase(),
      };

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      setLoggedIn(true);
      setPassword("");
      setMessage("");

      loadRoleData(loggedInUser.role);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to server.");
    }
  }

  async function registerUser(e) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerUsername,
          password: registerPassword,
          name: registerName,
          email: registerEmail,
          department_id: Number(registerDepartment),
          role: "EMPLOYEE",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Registration failed. Please check the registration API."
        );
        return;
      }

      setMessage("Account created successfully. Please sign in.");
      setShowRegister(false);
      setUsername(registerUsername);
      setPassword("");
      setRegisterUsername("");
      setRegisterPassword("");
      setRegisterName("");
      setRegisterEmail("");
      setRegisterDepartment("1");
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Unable to connect to server.");
    }
  }

  async function loadAdminDashboard() {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: authHeaders(),
      });

      if (response.ok) setAdminStats(await response.json());
    } catch (error) {
      console.error("Admin dashboard error:", error);
    }
  }

  async function loadEmployees() {
    try {
      const response = await fetch(`${API_URL}/api/employees/`, {
        headers: authHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Employees error:", error);
    }
  }

  async function loadMyProfile() {
    try {
      const response = await fetch(
        `${API_URL}/api/employees/me/profile`,
        { headers: authHeaders() }
      );

      if (response.ok) setProfile(await response.json());
    } catch (error) {
      console.error("Profile error:", error);
    }
  }

  async function loadManagerTeam() {
    try {
      const response = await fetch(
        `${API_URL}/api/employees/manager/team`,
        { headers: authHeaders() }
      );

      if (response.ok) {
        const data = await response.json();
        setManagerTeam(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Manager team error:", error);
    }
  }

  async function loadLeaves() {
    try {
      const response = await fetch(`${API_URL}/api/leaves/`, {
        headers: authHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setLeaves(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Leaves error:", error);
    }
  }

  async function loadDocuments() {
    try {
      const response = await fetch(`${API_URL}/api/documents/`, {
        headers: authHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Documents error:", error);
    }
  }

  async function approveLeave(id) {
    await updateLeaveStatus(id, "approve");
  }

  async function rejectLeave(id) {
    await updateLeaveStatus(id, "reject");
  }

  async function updateLeaveStatus(id, action) {
    try {
      const response = await fetch(
        `${API_URL}/api/leaves/${id}/${action}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            status: action === "approve" ? "APPROVED" : "REJECTED",
            manager_comment: managerComment,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.detail || `Unable to ${action} leave.`);
        return;
      }

      setMessage(
        action === "approve"
          ? "Leave approved successfully."
          : "Leave rejected successfully."
      );

      setManagerComment("");
      loadLeaves();
    } catch (error) {
      console.error("Leave status error:", error);
      setMessage("Unable to connect to server.");
    }
  }

  async function applyLeave(e) {
    e.preventDefault();

    if (!profile?.id) {
      setMessage("Employee profile not available.");
      return;
    }

    if (!leaveType || !fromDate || !toDate || !leaveReason.trim()) {
      setMessage("Please fill all leave fields.");
      return;
    }

    if (toDate < fromDate) {
      setMessage("To Date cannot be earlier than From Date.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/leaves/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          employee_id: profile.id,
          leave_type_id: Number(leaveType),
          from_date: fromDate,
          to_date: toDate,
          reason: leaveReason.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.detail || "Leave request failed.");
        return;
      }

      setMessage("Leave request submitted successfully.");
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setLeaveReason("");
      setShowApplyLeave(false);
      loadLeaves();
    } catch (error) {
      console.error("Apply leave error:", error);
      setMessage("Unable to connect to server.");
    }
  }

  async function downloadDocument(documentItem) {
    const documentId = documentItem?.id ?? documentItem?.document_id;

    if (!documentId) {
      setMessage("Document ID is missing.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/documents/${documentId}/download`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setMessage(errorData.detail || "Document download failed.");
        return;
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        const downloadUrl =
          data.download_url || data.url || data.presigned_url;

        if (!downloadUrl) {
          setMessage("Backend did not provide a download URL.");
          return;
        }

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = documentItem.file_name || "document.pdf";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = documentItem.file_name || "document.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("Document download error:", error);
      setMessage("Unable to download document. Check the server connection.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);
    setUser(null);
    setEmployees([]);
    setManagerTeam([]);
    setLeaves([]);
    setDocuments([]);
    setAdminStats(null);
    setProfile(null);

    setShowEmployees(false);
    setShowLeaves(false);
    setShowDocuments(false);
    setShowProfile(false);
    setShowApplyLeave(false);
    setShowLeaveBalance(false);

    setUsername("");
    setPassword("");
    setMessage("");
  }

  function closeEmployeeSections() {
    setShowProfile(false);
    setShowApplyLeave(false);
    setShowDocuments(false);
    setShowLeaveBalance(false);
    setShowLeaves(false);
  }

  function openProfile() {
    closeEmployeeSections();
    setShowProfile(true);
  }

  function openApplyLeave() {
    closeEmployeeSections();
    setShowApplyLeave(true);
  }

  function openDocuments() {
    closeEmployeeSections();
    setShowDocuments(true);
    loadDocuments();
  }

  function openLeaveBalance() {
    closeEmployeeSections();
    setShowLeaveBalance(true);
  }

  function openMyLeaves() {
    closeEmployeeSections();
    setShowLeaves(true);
    loadLeaves();
  }

  function goDashboard() {
    closeEmployeeSections();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!loggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.logoCircle}>L</div>
          <h1 style={styles.loginTitle}>LeaveFlow</h1>
          <p style={styles.loginSubtitle}>
            {showRegister ? "Create Account" : "Welcome Back"}
          </p>
          <p style={styles.loginDescription}>
            Sign in to manage employee leave requests
          </p>

          {!showRegister ? (
            <form onSubmit={login}>
              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />

              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />

              <button style={styles.primaryButton} type="submit">
                Sign In
              </button>

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => {
                  setShowRegister(true);
                  setMessage("");
                }}
              >
                New account
              </button>
            </form>
          ) : (
            <form onSubmit={registerUser}>
              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                placeholder="Choose username"
                required
              />

              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Choose password"
                required
              />

              <label style={styles.label}>Name</label>
              <input
                style={styles.input}
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Full name"
                required
              />

              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="Email address"
                required
              />

              <label style={styles.label}>Department</label>
              <select
                style={styles.input}
                value={registerDepartment}
                onChange={(e) => setRegisterDepartment(e.target.value)}
              >
                <option value="1">IT</option>
                <option value="2">HR</option>
                <option value="3">Finance</option>
                <option value="4">Sales</option>
              </select>

              <button style={styles.primaryButton} type="submit">
                Create Account
              </button>

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => {
                  setShowRegister(false);
                  setMessage("");
                }}
              >
                Back to Sign In
              </button>
            </form>
          )}

          {message && <div style={styles.messageBox}>{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>LeaveFlow</div>
          <div style={styles.headerSubtitle}>
            Employee Leave Management
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <strong>{user?.username}</strong>
            <span>{user?.role}</span>
          </div>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.container}>
        {message && <div style={styles.topMessage}>{message}</div>}

        {user?.role === "EMPLOYEE" && (
          <>
            <WelcomeSection
              portal="EMPLOYEE PORTAL"
              title={`Welcome, ${profile?.name || user?.username}`}
              description="Manage your profile, leave requests and documents from one place."
            />

            <div style={styles.cardGrid}>
              <DashboardCard number="01" title="My Profile" description="View your employee profile" value="Profile" onClick={openProfile} />
              <DashboardCard number="02" title="Apply Leave" description="Submit a new leave request" value="Apply" onClick={openApplyLeave} />
              <DashboardCard number="03" title="Documents" description="View your leave documents" value={documents.length} onClick={openDocuments} />
              <DashboardCard number="04" title="Leave Balance" description="Check your leave information" value="View" onClick={openLeaveBalance} />
              <DashboardCard number="05" title="My Leaves" description="Track your leave requests" value={leaves.length} onClick={openMyLeaves} />
              <DashboardCard number="06" title="Dashboard" description="Return to dashboard overview" value="Home" onClick={goDashboard} />
            </div>

            {showProfile && (
              <SectionCard title="My Profile">
                {profile ? (
                  <div style={styles.profileGrid}>
                    <ProfileItem label="Employee ID" value={profile.id} />
                    <ProfileItem label="Name" value={profile.name} />
                    <ProfileItem label="Email" value={profile.email} />
                    <ProfileItem label="Department" value={profile.department_name} />
                    <ProfileItem label="Designation" value={profile.designation} />
                    <ProfileItem label="Username" value={user?.username} />
                  </div>
                ) : (
                  <p>No profile information found.</p>
                )}
              </SectionCard>
            )}

            {showApplyLeave && (
              <SectionCard title="Apply Leave">
                <form onSubmit={applyLeave}>
                  <div style={styles.formGrid}>
                    <div>
                      <label style={styles.label}>Leave Type</label>
                      <select
                        style={styles.input}
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        required
                      >
                        <option value="">Select leave type</option>
                        <option value="1">Casual Leave</option>
                        <option value="2">Sick Leave</option>
                        <option value="3">Earned Leave</option>
                      </select>
                    </div>

                    <div>
                      <label style={styles.label}>From Date</label>
                      <input
                        style={styles.input}
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label style={styles.label}>To Date</label>
                      <input
                        style={styles.input}
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <label style={styles.label}>Reason</label>
                  <textarea
                    style={styles.textarea}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Enter reason for leave"
                    rows="5"
                    required
                  />

                  <button type="submit" style={styles.primaryButtonSmall}>
                    Submit Leave Request
                  </button>
                </form>
              </SectionCard>
            )}

            {showDocuments && (
              <SectionCard title="Documents">
                {documents.length === 0 ? (
                  <div style={styles.emptyState}>No documents found.</div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.tableHeader}>ID</th>
                          <th style={styles.tableHeader}>File Name</th>
                          <th style={styles.tableHeader}>S3 Key</th>
                          <th style={styles.tableHeader}>Uploaded</th>
                          <th style={styles.tableHeader}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((documentItem) => (
                          <tr key={documentItem.id}>
                            <td style={styles.tableCell}>{documentItem.id}</td>
                            <td style={styles.tableCell}>{documentItem.file_name}</td>
                            <td style={styles.tableCell}>{documentItem.s3_key}</td>
                            <td style={styles.tableCell}>
                              {documentItem.uploaded_at
                                ? new Date(documentItem.uploaded_at).toLocaleString()
                                : "-"}
                            </td>
                            <td style={styles.tableCell}>
                              <button
                                type="button"
                                style={styles.actionButton}
                                onClick={() => downloadDocument(documentItem)}
                              >
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            )}

            {showLeaveBalance && (
              <SectionCard title="Leave Balance">
                <div style={styles.balanceGrid}>
                  <BalanceCard title="Casual Leave" value="Available" />
                  <BalanceCard title="Sick Leave" value="Available" />
                  <BalanceCard title="Earned Leave" value="Available" />
                </div>
                <p style={styles.infoText}>
                  Your actual leave balance is maintained according to the leave policy configured by the administrator.
                </p>
              </SectionCard>
            )}

            {showLeaves && (
              <SectionCard title="My Leaves">
                <LeaveTable leaves={leaves} />
              </SectionCard>
            )}
          </>
        )}

        {user?.role === "MANAGER" && (
          <>
            <WelcomeSection
              portal="MANAGER PORTAL"
              title="Manager Dashboard"
              description="Review your team's leave requests."
            />

            <div style={styles.cardGrid}>
              <DashboardCard number="01" title="My Team" description="View team members" value={managerTeam.length} onClick={() => setShowEmployees(!showEmployees)} />
              <DashboardCard number="02" title="Leave Requests" description="Review leave requests" value={leaves.length} onClick={() => setShowLeaves(!showLeaves)} />
            </div>

            {showEmployees && (
              <SectionCard title="My Team">
                {managerTeam.length === 0 ? (
                  <div style={styles.emptyState}>No team members found.</div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.tableHeader}>ID</th>
                          <th style={styles.tableHeader}>Name</th>
                          <th style={styles.tableHeader}>Email</th>
                          <th style={styles.tableHeader}>Department</th>
                        </tr>
                      </thead>
                      <tbody>
                        {managerTeam.map((employee) => (
                          <tr key={employee.id}>
                            <td style={styles.tableCell}>{employee.id}</td>
                            <td style={styles.tableCell}>{employee.name}</td>
                            <td style={styles.tableCell}>{employee.email}</td>
                            <td style={styles.tableCell}>{employee.department_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            )}

            {showLeaves && (
              <SectionCard title="Leave Requests">
                <label style={styles.label}>Manager Comment</label>
                <textarea
                  style={styles.textarea}
                  rows="3"
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="Optional comment"
                />

                <ManagerLeaveTable
                  leaves={leaves}
                  approveLeave={approveLeave}
                  rejectLeave={rejectLeave}
                />
              </SectionCard>
            )}
          </>
        )}

        {user?.role === "ADMIN" && (
          <>
            <WelcomeSection
              portal="ADMIN PORTAL"
              title="Admin Dashboard"
              description="Manage employees and monitor leave activity."
            />

            <div style={styles.cardGrid}>
              <DashboardCard number="01" title="Employees" description="View all employees" value={employees.length} onClick={() => setShowEmployees(!showEmployees)} />
              <DashboardCard number="02" title="Leave Requests" description="View leave requests" value={leaves.length} onClick={() => setShowLeaves(!showLeaves)} />
              <DashboardCard number="03" title="Total Employees" description="Employees in system" value={adminStats?.total_employees ?? employees.length} />
              <DashboardCard number="04" title="Total Leave Requests" description="Leave requests in system" value={adminStats?.total_leave_requests ?? leaves.length} />
            </div>

            {showEmployees && (
              <SectionCard title="Employees">
                {employees.length === 0 ? (
                  <div style={styles.emptyState}>No employees found.</div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.tableHeader}>ID</th>
                          <th style={styles.tableHeader}>Name</th>
                          <th style={styles.tableHeader}>Email</th>
                          <th style={styles.tableHeader}>Department</th>
                          <th style={styles.tableHeader}>Designation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((employee) => (
                          <tr key={employee.id}>
                            <td style={styles.tableCell}>{employee.id}</td>
                            <td style={styles.tableCell}>{employee.name}</td>
                            <td style={styles.tableCell}>{employee.email}</td>
                            <td style={styles.tableCell}>{employee.department_name}</td>
                            <td style={styles.tableCell}>{employee.designation || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            )}

            {showLeaves && (
              <SectionCard title="All Leave Requests">
                <LeaveTable leaves={leaves} showEmployee />
              </SectionCard>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function WelcomeSection({ portal, title, description }) {
  return (
    <section style={styles.welcomeSection}>
      <p style={styles.smallHeading}>{portal}</p>
      <h1 style={styles.pageTitle}>{title}</h1>
      <p style={styles.pageDescription}>{description}</p>
    </section>
  );
}

function DashboardCard({ number, title, description, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...styles.dashboardCard, textAlign: "left", fontFamily: "inherit" }}
    >
      <div style={styles.cardTop}>
        <span style={styles.cardNumber}>{number}</span>
        <span style={styles.cardArrow}>→</span>
      </div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardDescription}>{description}</p>
      <div style={styles.cardValue}>{value}</div>
    </button>
  );
}

function SectionCard({ title, children }) {
  return (
    <section style={styles.sectionCard}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div style={styles.profileItem}>
      <div style={styles.profileLabel}>{label}</div>
      <div style={styles.profileValue}>{value || "-"}</div>
    </div>
  );
}

function BalanceCard({ title, value }) {
  return (
    <div style={styles.balanceCard}>
      <div style={styles.balanceTitle}>{title}</div>
      <div style={styles.balanceValue}>{value}</div>
    </div>
  );
}

function LeaveTable({ leaves, showEmployee = false }) {
  if (!leaves.length) {
    return <div style={styles.emptyState}>No leave requests found.</div>;
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>ID</th>
            {showEmployee && <th style={styles.tableHeader}>Employee</th>}
            <th style={styles.tableHeader}>From</th>
            <th style={styles.tableHeader}>To</th>
            <th style={styles.tableHeader}>Reason</th>
            <th style={styles.tableHeader}>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave.id}>
              <td style={styles.tableCell}>{leave.id}</td>
              {showEmployee && (
                <td style={styles.tableCell}>{leave.employee_id}</td>
              )}
              <td style={styles.tableCell}>{leave.from_date}</td>
              <td style={styles.tableCell}>{leave.to_date}</td>
              <td style={styles.tableCell}>{leave.reason}</td>
              <td style={styles.tableCell}>
                <Status status={leave.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ManagerLeaveTable({ leaves, approveLeave, rejectLeave }) {
  if (!leaves.length) {
    return <div style={styles.emptyState}>No leave requests found.</div>;
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>ID</th>
            <th style={styles.tableHeader}>Employee</th>
            <th style={styles.tableHeader}>From</th>
            <th style={styles.tableHeader}>To</th>
            <th style={styles.tableHeader}>Reason</th>
            <th style={styles.tableHeader}>Status</th>
            <th style={styles.tableHeader}>Action</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave.id}>
              <td style={styles.tableCell}>{leave.id}</td>
              <td style={styles.tableCell}>{leave.employee_id}</td>
              <td style={styles.tableCell}>{leave.from_date}</td>
              <td style={styles.tableCell}>{leave.to_date}</td>
              <td style={styles.tableCell}>{leave.reason}</td>
              <td style={styles.tableCell}>
                <Status status={leave.status} />
              </td>
              <td style={styles.tableCell}>
                {leave.status === "PENDING" ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      style={styles.approveButton}
                      onClick={() => approveLeave(leave.id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      style={styles.rejectButton}
                      onClick={() => rejectLeave(leave.id)}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Status({ status }) {
  let background = "#e8f1ff";
  let color = "#1769aa";

  if (status === "APPROVED") {
    background = "#e8f8ef";
    color = "#18864b";
  } else if (status === "REJECTED") {
    background = "#fff0f0";
    color = "#c62828";
  } else if (status === "PENDING") {
    background = "#fff7df";
    color = "#9a6b00";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "999px",
        background,
        color,
        fontSize: "12px",
        fontWeight: "700",
      }}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

const styles = {
  loginPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eef7ff, #dceeff, #f7fbff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  loginCard: {
    width: "100%",
    maxWidth: "430px",
    boxSizing: "border-box",
    background: "#fff",
    borderRadius: "24px",
    padding: "42px",
    boxShadow: "0 20px 60px rgba(30, 100, 160, 0.15)",
    border: "1px solid #e5f1fb",
  },
  logoCircle: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #1683d8, #45b6f7)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "18px",
  },
  loginTitle: { margin: 0, color: "#123b5d", fontSize: "32px", fontWeight: "800" },
  loginSubtitle: { margin: "8px 0 4px", color: "#1d6fa5", fontSize: "20px", fontWeight: "700" },
  loginDescription: { margin: "0 0 28px", color: "#70869a", fontSize: "14px" },
  label: { display: "block", marginBottom: "7px", marginTop: "16px", color: "#38566d", fontSize: "13px", fontWeight: "700" },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #cfe1ee", borderRadius: "11px", padding: "12px 14px", fontSize: "14px", outline: "none", background: "#fbfdff", color: "#173c56" },
  textarea: { width: "100%", boxSizing: "border-box", border: "1px solid #cfe1ee", borderRadius: "11px", padding: "12px 14px", fontSize: "14px", outline: "none", background: "#fbfdff", color: "#173c56", resize: "vertical" },
  primaryButton: { width: "100%", border: "none", borderRadius: "11px", padding: "13px", marginTop: "22px", background: "linear-gradient(135deg, #1683d8, #249ee5)", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer" },
  secondaryButton: { width: "100%", border: "1px solid #c8dfef", borderRadius: "11px", padding: "12px", marginTop: "10px", background: "#f5faff", color: "#1769aa", fontWeight: "700", fontSize: "14px", cursor: "pointer" },
  messageBox: { marginTop: "18px", padding: "12px 14px", borderRadius: "10px", background: "#eef7ff", color: "#1769aa", fontSize: "13px", lineHeight: 1.5 },
  app: { minHeight: "100vh", background: "#f5faff", color: "#173c56", fontFamily: "Inter, system-ui, sans-serif" },
  header: { position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #e2eef7", padding: "16px 5%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", boxShadow: "0 4px 18px rgba(30, 100, 160, 0.06)" },
  brand: { color: "#126aa5", fontSize: "24px", fontWeight: "800" },
  headerSubtitle: { color: "#7b92a5", fontSize: "12px", marginTop: "2px" },
  headerRight: { display: "flex", alignItems: "center", gap: "18px" },
  userInfo: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", fontSize: "13px" },
  logoutButton: { border: "1px solid #cfe1ee", background: "#fff", color: "#1769aa", borderRadius: "9px", padding: "9px 15px", fontWeight: "700", cursor: "pointer" },
  container: { width: "90%", maxWidth: "1200px", margin: "0 auto", padding: "42px 0 70px" },
  topMessage: { marginBottom: "20px", padding: "13px 16px", background: "#eaf6ff", color: "#1769aa", border: "1px solid #d2eafa", borderRadius: "12px", fontSize: "14px" },
  welcomeSection: { background: "linear-gradient(135deg, #eaf6ff, #f7fbff)", border: "1px solid #dcecf7", borderRadius: "22px", padding: "34px", marginBottom: "26px" },
  smallHeading: { margin: 0, color: "#1683d8", fontSize: "12px", fontWeight: "800", letterSpacing: "1.5px" },
  pageTitle: { margin: "8px 0", color: "#123b5d", fontSize: "32px", fontWeight: "800" },
  pageDescription: { margin: 0, color: "#6e879b", fontSize: "15px" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px", marginBottom: "28px" },
  dashboardCard: { minHeight: "190px", width: "100%", background: "#fff", border: "1px solid #deedf7", borderRadius: "20px", padding: "23px", boxSizing: "border-box", cursor: "pointer", boxShadow: "0 8px 25px rgba(30, 100, 160, 0.07)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardNumber: { color: "#68a8d2", fontSize: "12px", fontWeight: "800" },
  cardArrow: { color: "#1683d8", fontSize: "20px", fontWeight: "700" },
  cardTitle: { margin: "25px 0 8px", color: "#174665", fontSize: "19px", fontWeight: "800" },
  cardDescription: { margin: 0, color: "#7890a2", fontSize: "13px", lineHeight: 1.5 },
  cardValue: { marginTop: "18px", color: "#1683d8", fontSize: "14px", fontWeight: "800" },
  sectionCard: { background: "#fff", border: "1px solid #deedf7", borderRadius: "20px", padding: "26px", marginTop: "20px", boxShadow: "0 8px 25px rgba(30, 100, 160, 0.06)" },
  sectionHeader: { borderBottom: "1px solid #edf4f8", paddingBottom: "15px", marginBottom: "22px" },
  sectionTitle: { margin: 0, color: "#174665", fontSize: "21px", fontWeight: "800" },
  profileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" },
  profileItem: { background: "#f7fbfe", border: "1px solid #e4f0f7", borderRadius: "13px", padding: "17px" },
  profileLabel: { color: "#7b92a5", fontSize: "12px", fontWeight: "700", marginBottom: "7px" },
  profileValue: { color: "#174665", fontSize: "15px", fontWeight: "700" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" },
  primaryButtonSmall: { border: "none", borderRadius: "10px", padding: "12px 18px", marginTop: "20px", background: "#1683d8", color: "#fff", fontWeight: "700", cursor: "pointer" },
  tableWrapper: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "700px" },
  tableHeader: { textAlign: "left", padding: "13px 12px", background: "#eef7fd", color: "#3c627b", fontSize: "12px", fontWeight: "800", borderBottom: "1px solid #dcecf7" },
  tableCell: { padding: "13px 12px", color: "#526f82", fontSize: "13px", borderBottom: "1px solid #edf3f7", verticalAlign: "middle" },
  actionButton: { border: "none", background: "#1683d8", color: "#fff", padding: "7px 13px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" },
  approveButton: { border: "none", background: "#1b9a5a", color: "#fff", padding: "7px 11px", borderRadius: "7px", fontSize: "12px", fontWeight: "700", cursor: "pointer" },
  rejectButton: { border: "none", background: "#d9534f", color: "#fff", padding: "7px 11px", borderRadius: "7px", fontSize: "12px", fontWeight: "700", cursor: "pointer" },
  emptyState: { padding: "35px 20px", textAlign: "center", color: "#7d94a5", background: "#f8fcff", borderRadius: "12px", border: "1px dashed #cfe1ee" },
  balanceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" },
  balanceCard: { padding: "22px", background: "linear-gradient(135deg, #eef8ff, #f9fcff)", border: "1px solid #dcecf7", borderRadius: "15px" },
  balanceTitle: { color: "#5f7b8e", fontSize: "13px", fontWeight: "700" },
  balanceValue: { marginTop: "12px", color: "#1683d8", fontSize: "18px", fontWeight: "800" },
  infoText: { marginTop: "20px", color: "#7890a2", fontSize: "13px", lineHeight: 1.6 },
};