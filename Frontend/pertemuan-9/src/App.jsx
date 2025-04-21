import { useState } from 'react'
import Greeting from './components/Greeting';
import ProductList from './components/ProductList';
import './App.css'

function App() {
  return (
    <div>
      <h1>React Frontend - Pertemuan 9</h1>
      <Greeting name="Mahasiswa" />
      <ProductList />
    </div>
  );
}

export default App
