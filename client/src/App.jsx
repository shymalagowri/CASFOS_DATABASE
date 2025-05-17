import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login"; 
import Register from "./components/Register"; 
import UserApproval from "./components/HooUserApproval";
import DataDashboard from "./components/StorekeeperDashboard";
import AssetApproval from "./components/AdminAssetApproval";
import FacultyApproval from "./components/HooFacultyApproval";
import ViewFaculty from "./components/ViewFaculty";
import ViewAsset from "./components/ViewAsset";
import ViewerDashboard from "./components/ViewerDashboard";
import FacultyManagement from "./components/FacultyEntry";
import FacultyVerify from "./components/FacultyVerify";
import FacultyUpdation from "./components/HooFacultyUpdation";
import UpdateFacultyEntry from "./components/UpdateFacultyEntry";
import HOOAssetView from "./components/HooAssetView";
import AdminFacultyView from "./components/HooFacultyView";
import AssetStore from "./components/AssetStore";
import AssetIssue from "./components/AssetIssue";
import AssetUpdation from "./components/AssetUpdation";
import AssetReturn from "./components/AssetReturn";
import HOODashboard from "./components/HeadOfOfficeDashboard";
import PrincipalFacultyUpdation from "./components/PrincipalFacultyUpdation";
import FacultyverifierFacultyView from "./components/FacultyVerifierFacultyView";
import PrincipalFacultyView from "./components/PrincipalFacultyView";
import PrincipalAssetView from "./components/PrincipalAssetView";
import ManagerAssetView from "./components/ManagerAssetView";
import StorekeeperAssetUpdation from "./components/StorekeeperAssetUpdation";
import PrincipalAssetUpdation from "./components/PrincipalAssetUpdation";
import PrincipalDashboard from "./components/PrincipalDashboard";
import StorekeeperDashboard from "./components/StorekeeperDashboard";
import AssetManagerDashboard from "./components/assetmanagerdashboard";
import FacultyverifierDashboard from "./components/FacultyVerifierDashboard";
import FacultyEntryStaffDashboard from "./components/FacultyEntryStaffDashboard";
import UpdateFacultyEntryPrincipal from "./components/UpdateFacultyEntryPrincipal";
import UpdateFacultyEntryHoo from "./components/UpdateFacultyEntryHoo";
import AddConduct from "./components/AddConduct";
import AssetView from "./components/ViewerAssetView";
import FacultyView from "./components/ViewerFacultyView";
import Mainpage from "./components/MainPage";
import HOOAssetApproval from "./components/HooAssetApproval"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hoouserapproval" element={<UserApproval/>} />
        <Route path="/adminassetapproval" element={<AssetApproval/>} />
        <Route path="/hooassetview" element={<HOOAssetView/>} />
        <Route path="/principalassetview" element={<PrincipalAssetView/>} />
        <Route path="/viewerassetview" element={< AssetView/>}/>
        <Route path="/viewerfacultyview" element={< FacultyView/>}/>
        <Route path="/" element ={<Mainpage/>} />
        <Route path="/managerassetview" element={<ManagerAssetView/>} />
        <Route path="/facultyverify" element={<FacultyVerify/>} />
        <Route path="/principaldashboard" element={<PrincipalDashboard/>} />
        <Route path="/storekeeperdashboard" element={<StorekeeperDashboard/>} />
        <Route path="/facultyentrystaffdashboard" element={<FacultyEntryStaffDashboard/>} />
        <Route path="/assetmanagerdashboard" element={<AssetManagerDashboard/>} />
        <Route path="/facultyverifierdashboard" element={<FacultyverifierDashboard/>} />
        <Route path="/hoofacultyview" element={<AdminFacultyView/>} />
        <Route path="/facultyverifierfacultyview" element={<FacultyverifierFacultyView/>} />
        <Route path="/principalfacultyview" element={<PrincipalFacultyView/>} />
        <Route path ="/hooassetapproval" element={<HOOAssetApproval/>}/>
        <Route path="/dataentrydashboard" element={<DataDashboard/>} />
        <Route path="/viewasset" element={<ViewAsset/>} />
        <Route path="/viewfaculty" element={<ViewFaculty/>} />
        <Route path="/viewerdashboard" element={<ViewerDashboard/>} />
        <Route path="/facultyentry" element={<FacultyManagement/>} />
        <Route path="/hoofacultyapproval" element={<FacultyApproval/>} />
        
        <Route path="/principalfacultyupdation" element={<PrincipalFacultyUpdation/>} />

        <Route path="/hoofacultyupdation" element={<FacultyUpdation/>} />
        <Route path="/updatefacultyentry" element={<UpdateFacultyEntry/>} />
        <Route path="/updatefacultyentryhoo" element={<UpdateFacultyEntryHoo/>} />
        <Route path="/updatefacultyentryprincipal" element={<UpdateFacultyEntryPrincipal/>} />
        <Route path="/storekeeperassetupdation" element={<StorekeeperAssetUpdation/>} />

        <Route path="/assetstore" element={<AssetStore />} />
        <Route path="/assetissue" element={<AssetIssue />} />
        <Route path="/assetreturn" element={<AssetReturn />} />
        <Route path = "/assetupdation" element={<AssetUpdation/>}/>
        <Route path = "/principalassetupdation" element={<PrincipalAssetUpdation/>}/>
        <Route path="/addconduct/:facultyId" element={<AddConduct />} />

        <Route path= "/headofofficedashboard" element={<HOODashboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
