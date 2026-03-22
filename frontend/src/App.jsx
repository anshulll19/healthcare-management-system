import HealthEntryForm from './components/HealthEntryForm';
import './App.css';

function App() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>
        Healthcare Management System
      </h1>
      
      {/* This line renders the form you built! */}
      <HealthEntryForm />
      
    </div>
  );
}

export default App;