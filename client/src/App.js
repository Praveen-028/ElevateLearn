import { Route, Routes } from "react-router-dom";
import { Login, Signup,Dashboard,Profile,QuizPage,Instructions,Testpage,ResultPage,Statistics,QuizComparison,QuizDetails,QuizResults } from "./pages";
import Home from "./pages/Home";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Profile" element={<Profile/>}/>
        <Route path="/QuizPage" element={<QuizPage />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/Testpage" element={<Testpage/>}/>
        <Route path="/ResultsPage" element={<ResultPage/>}/>
        <Route path="/statistics" element={<Statistics/>}/>
        <Route path="/QuizComparison" element={<QuizComparison/>}/>
        <Route path="/quizdetails" element={<QuizDetails/>}/>
        <Route path="/quizresults" element={<QuizResults/>}/>
        
      </Routes>    
    </div>
  );
}

export default App;
