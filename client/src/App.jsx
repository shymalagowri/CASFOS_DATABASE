import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/login"; 
import Register from "./components/register"; 
import Home from './components/home';
import Dashboard from "./components/admindashboard";
import AssetManagement from "./components/assetentry";
import UserApproval from "./components/hoouserapproval";
import DataDashboard from "./components/assetentrystaffdashboard";
import AssetApproval from "./components/adminassetapproval";
import FacultyApproval from "./components/hoofacultyapproval";
import ViewFaculty from "./components/viewfaculty";
import ViewAsset from "./components/viewasset";
import ViewerDashboard from "./components/viewerdashboard";
import FacultyManagement from "./components/facultyentry";
import RejectedAsset from "./components/rejectedassets";
import Analytics from "./components/analytics";
import Ui from "./components/ui";
import FacultyVerify from "./components/facultyverify";
import FacultyUpdation from "./components/hoofacultyupdation";
import UpdateFacultyEntry from "./components/updatefacultyentry";
import UserManagement from "./components/usermanagement";
import HOOAssetView from "./components/hooassetview";
import AdminFacultyView from "./components/hoofacultyview";
import AssetStore from "./components/AssetStore";
import AssetIssue from "./components/AssetIssue";
import AssetUpdation from "./components/AssetUpdation";
import AssetReturn from "./components/AssetReturn";
import HOODashboard from "./components/headofofficedashboard";
import PrincipalFacultyUpdation from "./components/principalfacultyupdation";
import SuperintendentFacultyView from "./components/superintendentfacultyview";
import PrincipalFacultyView from "./components/principalfacultyview";
import PrincipalAssetView from "./components/principalassetview";
import ManagerAssetView from "./components/managerassetview";
import PrincipalAssetUpdation from "./components/PrincipalAssetUpdation";
import PrincipalDashboard from "./components/principaldashboard";
import AssetEntryStaffDashboard from "./components/assetentrystaffdashboard";
import AssetManagerDashboard from "./components/assetmanagerdashboard";
import SuperintendentDashboard from "./components/superintendentdashboard";
import FacultyEntryStaffDashboard from "./components/facultyentrystaffdashboard";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admindashboard" element={<Dashboard/>} />
        <Route path="/assetentry" element={<AssetManagement/>} />
        <Route path="/hoouserapproval" element={<UserApproval/>} />
        <Route path="/adminassetapproval" element={<AssetApproval/>} />
        <Route path="/hooassetview" element={<HOOAssetView/>} />
        <Route path="/principalassetview" element={<PrincipalAssetView/>} />
        <Route path="/managerassetview" element={<ManagerAssetView/>} />
        <Route path="/facultyverify" element={<FacultyVerify/>} />
        <Route path="/principaldashboard" element={<PrincipalDashboard/>} />
        <Route path="/assetentrystaffdashboard" element={<AssetEntryStaffDashboard/>} />
        <Route path="/facultyentrystaffdashboard" element={<FacultyEntryStaffDashboard/>} />
        <Route path="/assetmanagerdashboard" element={<AssetManagerDashboard/>} />
        <Route path="/superintendentdashboard" element={<SuperintendentDashboard/>} />
        <Route path="/hoofacultyview" element={<AdminFacultyView/>} />
        <Route path="/superintendentfacultyview" element={<SuperintendentFacultyView/>} />
        <Route path="/principalfacultyview" element={<PrincipalFacultyView/>} />

        <Route path="/dataentrydashboard" element={<DataDashboard/>} />
        <Route path="/viewasset" element={<ViewAsset/>} />
        <Route path="/viewfaculty" element={<ViewFaculty/>} />
        <Route path="/viewerdashboard" element={<ViewerDashboard/>} />
        <Route path="/facultyentry" element={<FacultyManagement/>} />
        <Route path="/hoofacultyapproval" element={<FacultyApproval/>} />
        
        <Route path="/rejectedassets" element={<RejectedAsset/>} />
        <Route path="/analytics" element={<Analytics/>} />
        <Route path="/principalfacultyupdation" element={<PrincipalFacultyUpdation/>} />

        <Route path="/hoofacultyupdation" element={<FacultyUpdation/>} />
        <Route path="/updatefacultyentry" element={<UpdateFacultyEntry/>} />
        <Route path="/usermanagement" element={<UserManagement/>} />
        <Route path="/ui" element={<Ui/>} />
        <Route path="/assetstore" element={<AssetStore />} />
        <Route path="/assetissue" element={<AssetIssue />} />
        <Route path="/assetreturn" element={<AssetReturn />} />
        <Route path = "/assetupdation" element={<AssetUpdation/>}/>
        <Route path = "/principalassetupdation" element={<PrincipalAssetUpdation/>}/>

        <Route path= "/headofofficedashboard" element={<HOODashboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
