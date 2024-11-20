import React, { useEffect, useState } from 'react';

function App() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api')  // Fetch from the Express server
            .then((res) => res.json())
            .then((data) => setData(data.message));
    }, []);

    return (
        <div>
            <h1>React + Express Example</h1>
            <p>{data ? data : "Loading..."}</p>
        </div>
    );
}

export default App;
