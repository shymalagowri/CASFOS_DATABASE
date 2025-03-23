import React, { useEffect, useState } from "react";
import axios from 'axios';
import "../styles/UserApproval.css"
import { useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/style.css";

function Approval() {
  const [registrations, setRegistrations] = useState([]);
 
  const location = useLocation(); 
    const queryParams = new URLSearchParams(location.search); // Create URLSearchParams object
    const username = queryParams.get("username") || "Guest";

  

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/users/registrations');
        console.log(response.data);
        setRegistrations(response.data);
      } catch (error) {
        console.error('Error fetching registrations', error);
      }
    };

    fetchRegistrations();
  }, []);
  const viewDetails = (reg) => {
    const ignoredKeys = ["_id", "password", "__v"];
  
    const detailsHtml = `
      <table style="width:100%; text-align:left; border-collapse: collapse;">
        ${Object.entries(reg)
          .filter(([key]) => !ignoredKeys.includes(key)) // Ignore specific keys
          .map(([key, value]) => {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);

            // Format the date properly if the key is "dob"
            if (key === "dob" && value) {
                value = new Date(value).toISOString().split("T")[0]; // YYYY-MM-DD format
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
  
    if (selectedUser && (selectedUser.role === 'viewer' || selectedUser.role === 'dataentry')) {
      Swal.fire({
        title: 'Give Access To:',
        html: `
          <label>ASSET TYPE:</label><br/>
          <input type="checkbox" id="all" checked /> All <br/>
          <input type="checkbox" id="it" /> IT <br/>
          <input type="checkbox" id="store" /> Store <br/>
          <input type="checkbox" id="electrical" /> Electrical <br/>
          <input type="checkbox" id="furniture" /> Furniture <br/>
        `,
        focusConfirm: false,
        allowOutsideClick: false,
        preConfirm: () => {
          const selectedAssets = [];
  
          // Get the values based on checked checkboxes
          if (document.getElementById('it').checked) selectedAssets.push('IT');
          if (document.getElementById('store').checked) selectedAssets.push('Store');
          if (document.getElementById('electrical').checked) selectedAssets.push('Electrical');
          if (document.getElementById('furniture').checked) selectedAssets.push('Furniture');
  
          // If "All" is selected, add all asset types to the list
          if (document.getElementById('all').checked) {
            selectedAssets.length = 0; // Clear any previous selections
            selectedAssets.push('IT', 'Store', 'Electrical', 'Furniture');
          }
  
          return selectedAssets;
        },
        didOpen: () => {
          // Disable/Enable logic for "All" checkbox
          const allCheckbox = document.getElementById('all');
          const otherCheckboxes = [
            'it', 'store', 'electrical', 'furniture'
          ].map(id => document.getElementById(id));
  
          // Handle logic when "All" checkbox is toggled
          allCheckbox.addEventListener('change', () => {
            if (allCheckbox.checked) {
              // If "All" is checked, disable other checkboxes
              otherCheckboxes.forEach(checkbox => checkbox.disabled = true);
            } else {
              // Enable other checkboxes if "All" is not checked
              otherCheckboxes.forEach(checkbox => checkbox.disabled = false);
            }
          });
  
          // Handle logic when any other checkbox is toggled
          otherCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
              if (checkbox.checked) {
                // If any other checkbox is checked, uncheck "All" and disable it
                allCheckbox.checked = false;
                allCheckbox.disabled = true;
              } else {
                // Enable "All" if no other checkboxes are selected
                const anyChecked = otherCheckboxes.some(chk => chk.checked);
                allCheckbox.disabled = anyChecked;
              }
            });
          });
        },
        customClass: {
          popup: 'swal-popup' // Optional class for custom styling
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          const selectedAssets = result.value;
  
          try {
            // Send the selected asset types to the backend
            await axios.post(`http://localhost:3001/api/users/approve/${id}`, { access: selectedAssets });
            setRegistrations(registrations.filter(reg => reg._id !== id));
            Swal.fire('Approved!', 'The user has been approved and access granted.', 'success');
          } catch (error) {
            console.error('Error approving registration', error);
          }
        }
      });
    }
    if(selectedUser.role === 'admin')
      {
        try {
          // Send the selected asset types to the backend
          await axios.post(`http://localhost:3001/api/users/approve/${id}`);
          setRegistrations(registrations.filter(reg => reg._id !== id));
          Swal.fire('Approved!', 'The user has been approved and access granted.', 'success');
        } catch (error) {
          console.error('Error approving registration', error);
        }
      }
   
  };
  
  
  

  const rejectAction = async (id) => {
    Swal.fire({
      title: 'Reject Registration',
      input: 'textarea',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'Enter your remark here...',
      inputAttributes: {
        'aria-label': 'Enter your remark here'
      },
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

      {/* SIDEBAR */}
      <section id="sidebar">
          <a href="#" className="brand">
            <span className="text">ADMIN</span>
          </a>
          <ul className="side-menu top">
            <li >
            <a href={`/admindashboard?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-dashboard" />
                <span className="text">Home</span>
              </a>
            </li>
            <li className="active">
            <a href={`/adminuserapproval?username=${encodeURIComponent(username)}`}>
            <i className="bx bxs-shopping-bag-alt" />
                <span className="text">Registration Approval</span>
              </a>
            </li>
            <li>
            <a href={`/usermanagement?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">User Management</span>
              </a>
            </li>
            <li>
            <a href={`/adminassetapproval?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Asset Approval</span>
              </a>
            </li>
            <li>
            <a href={`/adminfacultyapproval?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Faculty Approval</span>
              </a>
            </li>
            <li>
            <a href={`/adminassetview?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Asset View</span>
              </a>
            </li>
            <li>
            <a href={`/adminfacultyview?username=${encodeURIComponent(username)}`}>
                <i className="bx bxs-doughnut-chart" />
                <span className="text">Faculty View</span>
              </a>
            </li>
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

      {/* CONTENT */}
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
<br></br>
        {/* New Registration Approval */}
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
                  <td>{reg.role}</td>
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
    marginLeft : "20px",
    color: "#333",
  },
};

export default Approval;
