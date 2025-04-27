import { useState, useEffect } from 'react';
import axios from 'axios';
function ProductList() {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        axios.get('https://dummyjson.com/products?limit=5')
            .then((res) => setProducts(res.data.products))
            .catch((err) => console.error(err));
    }, []);
    return (
        <div>
            <h3>Daftar Produk:</h3>
            <ul>
                {products.map((item) => (
                    <li key={item.id}>{item.title} - ${item.price}</li>
                ))}
            </ul>
        </div>
    );
}
export default ProductList;