import React from "react";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useRoutes } from "./routes";

const App = () => {
    const isAuthenticated = false; 
    const routes = useRoutes(isAuthenticated); 

    return (
        <BrowserRouter>
            <Header isAuthenticated={isAuthenticated} /> 
            <div>{routes}</div>
            <Footer />
        </BrowserRouter>
    );
};

export default App;
