import "./App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import MainContainer from "./Components/MainContainer";
import Welcome from "./Components/Welcome";
import ChatArea from "./Components/ChatArea";
import Users from "./Components/Users";
import CreateGroups from "./Components/CreateGroups";
import Groups from "./Components/Groups";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import { Provider } from "react-redux";
import store from "./app/store";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="app" element={<MainContainer />}>
              <Route path="welcome" element={<Welcome />} />
              <Route path="chat/:_id" element={<ChatArea />} />
              <Route path="users" element={<Users />} />
              <Route path="groups" element={<Groups />} />
              <Route path="create-groups" element={<CreateGroups />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
