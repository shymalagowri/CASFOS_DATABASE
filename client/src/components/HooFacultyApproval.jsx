/**
 * hoofacultyapproval.jsx
 *
 * This React component provides the Head of Office (HOO) with an interface to approve or reject faculty records
 * in the CASFOS Faculty Management System.
 *
 * Features:
 * - Displays a table of all faculty records pending HOO approval, with key details and verification status.
 * - Allows the HOO to approve a faculty record (only if verified) or reject it with mandatory remarks.
 * - Shows real-time feedback and status for each approval/rejection action using SweetAlert2 and status indicators.
 * - Provides a detailed popup view for each faculty record, including all nested and array fields, with image preview for photographs.
 * - Fetches and displays summary counts for new users, existing users, and data entries.
 * - Responsive UI with sidebar navigation, styled tables, modals for details and rejection, and user feedback.
 * - Integrates with backend APIs for data retrieval, approval, and rejection actions.
 * - Designed for HOO users to efficiently review, approve, or reject faculty details as part of the faculty approval workflow.
 */
import React, { useEffect, useState } from "react"; // Import React and hooks for state and side effects management
import axios from "axios"; // Import axios for making HTTP requests to the backend API
import "../styles/FacultyApproval.css"; // Import custom CSS for styling the FacultyApproval component
import { useLocation } from "react-router-dom"; // Import useLocation to access URL query parameters
import "../styles/Style.css"; // Import global CSS styles for the application
import Swal from "sweetalert2"; // Import SweetAlert2 for displaying user feedback modals

