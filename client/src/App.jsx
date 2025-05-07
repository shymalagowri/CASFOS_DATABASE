import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/login"; 
import Register from "./components/register"; 
import Dashboard from "./components/admindashboard";
import UserApproval from "./components/hoouserapproval";
import DataDashboard from "./components/storekeeperdashboard";
import AssetApproval from "./components/adminassetapproval";
import FacultyApproval from "./components/hoofacultyapproval";
import ViewFaculty from "./components/viewfaculty";
import ViewAsset from "./components/viewasset";
import ViewerDashboard from "./components/viewerdashboard";
import FacultyManagement from "./components/facultyentry";
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
import FacultyverifierFacultyView from "./components/facultyverifierfacultyview";
import PrincipalFacultyView from "./components/principalfacultyview";
import PrincipalAssetView from "./components/principalassetview";
import ManagerAssetView from "./components/managerassetview";
import StorekeeperAssetUpdation from "./components/storekeeperassetupdation";
import PrincipalAssetUpdation from "./components/PrincipalAssetUpdation";
import PrincipalDashboard from "./components/principaldashboard";
import StorekeeperDashboard from "./components/storekeeperdashboard";
import AssetManagerDashboard from "./components/assetmanagerdashboard";
import FacultyverifierDashboard from "./components/facultyverifierdashboard";
import FacultyEntryStaffDashboard from "./components/facultyentrystaffdashboard";
import UpdateFacultyEntryPrincipal from "./components/updatefacultyentryprincipal";
import UpdateFacultyEntryHoo from "./components/updatefacultyentryhoo";
import AddConduct from './components/addconduct';
import AssetView from "./components/ViewerAssetview";
import FacultyView from "./components/Viewerfacultyview";
import Mainpage from "./components/mainpage";
import HOOAssetApproval from "./components/hooassetapproval"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admindashboard" element={<Dashboard/>} />
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

        <Route path="/usermanagement" element={<UserManagement/>} />
        <Route path="/ui" element={<Ui/>} />
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
