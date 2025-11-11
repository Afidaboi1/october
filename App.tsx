import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Create a private route component
const PrivateRoute: React.FC<{ path: string; component: React.ComponentType<any> }> = ({
  component: Component,
  ...rest
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Switch>
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            {/* Uncomment these when the components are ready */}
            {/* <PrivateRoute path="/subjects" component={SubjectsPage} /> */}
            {/* <PrivateRoute path="/quiz/:subjectId" component={QuizPage} /> */}
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </Switch>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;