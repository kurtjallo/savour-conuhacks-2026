/**
 * Copyright (c) 2026 Savour. All Rights Reserved.
 *
 * This software and associated documentation files are proprietary and confidential.
 * Unauthorized copying, distribution, modification, or use of this software,
 * via any medium, is strictly prohibited without express written permission from Savour.
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BasketProvider } from './context/BasketContext';
import { TourProvider } from './context/TourContext';
import LandingScreen from './screens/LandingScreen';
import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import BasketScreen from './screens/BasketScreen';
import AllProductsScreen from './screens/AllProductsScreen';
import FloatingBasketButton from './components/FloatingBasketButton';
import FloatingStoreMap from './components/FloatingStoreMap';

function FloatingElements() {
  const location = useLocation();
  // Show floating elements on main browsing pages, not on landing or basket
  const showMap = !['/'].includes(location.pathname);

  return (
    <>
      <FloatingBasketButton />
      {showMap && <FloatingStoreMap />}
    </>
  );
}

function App() {
  return (
    <TourProvider>
      <BasketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingScreen />} />
            <Route path="/onboarding" element={<HomeScreen />} />
            <Route path="/products" element={<AllProductsScreen />} />
            <Route path="/category/:id" element={<CategoryScreen />} />
            <Route path="/basket" element={<BasketScreen />} />
          </Routes>
          <FloatingElements />
        </BrowserRouter>
      </BasketProvider>
    </TourProvider>
  );
}

export default App;
