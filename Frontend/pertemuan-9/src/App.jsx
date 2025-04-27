import { useState } from 'react'
import './App.css'
import Greeting from './components/Greeting';
import ProductList from './components/ProductList';
import Mahasiswa from './components/Mahasiswa';
import PostList from './components/PostList';
function App() {
  return (
    <div>
      <h1>React Frontend - Pertemuan 9</h1>
      <Greeting name="Mahasiswa" />
      <ProductList />
      <Mahasiswa nama="Yona Cantika" npm="3124522001" prodi="Teknik Informatika" />
      <PostList />
    </div>
  );
}

export default App
