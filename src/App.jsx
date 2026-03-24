import React from "react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate,useParams, useLocation, useNavigate  } from "react-router-dom"; 
import Cookies from "js-cookie";
import "./css/card.css";
import "./css/index.css";

import Header from "./Header";
import Sidebar from "./Sidebar.jsx";
import Home from "./Home";
import ChatPage from "./pages/massages";
import ProfilePage from "./pages/profile";
import SiteSettings from "./pages/SiteSettings";
import JamatManagement from "./sitesetting/Jamat";
import BivagManagement from "./sitesetting/division.jsx";
import SessionManagement from "./sitesetting/session";
import KitabManagement from "./sitesetting/kitab";
import UserManagement from "./sitesetting/Users";
import SiteSetting from "./sitesetting/SiteSetting";
import Verifynew from "./verifynew";
import PrivilegeManager from "./sitesetting/previlize";
import PackageCardsBangla from "./sitesetting/packages";
import AccountManagement from "./pages/accounts";
import StudentDues from "./accounts/StudentDues";
import Betocard from "./accounts/betoncard.jsx";
import StudentsSetting from "./pages/students";
import ActiveStudents from "./student/active";
import SuspendedStudents from "./student/suspend";
import InactiveStudents from "./student/inactive";
import TeacherRegistration from "./teacher/main";
import TeacherForm from "./teacher/teacherRegistrarion";
import Hajira from "./protibedon/hajira.jsx";
import AuthPage from "./Signuplogin";
import Verify from "./verify";
import ResetPassword from "./reset-password";
import NotFound from "./notfound";
import FeeTypes from "./accounts/feestype";
import PublicRoute from "./PublicRoute";
import ManualDueEntry from "./accounts/manualdue";
import RosidManagement from "./accounts/roshid";
import CollectPayment from "./accounts/feecollect";
import Admission from "./pages/admission";
import NewAdmissionForm from "./admission/new-admission";
import DownloadAdmissionPDF from "./admission/pdf"; 
import OldAdmissionForm from "./admission/old-admission";
import Libary from "./libary/BooksList";
import IssuedBooks from "./libary/issuedbooks";
import Pdf_reciet from "./pdf/routereciet";
import PaymentList from "./accounts/paymentlist";
import TeacherView from "./teacher/view.jsx";
import DonationCollection from "./accounts/donation_c";
import DonarList from "./accounts/donar";
import DonationType from "./accounts/donation_type";
import CostType from "./accounts/costtype";
import Shop from "./accounts/shop";
import Idcard from "./student/idcard";
import SheetNumberManagement from "./sitesetting/sheetnumber";
import ExamManagement from "./pages/ExamManagement";
import Protibedon from "./pages/potibedon";
import StudentBiodataView from "./student/view.jsx";
import Homework from "./protibedon/homework.jsx";

import TeacherCorner from "./pages/teacherCorner.jsx";
import AttendancePage from "./teacher_corner/attandance.jsx";
import AttendanceReportPage from "./teacher_corner/attandace_report.jsx";
import TeacherHomeWork from "./teacher_corner/homework.jsx";

import SmsSettings from "./sitesetting/smsmanager.jsx";

import ExamType from "./exam/examtype.jsx";
import SheetPlanPreview from "./exam/sheetplan.jsx";
import FundManagement from "./accounts/fundtype.jsx";
import ReceiptPage from "./accounts/recite.jsx";
import StudentIdPage from "./admission/admissionform.jsx";
import LeaveManagement from "./teacher_corner/leave_giver.jsx";
import SingleStudentAdvanceDue from "./accounts/advance-due.jsx";
import ExamSetup from "./exam/examsetup.jsx";
import ExamSubjects from "./exam/examsubjects.jsx";
import ExamRoutineWrapper from "./exam/examshedul.jsx";
// ✅ Edit Teacher Page Wrapper
function EditTeacherPage() {
  const { id } = useParams(); // URL থেকে id নেওয়া
  return <TeacherForm teacherId={id} />;
}
// ✅ Protected route wrapper
function ProtectedRouteWrapper() {
  const token = Cookies.get("token");

  if (!token) return <Navigate to="/auth" replace />;
  return <Outlet />; // nested routes render here
}


// App.jsx or root layout

function Layout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  const toggleSidebar = () => {
    setOpenSidebar(prev => !prev);
  };

  return (
    <div className="grid-container">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar open={openSidebar} toggleSidebar={toggleSidebar} />
      <Outlet />
    </div>
  );
}