function FacultyApproval() { // Define the FacultyApproval functional component
  const port = import.meta.env.VITE_API_PORT; // Retrieve API port from environment variables
  const ip = import.meta.env.VITE_API_IP; // Retrieve API IP address from environment variables
  const [faculties, setFaculties] = useState([]); // State to store the list of faculty records
  const [popupData, setPopupData] = useState(null); // State to store data for the detailed faculty view popup
  const [newUsersCount, setNewUsersCount] = useState(0); // State to store count of new users
  const [existingUsersCount, setExistingUsersCount] = useState(0); // State to store count of existing users
  const [dataEntriesCount, setDataEntriesCount] = useState(0); // State to store count of data entries
  const [approvalStatus, setApprovalStatus] = useState({}); // State to track approval/rejection status for each faculty
  const [rejectingFacultyId, setRejectingFacultyId] = useState(null); // State to store ID of faculty being rejected
  const [rejectionRemarks, setRejectionRemarks] = useState(""); // State to store rejection remarks entered by the user

  const location = useLocation(); // Get the current location object to access URL query parameters
  const queryParams = new URLSearchParams(location.search); // Parse query parameters from the URL
  const username = queryParams.get("username") || "Guest"; // Extract username from query params, default to "Guest"

  useEffect(() => { // useEffect hook to fetch counts when component mounts
    const fetchCounts = async () => { // Define async function to fetch various counts
      try { // Start try block to handle potential errors
        const newUsersResponse = await axios.get(`http://${ip}:${port}/api/users/temporaryuserscount`); // Fetch count of temporary users
        setNewUsersCount(newUsersResponse.data.count); // Update newUsersCount state with response data

        const existingUsersResponse = await axios.get(`http://${ip}:${port}/api/users/count`); // Fetch counts of existing users
        const totalusers = // Calculate total users by summing admin, data entry, and viewer counts
          existingUsersResponse.data.data.adminCount +
          existingUsersResponse.data.data.dataEntryCount +
          existingUsersResponse.data.data.viewerCount;
        setExistingUsersCount(totalusers); // Update existingUsersCount state with total

        const assetRes = await axios.get(`http://${ip}:${port}/api/assets/monthly`); // Fetch monthly asset data
        const facultyRes = await axios.get(`http://${ip}:${port}/api/faculty/monthly`); // Fetch monthly faculty data
        const assetCount = assetRes.data.data.reduce((total, item) => total + item, 0); // Sum asset counts
        const ifacultyCount = facultyRes.data.internal.reduce((total, item) => total + item, 0); // Sum internal faculty counts
        const efacultyCount = facultyRes.data.external.reduce((total, item) => total + item, 0); // Sum external faculty counts
        const finalcount = assetCount + ifacultyCount + efacultyCount; // Calculate total data entries
        setDataEntriesCount(finalcount); // Update dataEntriesCount state with total
      } catch (error) { // Catch any errors during fetching
        console.error("Error fetching data:", error); // Log error to console
      }
    };

    fetchCounts(); // Call the fetchCounts function
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => { // useEffect hook to fetch faculty records when component mounts
    const fetchFaculties = async () => { // Define async function to fetch faculty data
      try { // Start try block to handle potential errors
        const response = await axios.get(`http://${ip}:${port}/api/faculty/getAllFaculties`); // Fetch all faculty records
        setFaculties(response.data); // Update faculties state with response data
      } catch (error) { // Catch any errors during fetching
        console.error("Error fetching faculties:", error); // Log error to console
      }
    };
    fetchFaculties(); // Call the fetchFaculties function
  }, []); // Empty dependency array ensures this runs once on mount

  const approveFaculty = async (id) => { // Function to handle faculty approval
    try { // Start try block to handle potential errors
      const facultyToApprove = faculties.find((faculty) => faculty._id === id); // Find faculty by ID
      if (!facultyToApprove.verified) { // Check if faculty is verified
        Swal.fire({ // Show warning if not verified
          icon: "warning",
          title: "Validation Error",
          text: "Faculty must be verified before approval.",
        });
        return; // Exit function if not verified
      }

      setApprovalStatus((prev) => ({ ...prev, [id]: "Saving..." })); // Update status to "Saving..."

      const response = await axios.post(`http://${ip}:${port}/api/faculty/approve/${id}`); // Send approval request to API
      if (response.data.message === "Faculty approved and moved to confirmed successfully") { // Check for success response
        setFaculties(faculties.filter((faculty) => faculty._id !== id)); // Remove approved faculty from list
        setApprovalStatus((prev) => ({ ...prev, [id]: "Approved" })); // Update status to "Approved"
        Swal.fire({ // Show success alert
          icon: "success",
          title: "Success!",
          text: "Faculty approved successfully!",
        });

        setTimeout(() => { // Reset status after 2 seconds
          setApprovalStatus((prev) => ({ ...prev, [id]: "" }));
        }, 2000);
      } else { // Handle unexpected response
        setApprovalStatus((prev) => ({ ...prev, [id]: "Failed to Approve" })); // Update status to "Failed"
        Swal.fire({ // Show error alert
          icon: "error",
          title: "Oops...",
          text: response.data.message || "Unexpected response from server.",
        });
      }
    } catch (error) { // Catch any errors during approval
      console.error("Error approving faculty:", error); // Log error to console
      setApprovalStatus((prev) => ({ ...prev, [id]: "Failed to Approve" })); // Update status to "Failed"
      Swal.fire({ // Show error alert
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error approving faculty.",
      });
    }
  };

  const rejectFaculty = async (id) => { // Function to initiate faculty rejection
    setRejectingFacultyId(id); // Set the ID of the faculty being rejected
    setRejectionRemarks(""); // Clear any previous rejection remarks
  };

  const submitRejection = async () => { // Function to submit rejection with remarks
    if (!rejectionRemarks.trim()) { // Check if remarks are provided
      Swal.fire({ // Show warning if remarks are empty
        icon: "warning",
        title: "Validation Error",
        text: "Please provide rejection remarks.",
      });
      return; // Exit function if remarks are missing
    }

    try { // Start try block to handle potential errors
      const facultyToReject = faculties.find((faculty) => faculty._id === rejectingFacultyId); // Find faculty by ID
      if (!facultyToReject.verified) { // Check if faculty is verified
        Swal.fire({ // Show warning if not verified
          icon: "warning",
          title: "Validation Error",
          text: "Faculty must be verified before rejection.",
        });
        setRejectingFacultyId(null); // Clear rejecting faculty ID
        return; // Exit function if not verified
      }

      setApprovalStatus((prev) => ({ ...prev, [rejectingFacultyId]: "Rejecting..." })); // Update status to "Rejecting..."

      const response = await axios.post(`http://${ip}:${port}/api/faculty/rejectFacultyApproval/${rejectingFacultyId}`, { // Send rejection request with remarks
        rejectionRemarks
      });

      if (response.data.success) { // Check for success response
        setFaculties(faculties.filter((faculty) => faculty._id !== rejectingFacultyId)); // Remove rejected faculty from list
        setApprovalStatus((prev) => ({ ...prev, [rejectingFacultyId]: "Rejected" })); // Update status to "Rejected"
        Swal.fire({ // Show success alert
          icon: "success",
          title: "Success!",
          text: "Faculty rejected successfully!!!",
        });

        setTimeout(() => { // Reset status after 2 seconds
          setApprovalStatus((prev) => ({ ...prev, [rejectingFacultyId]: "" }));
        }, 2000);
      } else { // Handle unexpected response
        setApprovalStatus((prev) => ({ ...prev, [rejectingFacultyId]: "Failed to Reject" })); // Update status to "Failed"
        Swal.fire({ // Show error alert
          icon: "error",
          title: "Oops...",
          text: response.data.message || "Unexpected response from server.",
        });
      }
    } catch (error) { // Catch any errors during rejection
      console.error("Error rejecting faculty approval:", error); // Log error to console
      setApprovalStatus((prev) => ({ ...prev, [rejectingFacultyId]: "Failed to Reject" })); // Update status to "Failed"
      Swal.fire({ // Show error alert
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error rejecting faculty approval.",
      });
    } finally { // Always execute to clean up
      setRejectingFacultyId(null); // Clear rejecting faculty ID
    }
  };

  const renderPopupContent = (data) => { // Function to render faculty details in popup
    const renderValue = (value, key) => { // Helper function to render individual field values
      if (key === "photograph" && typeof value === "string") { // Handle photograph field
        const imageUrl = `http://${ip}:${port}/Uploads/${value.split("\\").pop()}`; // Construct image URL
        return <img src={imageUrl} alt="Photograph" style={{ width: "100px", height: "100px" }} />; // Render image
      }
      if (Array.isArray(value)) { // Handle array fields
        return (
          <ul>
            {value.map((item, index) => (
              <li key={index}>{renderValue(item, key)}</li> // Recursively render array items
            ))}
          </ul>
        );
      }
      if (typeof value === "object" && value !== null) { // Handle nested object fields
        return (
          <ul>
            {Object.entries(value)
              .filter(([key]) => key !== "_id") // Exclude _id fields
              .map(([key, val]) => (
                <li key={key}>
                  <strong>{key}:</strong> {renderValue(val, key)} // Recursively render nested fields
                </li>
              ))}
          </ul>
        );
      }
      return value?.toString() || "-"; // Render primitive values or "-" if null
    };

    return Object.entries(data) // Map faculty data to table rows
      .filter(([key]) => key !== "_id") // Exclude _id field
      .map(([key, value]) => (
        <tr key={key}>
          <td>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</td> // Format key as title case
          <td>{renderValue(value, key)}</td> // Render value using helper function
        </tr>
      ));
  };

  return ( // Render the component UI
    <div className="faculty-approval"> // Main container for the component
      <meta charSet="UTF-8" /> // Set character encoding
      <meta name="viewport" content="width=device-width, initial-scale=1.0" /> // Set responsive viewport
      <link href="http://unpkg.com/boxicons@2.0.9/css/boxicons.min.css" rel="stylesheet" /> // Import Boxicons CSS
      <link rel="stylesheet" href="style.css" /> // Link to global stylesheet
      <title>CASFOS</title> // Set page title

      <section id="sidebar"> // Sidebar navigation section
        <a href="#" className="brand"> // Brand logo/link
          <span className="text">HEAD OF OFFICE</span> // Display HOO title
        </a>
        <ul className="side-menu top"> // Top navigation menu
          <li> // Home menu item
            <a href={`/headofofficedashboard?username=${encodeURIComponent(username)}`}> // Link to dashboard
              <i className="bx bxs-dashboard" /> // Dashboard icon
              <span className="text">Home</span> // Menu text
            </a>
          </li>
          <li> // User Approval menu item
            <a href={`/hoouserapproval?username=${encodeURIComponent(username)}`}> // Link to user approval
              <i className="bx bxs-shopping-bag-alt" /> // Icon
              <span className="text">User Approval</span> // Menu text
            </a>
          </li>
          <li> // Asset Approval menu item
            <a href={`/hooassetapproval?username=${encodeURIComponent(username)}`}> // Link to asset approval
              <i className="bx bxs-shopping-bag-alt" /> // Icon
              <span className="text">Asset Approval</span> // Menu text
            </a>
          </li>
          <li className="active"> // Faculty Approval menu item (active)
            <a href={`/hoofacultyapproval?username=${encodeURIComponent(username)}`}> // Link to faculty approval
              <i className="bx bxs-package" /> // Icon
              <span className="text">Faculty Approval</span> // Menu text
            </a>
          </li>
          <li> // Faculty Updation menu item
            <a href={`/hoofacultyupdation?username=${encodeURIComponent(username)}`}> // Link to faculty updation
              <i className="bx bxs-reply" /> // Icon
              <span className="text">Faculty Updation</span> // Menu text
            </a>
          </li>
          <li> // Faculty View menu item
            <a href={`/hoofacultyview?username=${encodeURIComponent(username)}`}> // Link to faculty view
              <i className="bx bxs-doughnut-chart" /> // Icon
              <span className="text">Faculty View</span> // Menu text
            </a>
          </li>
        </ul>
        <ul className="side-menu"> // Bottom navigation menu
          <li> // Logout menu item
            <a href="/login" className="logout"> // Link to login page
              <i className="bx bxs-log-out-circle" /> // Logout icon
              <span className="text">Logout</span> // Menu text
            </a>
          </li>
        </ul>
      </section>

      <section id="content"> // Main content section
        <nav> // Navigation bar
          <i className="bx bx-menu" /> // Menu toggle icon
          
          <form action="#"> // Placeholder form (unused)
            <div className="form-input"></div> // Empty form input
          </form>
          <div style={styles.usernameContainer}> // Username display container
            <i className="bx bxs-user-circle" style={styles.userIcon}></i> // User icon
            <span style={styles.username}>{username}</span> // Display username
          </div>
        </nav>

        <div className="activity"> // Activity section for faculty approval
          <h2 style={styles.title}>New Faculty Approval</h2> // Section title
          <div style={styles.container}> // Table container
            <table className="advanced-table"> // Faculty records table
              <thead> // Table header
                <tr>
                  <th>Name</th> // Column for faculty name
                  <th>Faculty Type</th> // Column for faculty type
                  <th>Year of Allotment</th> // Column for year of allotment
                  <th>Mobile Number</th> // Column for mobile number
                  <th>Verified</th> // Column for verification status
                  <th>View</th> // Column for view action
                  <th>Action</th> // Column for approve/reject actions
                </tr>
              </thead>
              <tbody> // Table body
                {faculties.map((faculty) => ( // Map over faculties to render rows
                  <tr key={faculty._id}> // Row for each faculty
                    <td>{faculty.name || "-"}</td> // Display name or "-"
                    <td>{faculty.facultyType || "-"}</td> // Display faculty type or "-"
                    <td>{faculty.yearOfAllotment || "-"}</td> // Display year of allotment or "-"
                    <td>{faculty.mobileNumber || "-"}</td> // Display mobile number or "-"
                    <td>{faculty.verified ? "Yes" : "No"}</td> // Display verification status
                    <td> // View button cell
                      <button
                        className="view-button" // Style for view button
                        onClick={() => setPopupData(faculty)} // Open popup with faculty details
                      >
                        View
                      </button>
                    </td>
                    <td style={{ display: "flex", gap: "10px", alignItems: "center" }}> // Action buttons cell
                      <button
                        className="approve-button" // Style for approve button
                        onClick={() => approveFaculty(faculty._id)} // Trigger approval
                        disabled={!faculty.verified || approvalStatus[faculty._id] === "Saving..." || approvalStatus[faculty._id] === "Rejecting..."} // Disable if not verified or action in progress
                        style={{
                          backgroundColor: faculty.verified ? "#28a745" : "#ccc", // Green if verified, gray if not
                          cursor: faculty.verified ? "pointer" : "not-allowed", // Cursor based on state
                          display: "flex", // Flex for icon and text alignment
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          padding: "8px 16px",
                          borderRadius: "5px",
                          border: "none",
                          color: "white",
                        }}
                      >
                        {approvalStatus[faculty._id] === "Saving..." && ( // Show saving state
                          <>
                            <i className="bx bx-loader-circle bx-spin" style={styles.loadingIcon}></i> // Loading icon
                            Saving...
                          </>
                        )}
                        {approvalStatus[faculty._id] === "Approved" && ( // Show approved state
                          <>
                            <i className="bx bx-check-circle" style={styles.successIcon}></i> // Success icon
                            Approved
                          </>
                        )}
                        {approvalStatus[faculty._id] === "Failed to Approve" && ( // Show failed state
                          <>
                            <i className="bx bx-error-circle" style={styles.errorIcon}></i> // Error icon
                            Failed
                          </>
                        )}
                        {!approvalStatus[faculty._id] && "Approve"} // Default text
                      </button>
                      <button
                        className="reject-button" // Style for reject button
                        onClick={() => rejectFaculty(faculty._id)} // Trigger rejection
                        disabled={!faculty.verified || approvalStatus[faculty._id] === "Saving..." || approvalStatus[faculty._id] === "Rejecting..."} // Disable if not verified or action in progress
                        style={{
                          backgroundColor: faculty.verified ? "#dc3545" : "#ccc", // Red if verified, gray if not
                          cursor: faculty.verified ? "pointer" : "not-allowed", // Cursor based on state
                          display: "flex", // Flex for icon and text alignment
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          padding: "8px 16px",
                          borderRadius: "5px",
                          border: "none",
                          color: "white",
                        }}
                      >
                        {approvalStatus[faculty._id] === "Rejecting..." && ( // Show rejecting state
                          <>
                            <i className="bx bx-loader-circle bx-spin" style={styles.loadingIcon}></i> // Loading icon
                            Rejecting...
                          </>
                        )}
                        {approvalStatus[faculty._id] === "Rejected" && ( // Show rejected state
                          <>
                            <i className="bx bx-x-circle" style={styles.errorIcon}></i> // Error icon
                            Rejected
                          </>
                        )}
                        {approvalStatus[faculty._id] === "Failed to Reject" && ( // Show failed state
                          <>
                            <i className="bx bx-error-circle" style={styles.errorIcon}></i> // Error icon
                            Failed
                          </>
                        )}
                        {!approvalStatus[faculty._id] && "Reject"} // Default text
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {popupData && ( // Render popup for faculty details if popupData is set
        <div className="popup"> // Popup container
          <div className="popup-content"> // Popup content
            <h3>{popupData.name} Details</h3> // Popup title with faculty name
            <table> // Table for faculty details
              <thead>
                <tr>
                  <th>Key</th> // Column for field names
                  <th>Value</th> // Column for field values
                </tr>
              </thead>
              <tbody>{renderPopupContent(popupData)}</tbody> // Render faculty details
            </table>
            <button onClick={() => setPopupData(null)}>Close</button> // Button to close popup
          </div>
        </div>
      )}

      {rejectingFacultyId && ( // Render popup for rejection remarks if rejectingFacultyId is set
        <div className="popup"> // Popup container
          <div className="popup-content"> // Popup content
            <h3>Rejection Remarks</h3> // Popup title
            <textarea
              value={rejectionRemarks} // Bind textarea to rejectionRemarks state
              onChange={(e) => setRejectionRemarks(e.target.value)} // Update state on change
              placeholder="Enter rejection remarks here..." // Placeholder text
              style={{
                width: "100%", // Full width
                minHeight: "100px", // Minimum height
                padding: "10px", // Padding
                border: "1px solid #ddd", // Border style
                borderRadius: "4px", // Border radius
                marginBottom: "15px", // Bottom margin
                resize: "vertical", // Allow vertical resize
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}> // Button container
              <button
                style={{
                  padding: "8px 16px", // Padding
                  backgroundColor: "#6c757d", // Gray background
                  color: "white", // Text color
                  border: "none", // No border
                  borderRadius: "5px", // Border radius
                  cursor: "pointer", // Pointer cursor
                }}
                onClick={() => setRejectingFacultyId(null)} // Cancel rejection
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "8px 16px", // Padding
                  backgroundColor: "#28a745", // Green background
                  color: "white", // Text color
                  border: "none", // No border
                  borderRadius: "5px", // Border radius
                  cursor: "pointer", // Pointer cursor
                }}
                onClick={submitRejection} // Submit rejection
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = { // Inline styles object
  usernameContainer: { // Style for username container
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#555",
  },
  userIcon: { // Style for user icon
    fontSize: "30px",
    color: "#007BFF",
  },
  username: { // Style for username text
    fontWeight: "bold",
    fontSize: "18px",
  },
  container: { // Style for table container
    maxWidth: "1200px",
    margin: "15px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    background: "#fff",
  },
  title: { // Style for section title
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "50px",
    marginBottom: "15px",
    marginLeft: "20px",
    color: "#333",
  },
  loadingIcon: { fontSize: "16px", color: "#007BFF" }, // Style for loading icon
  successIcon: { fontSize: "16px", color: "#28a745" }, // Style for success icon
  errorIcon: { fontSize: "16px", color: "#dc3545" }, // Style for error icon
};

export default FacultyApproval; // Export the component