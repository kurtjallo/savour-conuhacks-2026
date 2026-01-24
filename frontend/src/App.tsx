import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BasketProvider } from './context/BasketContext';
import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import BasketScreen from './screens/BasketScreen';

function App() {
  return (
    <BasketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/category/:id" element={<CategoryScreen />} />
          <Route path="/basket" element={<BasketScreen />} />
        </Routes>
      </BrowserRouter>
    </BasketProvider>
  );
}

export default App;
