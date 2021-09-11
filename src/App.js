import './App.css';
import {
  BrowserRouter as Router,
} from 'react-router-dom';

//contains the list of all the routes
import RouteList from './routes'

function App() {
  return (
    <Router>
    <div className="App">
    <RouteList/>
    </div>
    </Router>
  );
}

export default App;
