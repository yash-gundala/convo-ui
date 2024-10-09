import { useRoutes } from "react-router-dom";
// import SideBar from "./components/SideBar/SideBar";
import Home from "./pages/Home/Home";
// import { AuthProvider } from '../src/pages/Login/AuthContext'
import Monitor from "./pages/Monitor/Monitor";


// import TranscriptionApp from "./pages/Transcription/TranscriptionApp";


const Router = () => {

    const routes = useRoutes([
      {
        path: "",
        // element:<SideBar/>,
        children: [
         
         

         
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "monitor",
            element: <Monitor />,
          },
         
          
         
         
          
        ],
      },
    ]);
    return routes;
}
// export default Router;

export default function AppRouter() {
    return (
      // <AuthProvider>
        <Router />
      // </AuthProvider>
    );
  }