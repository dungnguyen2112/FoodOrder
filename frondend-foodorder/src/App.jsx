import React, { useEffect, useState } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import BookPage from './pages/book';
import ContactPage from './pages/contact';
import LoginPage from './pages/login';
import { Outlet } from "react-router-dom";
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import RegisterPage from './pages/register';
import { callFetchAccount } from './services/api';
import { useDispatch, useSelector } from 'react-redux';
import { doGetAccountAction } from './redux/account/accountSlice';
import Loading from './components/Loading';
import NotFound from './components/NotFound';
import AdminPage from './pages/admin';
import ProtectedRoute from './components/ProtectedRoute';
import LayoutAdmin from './components/Admin/LayoutAdmin';
import './styles/reset.scss';
import './styles/global.scss';
import ManageUserPage from './pages/admin/user';
import ManageBookPage from './pages/admin/book';
import OrderPage from './pages/order';
import HistoryPage from './pages/history';
import AdminOrderPage from './pages/admin/order';
import ManageCategoryPage from './pages/admin/category';
import AdminTablePage from './pages/admin/table';
import ResetPassword from './pages/reset-password/ResetPassword';
import FooterLandingPage from './landingpage/Footerlandingpage/Footerlandingpage';
import Contact from './landingpage/Contactlandingpage/Contactlandingpage';
import About from './landingpage/Aboutlandingpage/Aboutlandingpage';
import HeaderLandingPage from './landingpage/Headerlandingpage/Headerlandingpage';
import Testimonials from './landingpage/Testimonialslandingpage/Testimoniallandingpage';
import { FaArrowAltCircleUp } from 'react-icons/fa';
import Menu from './landingpage/Menulandingpage/Menulandingpage';
import HomeLandingPage from './landingpage/Homelandingpage/Homelandingpage';
import './landingpage/App.scss';


const Layout = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className='layout-app'>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Outlet context={[searchTerm, setSearchTerm]} />
      <Footer />
    </div>
  )
}

const LandingPageLayout = () => {
  const topOfThePagehander = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };
  return (
    <div>
      <FaArrowAltCircleUp
        className="Top-of-the-page"
        onClick={topOfThePagehander}
      />
      <HeaderLandingPage />
      <HomeLandingPage />
      <About />
      <Menu />
      <Testimonials />
      <Contact />
      <FooterLandingPage />
    </div>
  );
};


export default function App() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.account.isLoading);

  const cleanGoogleStorage = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("g_") || key.includes("google")) {
        localStorage.removeItem(key);
      }
    });
  };

  const getAccount = async () => {
    if (window.location.pathname === "/login" || window.location.pathname === "/register") {
      return;
    }

    const token = localStorage.getItem("access_token");
    console.log("Token on load:", token);
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await callFetchAccount();
      console.log("getAccount response:", res);
      if (res && res.data) {
        dispatch(doGetAccountAction(res.data));
      } else if (res && res.status === 403) {
        dispatch(doGetAccountAction({ roleId: null, permissions: [] }));
      } else if (res && res.status === 401) {
        localStorage.removeItem("access_token");
        cleanGoogleStorage(); // Xóa dữ liệu Google
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error fetching account:", error);
      if (error?.response?.status === 401 || error?.response?.request?.responseURL?.includes("accounts.google.com")) {
        localStorage.removeItem("access_token");
        cleanGoogleStorage();
        window.location.href = "/login";
      }
    }
  };


  useEffect(() => {
    getAccount();
  }, [])

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <NotFound />,
      children: [
        { index: true, element: <Home /> },
        {
          path: "contact",
          element: <ContactPage />,
        },
        {
          path: "book/:slug",
          element: <BookPage />,
        },
        {
          path: "order",
          element:
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          ,
        },
        {
          path: "history",
          element:
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          ,
        },
      ],
    },

    {
      path: "/landingpage",
      element: <LandingPageLayout />,
      errorElement: <NotFound />,
    },

    {
      path: "/admin",
      element: <LayoutAdmin />,
      errorElement: <NotFound />,
      children: [
        {
          index: true, element:
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
        },
        {
          path: "user",
          element:
            <ProtectedRoute>
              <ManageUserPage />
            </ProtectedRoute>
          ,
        },
        {
          path: "category",
          element:
            <ProtectedRoute>
              <ManageCategoryPage />
            </ProtectedRoute>
        },
        {
          path: "book",
          element:
            <ProtectedRoute>
              <ManageBookPage />
            </ProtectedRoute>
          ,
        },
        {
          path: "order",
          element:
            <ProtectedRoute>
              <AdminOrderPage />
            </ProtectedRoute>
          ,
        },
        {
          path: "table",
          element:
            <ProtectedRoute>
              <AdminTablePage />
            </ProtectedRoute>
        },
      ],
    },


    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },

    {
      path: "/reset-password",
      element: <ResetPassword />,
    }
  ]);

  return (
    <>
      {
        isLoading === false
          || window.location.pathname === '/login'
          || window.location.pathname === '/register'
          || window.location.pathname === '/landingpage'
          || window.location.pathname.startsWith('/')
          || window.location.pathname.startsWith('/book')
          ?
          <RouterProvider router={router} />
          :
          <Loading />
      }
    </>
  )
}
