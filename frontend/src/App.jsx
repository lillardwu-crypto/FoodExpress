import { BrowserRouter } from "react-router-dom";

import Navbar from "./components/Navbar";
import AppRoutes from "./router/AppRoutes";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                <Navbar />
                <AppRoutes />
            </div>
        </BrowserRouter>
    );
}

export default App;