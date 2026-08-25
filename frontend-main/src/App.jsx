import { AllRoutes } from "./routes/AllRoutes";
import { SideMenu } from "./components/SideMenu";
import { TopMenu } from './components/TopMenu';
import { ToastContainer } from "react-toastify";

function App() {

  return (
    <>
      <ToastContainer />
      <TopMenu />
      <div className="main-container">
        <SideMenu />
        <AllRoutes />
      </div>
    </>
  )
}

export default App