// ✅ Main App
function App() {



  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/auth/verify" element={<PublicRoute><Verify /></PublicRoute>} />
        <Route path="/auth/verifynew/:token" element={<PublicRoute><Verifynew /></PublicRoute>} />
        <Route path="/auth/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRouteWrapper />}>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
          
              <Route path="profile" element={<ProfilePage />} />
              <Route path="messages" element={<ChatPage/>}/>
                  
                  
                  {/* {site sestting page} */}
                    <Route path="site-settings" element={<SiteSettings />} />


                      <Route path="/site-settings/site-setting" element={<SiteSetting />} />
                      <Route path="/site-settings/jamat-management" element={<JamatManagement />} />
                      <Route path="/site-settings/division-management" element={<BivagManagement />} />
                      <Route path="/site-settings/session-management" element={<SessionManagement />} />
                      <Route path="/site-settings/kitab-management" element={<KitabManagement />} />
                      <Route path="/site-settings/user-management" element={<UserManagement />} />
                      <Route path="/site-settings/exam-management" element={<ExamManagement />} />
                      <Route path="/site-settings/user-management/privilege-management/:userId" element={<PrivilegeManager />} />
                      <Route path="/site-settings/package-management" element={<PackageCardsBangla currentUser={{}} />} />
                      <Route  path="/site-settings/sheetnumber" element={<SheetNumberManagement/>} />
                     <Route path="/site-settings/sms-settings" element={<SmsSettings/>} />
                  
                  
                   {/* {site sestting page end } */}
              
              



                      {/* {Accounting sestting page end } */}
                    <Route path="accounting" element={<AccountManagement />} />
                     <Route path="/accounting/fundmanagement" element={<FundManagement />} />
                   
                    <Route path="/accounting/fee-types" element={<FeeTypes />} />
                    <Route path="/accounting/student-dues" element={<StudentDues />} />
                    <Route path="/accounting/student-dues/manual-due-entry" element={<ManualDueEntry />} />
                    <Route path="/accounting/collectfee" element={<CollectPayment />} />
                    <Route path="/accounting/roshid" element={<RosidManagement />} />
                    <Route path="/accounting/roshid-other" element={<ReceiptPage />} />
                   
                    <Route path="/accounting/paymentlist" element={< PaymentList />}/>
                    <Route path="/accounting/donation_type" element={<DonationType/>} />
                    <Route path="/accounting/donation_collection" element={<DonationCollection/>} />
                    <Route path="/accounting/cost_type" element={<CostType/>} />
                    <Route path="/accounting/shop" element={<Shop/>} />
                    <Route path="/accounting/donar_list" element={<DonarList/>} />
                     <Route path="/pdf_reciet/:boinumber/:roshidnumber" element={<Pdf_reciet/>} />
                    <Route path="/accounting/betocard" element={<Betocard/>}/>
                    <Route path="/accounting/single-student-advance-due/:studentId" element={<SingleStudentAdvanceDue />} />
                    {/* {Accounting sestting page end } */}
                    {/* Teacher Management */
                    }

                    <Route path="/teachers" element={<TeacherRegistration />} />
                    <Route path="/teachers/add" element={<TeacherForm />} />
                    <Route path="/teachers/edit/:id" element={<EditTeacherPage />} />
                     <Route path="/teachers/view/:id" element={<TeacherView />} />
            {/* Teacher Management end*/}
            
            
            {/* Student Management */}
                    <Route path="/students" element={<StudentsSetting />} />
                    <Route path="/students/active" element={<ActiveStudents />} />
                    <Route path="/students/suspended" element={<SuspendedStudents />} />
                    <Route path="/students/idcard" element={<Idcard />} />
                    <Route path="/students/inactive" element={<InactiveStudents />} />
                    <Route path="/students/view/:id" element={<StudentBiodataView />} />
            {/* Student Management end*/}
            
            
              {/* protiben start*/}
             
        
            <Route path="report" element={<Protibedon/>} />
              {/* protiben start*/}

              <Route path="/report/hajira" element={<Hajira/>} />
              <Route path="/report/homework-download" element={<Homework/>} />




            {/* protiben end*/}


            
           
           
           
            
           
            

          <Route path="library" element={<Libary />} />
          <Route path="/library/issuedbooks" element={<IssuedBooks />} />
             
        {/* {admission rouse} */}
           
           <Route path="/admission" element={<Admission />}
           />
            <Route path="/admission/new-admission" element={<NewAdmissionForm />}
           />
            <Route path="/admission/admissionform" element={<StudentIdPage />}
           />
           
           <Route path="/admission/old-admission" element={<OldAdmissionForm/>}/>
           
            <Route path="/admission_pdf/:id" element={<DownloadAdmissionPDF/>}/>
          
          {/* {admission rouse} */}


            {/* {TeacherCorner} */}

            <Route path="/teacher_corner" element={<TeacherCorner />} />
            <Route path="/teacher_corner/attendance" element={<AttendancePage />} />
            <Route path="/teacher_corner/attendance-report" element={<AttendanceReportPage />} />
            <Route path="/teacher_corner/leave" element={<LeaveManagement />} />

            <Route path="/teacher_corner/homework-add" element={<TeacherHomeWork />} />

            {/* {end corner} */}
            
            {/* {exam} */}
            <Route path="/exam-management" element={<ExamManagement />} />
            <Route path="/exam-management/examtype" element={<ExamType />} />
            <Route path="/exam-management/sheetplan" element={<SheetPlanPreview />}/>
            <Route path="/exam-management/exam-setup" element={<ExamSetup />}/>
            <Route path="/exam-management/exam-setup/exam-subjects/:exam_setup_id" element={<ExamSubjects />} />
            <Route path="/exam-management/exam-subjects/:exam_setup_id/pdf" element={<ExamRoutineWrapper />} />
            
            



            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
