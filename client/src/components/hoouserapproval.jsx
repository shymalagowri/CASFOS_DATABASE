import React, { useEffect, useState } from "react";
import axios from 'axios';
import "../styles/UserApproval.css";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/style.css";

function Approval() {
  const port = import.meta.env.VITE_API_PORT;
  const ip = import.meta.env.VITE_API_IP;
  const [registrations, setRegistrations] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";

  useEffect(() => {
   

    const fetchRegistrations = async () => {
      try {
        const response = await axios.get(`http://${ip}:${port}/api/users/registrations`);
        setRegistrations(response.data);
      } catch (error) {
        console.error('Error fetching registrations', error);
      }
    };
    fetchRegistrations();
  }, [navigate, username]);

  const viewDetails = (reg) => {
    const ignoredKeys = ["_id", "password", "__v"];
    const detailsHtml = `
      <table style="width:100%; text-align:left; border-collapse: collapse;">
        ${Object.entries(reg)
          .filter(([key]) => !ignoredKeys.includes(key))
          .map(([key, value]) => {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            if (key === "dob" && value) {
              value = new Date(value).toISOString().split("T")[0];
            }
            return `
              <tr>
                <td style="font-weight:bold; padding:8px; border-bottom: 1px solid #ddd;">${formattedKey}</td>
                <td style="padding:8px; border-bottom: 1px solid #ddd;">${value || 'N/A'}</td>
              </tr>`;
          })
          .join("")}
      </table>`;

    Swal.fire({
      title: "User Details",
      html: detailsHtml,
      confirmButtonText: "Close",
    });
  };

  const approveAction = async (id) => {
    const selectedUser = registrations.find(reg => reg._id === id);

    try {
      await axios.post(`http://${ip}:${port}/api/users/approve/${id}`, {
        access: selectedUser.role === 'headofoffice' || selectedUser.role === 'principal' ? ['all'] : [],
        specificRole: selectedUser.role, // Use the role directly from registration data
      });
      setRegistrations(registrations.filter(reg => reg._id !== id));
      Swal.fire('Approved!', 'The user has been approved.', 'success');
    } catch (error) {
      console.error('Error approving registration', error);
      Swal.fire('Error!', 'There was an error approving the user.', 'error');
    }
  };

  const rejectAction = async (id) => {
    Swal.fire({
      title: 'Reject Registration',
      input: 'textarea',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'Enter your remark here...',
      inputAttributes: { 'aria-label': 'Enter your remark here' },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      preConfirm: (remark) => {
        if (!remark) {
          Swal.showValidationMessage('Remark is required for rejection.');
        }
        return remark;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`http://${ip}:${port}/api/users/reject/${id}`, { remark: result.value });
          setRegistrations(registrations.filter(reg => reg._id !== id));
          Swal.fire('Rejected!', 'The registration has been rejected.', 'success');
        } catch (error) {
          console.error('Error rejecting registration', error);
          Swal.fire('Error!', 'There was an error processing the rejection.', 'error');
        }
      }
    });
  };

  return (
    <div className="user-approval">
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="style.css" />
      <title>CASFOS</title>

      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">HEAD OF OFFICE</span>
        </a>
        <ul className="side-menu top">
          <li><a href={`/headofofficedashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
          <li className="active"><a href={`/hoouserapproval?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">User Approval</span></a></li>
          <li>
            <a href={`/hooassetapproval?username=${encodeURIComponent(username)}`}>
              <i className="bx bxs-shopping-bag-alt" />
              <span className="text">Asset Approval</span>
            </a>
          </li>
          <li><a href={`/hoofacultyapproval?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Faculty Approval</span></a></li>
          <li><a href={`/hoofacultyupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Faculty Updation</span></a></li>
          <li><a href={`/hoofacultyview?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty View</span></a></li>
        </ul>
        <ul className="side-menu">
          <li>
            <a href="/login" className="logout">
              <i className="bx bxs-log-out-circle" />
              <span className="text">Logout</span>
            </a>
          </li>
        </ul>
      </section>

      <section id="content">
        <nav>
          <i className="bx bx-menu" />
          <form action="#">
            <div className="form-input"></div>
          </form>
          <div style={styles.usernameContainer}>
            <i className="bx bxs-user-circle" style={styles.userIcon}></i>
            <span style={styles.username}>{username}</span>
          </div>
        </nav>
        <h2 style={styles.title}>New Registration Approval</h2>
        <br />
        <div style={styles.container}>
          <table className="advanced-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Joined</th>
                <th>Type</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg, index) => (
                <tr key={index}>
                  <td>{reg.name}</td>
                  <td>{reg.phone}</td>
                  <td>{new Date(reg.joined).toLocaleDateString()}</td>
                  <td>
                    {reg.role === 'headofoffice' ? 'Head of Office' :
                     reg.role === 'principal' ? 'Principal' :
                     reg.role === 'assetmanager' ? 'Asset Manager' :
                     reg.role === 'storekeeper' ? 'Storekeeper' :
                     reg.role === 'facultyentrystaff' ? 'Faculty Entry Staff' :
                     reg.role === 'facultyverifier' ? 'Faculty Verifier' :
                     'Viewer'}
                  </td>
                  <td>
                    <button onClick={() => approveAction(reg._id)}>Approve</button>
                    <button onClick={() => rejectAction(reg._id)}>Reject</button>
                  </td>
                  <td>
                    <button className="view-button" onClick={() => viewDetails(reg)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const styles = {
  usernameContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#555",
  },
  userIcon: {
    fontSize: "30px",
    color: "#007BFF",
  },
  username: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  container: {
    maxWidth: "1200px",
    margin: "15px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "50px",
    marginBottom: "15px",
    marginLeft: "20px",
    color: "#333",
  },
};

export default Approval;