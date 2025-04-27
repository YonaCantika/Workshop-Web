import { useEffect, useState } from 'react';
import axios from 'axios';
function PostList() {
    const [posts, setPosts] = useState([]);
    useEffect(() => {

        axios.get('https://jsonplaceholder.typicode.com/posts?_limit=10')
            .then(res => setPosts(res.data));
    }, []);
    return (
        <div>
            <h3>Postingan:</h3>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>{post.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default PostList;