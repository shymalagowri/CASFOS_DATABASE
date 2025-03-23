import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/UserApproval.css";
import Swal from "sweetalert2";
import "../styles/style.css";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const UserManagement = () => {
    const [registrations, setRegistrations] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const username = queryParams.get("username") || "Guest";

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/users/confirmedregistrations');
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
              .filter(([key]) => !ignoredKeys.includes(key))
              .map(([key, value]) => {
                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
                if (key === "dob" && value) {
                    value = new Date(value).toISOString().split("T")[0]; // YYYY-MM-DD format
                }
                if(key === "access" && reg.role==="admin")
                    return ""
                return `
                  <tr>
                    <td style="font-weight:bold; padding:8px; border-bottom: 1px solid #ddd;">${formattedKey}</td>
                    <td style="padding:8px; border-bottom: 1px solid #ddd;">${Array.isArray(value) ? value.join(", ") : value}</td>
                  </tr>`;
              })
              .join("")}
          </table>`;

        Swal.fire({
            title: "User Details",
            html: detailsHtml,
            confirmButtonText: "Close",
            showCancelButton: reg.role === "dataentry" || reg.role === "viewer",
            cancelButtonText: "Change Access",
            preConfirm: () => {} // Do nothing on confirm
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                changeAccess(reg);
            }
        });
    };

    const changeAccess = (user) => {
        const accessOptions = ["All", "IT", "Electrical", "Store", "Furniture"];
        const accessState = accessOptions.reduce((acc, option) => {
            acc[option] = user.access.includes(option);
            return acc;
        }, {});

        const container = document.createElement("div");
        accessOptions.forEach((option) => {
            const label = document.createElement("label");
            label.style.display = "block";
            label.style.marginBottom = "8px";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = option;
            checkbox.checked = accessState[option];
            checkbox.addEventListener("change", () => {
                if (option === "All") {
                    accessOptions.forEach((opt) => {
                        if (opt !== "All") {
                            accessState[opt] = false;
                            container.querySelector(`input[value="${opt}"]`).checked = false;
                        }
                    });
                } else {
                    accessState["All"] = false;
                    container.querySelector(`input[value="All"]`).checked = false;
                }
                accessState[option] = checkbox.checked;
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(` ${option}`));
            container.appendChild(label);
        });

        Swal.fire({
            title: "Change Access",
            html: container,
            showCancelButton: true,
            confirmButtonText: "Update",
            preConfirm: () => {
                return accessOptions.filter((option) => accessState[option]);
            },
        }).then((result) => {
            if (result.isConfirmed) {
                updateUserAccess(user, result.value);
            }
        });
    };

    const updateUserAccess = async (user, newAccess) => {
        try {
            console.log("axx",newAccess);
            await axios.put(`http://localhost:3001/api/users/update-access`, {
                userId: user._id,
                role: user.role,
                newAccess: newAccess
            });
            Swal.fire("Success", "Access level updated successfully!", "success");
        } catch (error) {
            console.error("Error updating access", error);
            Swal.fire("Error", "Failed to update access level", "error");
        }
    };

    return (
        <>
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
                        <li>
                            <a href={`/admindashboard?username=${encodeURIComponent(username)}`}>
                                <i className="bx bxs-dashboard" />
                                <span className="text">Home</span>
                            </a>
                        </li>
                        <li>
                            <a href={`/adminuserapproval?username=${encodeURIComponent(username)}`}>
                                <i className="bx bxs-shopping-bag-alt" />
                                <span className="text">Registration Approval</span>
                            </a>
                        </li>
                        <li className="active">
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
                {/* SIDEBAR */}
                {/* CONTENT */}
                <section id="content">
                    {/* NAVBAR */}
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
                    {/* NAVBAR */}
                    {/* MAIN */}
                    <main>
                        <h2 style={styles.title}>User Management</h2>
                        <br></br>
                        <div style={styles.container}>
                            <table className="advanced-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone Number</th>
                                        <th>Joined</th>
                                        <th>Type</th>
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
                                                <button className="view-button" onClick={() => viewDetails(reg)}>
                                                    View
                                                </button>
                                                
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </main>
                    {/* MAIN */}
                </section>
                {/* CONTENT */}
            </div>
        </>
    );
};

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
        margin: "20px auto",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
    },
};

export default UserManagement;