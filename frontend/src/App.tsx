import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BasketProvider } from './context/BasketContext';
import LandingScreen from './screens/LandingScreen';
import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import BasketScreen from './screens/BasketScreen';
import AllProductsScreen from './screens/AllProductsScreen';

function App() {
  return (
    <BasketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/products" element={<AllProductsScreen />} />
          <Route path="/category/:id" element={<CategoryScreen />} />
          <Route path="/basket" element={<BasketScreen />} />
        </Routes>
      </BrowserRouter>
    </BasketProvider>
  );
}

export default App;
