import React, { useEffect, useState } from "react";
import axios from 'axios';
import "../styles/UserApproval.css";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/style.css";

function Approval() {
  const [registrations, setRegistrations] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username") || "Guest";
  console.log(username);
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await axios.post('http://localhost:3001/api/users/checkUser', {
          name: username,
          role: 'headofoffice'
        });
        if (!response.data.exists) {
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Only Head of Office can approve registrations',
          }).then(() => {
            navigate('/'); // Redirect to login if not Head of Office
          });
        } else {
          fetchRegistrations();
        }
      } catch (error) {
        console.error('Error checking user role', error);
        navigate('/');
      }
    };

    const fetchRegistrations = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/users/registrations');
        console.log(response.data);
        setRegistrations(response.data);
      } catch (error) {
        console.error('Error fetching registrations', error);
      }
    };

    checkUserRole();
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
                <td style="padding:8px; border-bottom: 1px solid #ddd;">${value}</td>
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
  
    if (selectedUser.role === 'headofoffice' || selectedUser.role === 'principal') {
      try {
        await axios.post(`http://localhost:3001/api/users/approve/${id}`, { access: ['all'] });
        setRegistrations(registrations.filter(reg => reg._id !== id));
        Swal.fire('Approved!', 'The user has been approved with full access.', 'success');
      } catch (error) {
        console.error('Error approving registration', error);
        Swal.fire('Error!', 'There was an error approving the user.', 'error');
      }
    } else if (selectedUser.role === 'viewer' || selectedUser.role === 'assetmanagerentry' || selectedUser.role === 'facultyentrysuper') {
      let specificRoleHtml = '';
      let roleValues = [];
      
      if (selectedUser.role === 'assetmanagerentry') {
        specificRoleHtml = `
          <label>Select Specific Role:</label><br/>
          <input type="radio" name="specificRole" id="role0" value="assetmanager" checked /> Asset Manager<br/>
          <input type="radio" name="specificRole" id="role1" value="assetentrystaff" /> Asset Entry Staff<br/>
        `;
        roleValues = ['assetmanager', 'assetentrystaff'];
      } else if (selectedUser.role === 'facultyentrysuper') {
        specificRoleHtml = `
          <label>Select Specific Role:</label><br/>
          <input type="radio" name="specificRole" id="role0" value="facultyentrystaff" checked /> Faculty Entry Staff<br/>
          <input type="radio" name="specificRole" id="role1" value="superintendent" /> Superintendent<br/>
        `;
        roleValues = ['facultyentrystaff', 'superintendent'];
      }

      Swal.fire({
        title: `Approve ${selectedUser.role === 'viewer' ? 'Viewer' : selectedUser.role === 'assetmanagerentry' ? 'Asset Role' : 'Faculty Role'}`,
        html: `
          ${specificRoleHtml}
          <br/><label>ASSET TYPE ACCESS:</label><br/>
          <input type="checkbox" id="all" /> All <br/>
          <input type="checkbox" id="it" /> IT <br/>
          <input type="checkbox" id="store" /> Store <br/>
          <input type="checkbox" id="electrical" /> Electrical <br/>
          <input type="checkbox" id="furniture" /> Furniture <br/>
        `,
        focusConfirm: false,
        allowOutsideClick: false,
        preConfirm: () => {
          const selectedAssets = [];
          if (document.getElementById('it').checked) selectedAssets.push('IT');
          if (document.getElementById('store').checked) selectedAssets.push('Store');
          if (document.getElementById('electrical').checked) selectedAssets.push('Electrical');
          if (document.getElementById('furniture').checked) selectedAssets.push('Furniture');
          if (document.getElementById('all').checked) {
            selectedAssets.length = 0;
            selectedAssets.push('IT', 'Store', 'Electrical', 'Furniture');
          }
          
          let specificRole = selectedUser.role;
          if (selectedUser.role !== 'viewer') {
            specificRole = document.querySelector('input[name="specificRole"]:checked').value;
          }
          
          return { specificRole, access: selectedAssets };
        },
        didOpen: () => {
          const allCheckbox = document.getElementById('all');
          const otherCheckboxes = ['it', 'store', 'electrical', 'furniture'].map(id => document.getElementById(id));
  
          allCheckbox.addEventListener('change', () => {
            otherCheckboxes.forEach(checkbox => checkbox.disabled = allCheckbox.checked);
          });
  
          otherCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
              const anyChecked = otherCheckboxes.some(chk => chk.checked);
              allCheckbox.disabled = anyChecked;
              if (checkbox.checked) allCheckbox.checked = false;
            });
          });
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.post(`http://localhost:3001/api/users/approve/${id}`, {
              specificRole: result.value.specificRole,
              access: result.value.access
            });
            setRegistrations(registrations.filter(reg => reg._id !== id));
            Swal.fire('Approved!', 'The user has been approved with selected role and access.', 'success');
          } catch (error) {
            console.error('Error approving user', error);
            Swal.fire('Error!', 'There was an error approving the user.', 'error');
          }
        }
      });
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
          await axios.post(`http://localhost:3001/api/users/reject/${id}`, { remark: result.value });
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
      <link href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="style.css" />
      <title>CASFOS</title>

      <section id="sidebar">
        <a href="#" className="brand">
          <span className="text">HEAD OF OFFICE</span>
        </a>
        <ul className="side-menu top">
            <li className="active"><a href={`/headofofficedashboard?username=${encodeURIComponent(username)}`}><i className="bx bxs-dashboard" /><span className="text">Home</span></a></li>
            <li ><a href={`/hoouserapproval?username=${encodeURIComponent(username)}`}><i className="bx bxs-shopping-bag-alt" /><span className="text">User Approval</span></a></li>
            <li><a href={`/hoofacultyapproval?username=${encodeURIComponent(username)}`}><i className="bx bxs-package" /><span className="text">Faculty Approval</span></a></li>
            <li><a href={`/hoofacultyupdation?username=${encodeURIComponent(username)}`}><i className="bx bxs-reply" /><span className="text">Faculty Updation</span></a></li>
            <li><a href={`/hoofacultyview?username=${encodeURIComponent(username)}`}><i className="bx bxs-doughnut-chart" /><span className="text">Faculty View</span></a></li>
          </ul>
        <ul className="side-menu">
          <li>
            <a href="/" className="logout">
              <i className="bx bxs-log-out-circle" />
              <span className="text">Logout</span>
            </a>
          </li>
        </ul>
      </section>

      <section id="content">
        <nav>
          <i className="bx bx-menu" />
          <span className="head-title">Dashboard</span>
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
                     reg.role === 'assetmanagerentry' ? 'Asset Manager/Entry' :
                     reg.role === 'facultyentrysuper' ? 'Faculty Entry/Super' :
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