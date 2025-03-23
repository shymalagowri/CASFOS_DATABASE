import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/login"; // Adjust the path to your Login component
import Register from "./components/register"; // Adjust the path to your Register component
import Home from './components/home';
import Dashboard from "./components/admindashboard";
import AssetManagement from "./components/assetentry";
import UserApproval from "./components/adminuserapproval";
import DataDashboard from "./components/dataentrydashboard";
import AssetApproval from "./components/adminassetapproval";
import FacultyApproval from "./components/adminfacultyapproval";
import ViewFaculty from "./components/viewfaculty";
import ViewAsset from "./components/viewasset";
import ViewerDashboard from "./components/viewerdashboard";
import FacultyManagement from "./components/facultyentry";
import RejectedAsset from "./components/rejectedassets";
import Analytics from "./components/analytics";
import Ui from "./components/ui";
import FacultyUpdation from "./components/facultyupdation";
import UpdateFacultyEntry from "./components/updatefacultyentry";
import UserManagement from "./components/usermanagement";
import AdminAssetView from "./components/adminassetview";
import AdminFacultyView from "./components/adminfacultyview";
import AssetStore from "./components/AssetStore";
import AssetIssue from "./components/AssetIssue";
import AssetReturn from "./components/AssetReturn";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admindashboard" element={<Dashboard/>} />
        <Route path="/assetentry" element={<AssetManagement/>} />
        <Route path="/adminuserapproval" element={<UserApproval/>} />
        <Route path="/adminassetapproval" element={<AssetApproval/>} />
        <Route path="/adminassetview" element={<AdminAssetView/>} />
        <Route path="/adminfacultyview" element={<AdminFacultyView/>} />

        <Route path="/dataentrydashboard" element={<DataDashboard/>} />
        <Route path="/viewasset" element={<ViewAsset/>} />
        <Route path="/viewfaculty" element={<ViewFaculty/>} />
        <Route path="/viewerdashboard" element={<ViewerDashboard/>} />
        <Route path="/facultyentry" element={<FacultyManagement/>} />
        <Route path="/adminfacultyapproval" element={<FacultyApproval/>} />
        <Route path="/rejectedassets" element={<RejectedAsset/>} />
        <Route path="/analytics" element={<Analytics/>} />
        <Route path="/facultyupdation" element={<FacultyUpdation/>} />
        <Route path="/updatefacultyentry" element={<UpdateFacultyEntry/>} />
        <Route path="/usermanagement" element={<UserManagement/>} />
        <Route path="/ui" element={<Ui/>} />
        <Route path="/assetstore" element={<AssetStore />} />
        <Route path="/assetissue" element={<AssetIssue />} />
        <Route path="/assetreturn" element={<AssetReturn />} />
      </Routes>
    </Router>
  );
}

export default App;
