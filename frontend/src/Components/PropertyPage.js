import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PropertyPage = () => {
    const [formData, setFormData] = useState({
        mainPropertyId: '',
        lesserProperties: '',
        address: '',
        price: '',
        type: 'Apartment',
        isNewBuild: false,
        isAgriculturalLand: false,
        preemptionRight: false,
        sellingPriceProperty: '',
        sellingPriceEquipment: '',
        sellingPriceOther: '',
        equipmentIncluded: '',
    });

    //const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };
    const [message, setMessage] = useState('');
    const [userRole, setUserRole] = useState(null); // Store user role
    const [loading, setLoading] = useState(true); // To handle loading state

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchMode, setSearchMode] = useState('name');

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/session', {
                    withCredentials: true,
                });
                setUserRole(response.data.role);
            } catch (error) {
                console.error('Error fetching user role:', error);
                setUserRole(null); // In case of error, no role
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Parse lesserProperties and equipmentIncluded into arrays
            const parsedData = {
                ...formData,
                lesserProperties: formData.lesserProperties
                    ? formData.lesserProperties.split(',').map((id) => id.trim())
                    : [],
                equipmentIncluded: formData.equipmentIncluded
                    ? formData.equipmentIncluded.split(',').map((item) => item.trim())
                    : [],
                price: parseFloat(formData.price),
                sellingPrice: {
                    property: parseFloat(formData.sellingPriceProperty) || 0,
                    equipment: parseFloat(formData.sellingPriceEquipment) || 0,
                    other: parseFloat(formData.sellingPriceOther) || 0,
                },
            };

            // Remove redundant fields before sending
            delete parsedData.sellingPriceProperty;
            delete parsedData.sellingPriceEquipment;
            delete parsedData.sellingPriceOther;

            const response = await axios.post('http://localhost:3001/api/property', parsedData);
            setMessage(`Property created successfully: ${response.data.property.mainPropertyId}`);
            setError('');
            // Reset the form
            setFormData({
                mainPropertyId: '',
                lesserProperties: '',
                address: '',
                price: '',
                type: 'Apartment',
                isNewBuild: false,
                isAgriculturalLand: false,
                preemptionRight: false,
                sellingPriceProperty: '',
                sellingPriceEquipment: '',
                sellingPriceOther: '',
                equipmentIncluded: '',
            });
        } catch (error) {
            console.error('Error creating property:', error);
            setMessage('');
            setError('Failed to create property. Please check your input.');
        }
    };
    const handleSearch = async () => {
        try {
            const endpoint =
                searchMode === 'name'
                    ? 'http://localhost:3001/api/property/searchProperties'
                    : 'http://localhost:3001/api/property/agentProperties';

            const response = await axios.post(
                endpoint,
                searchMode === 'name' ? { query: searchQuery } : {},
                { withCredentials: true }
            );
            setSearchResults(response.data || []);
        }
        catch (error) {
            console.error('Error searching properties: ', error);
            setSearchResults([]);
        }
    }

    useEffect(() => {
        const fetchResults = async() => {
            if(searchQuery.length > 0) {
                try{
                    const response = await axios.post(
                        'http://localhost:3001/api/property/searchProperties',
                        { query: searchQuery },
                        { withCredentials: true }
                    );
                    setSearchResults(response.data || []);
                }
                catch (error) {
                    console.error('Error fetching search results: ', error);
                    setSearchResults([]);
                }
            }
            else {
                setSearchResults([]);
            }
        };

        const delayedFetch = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(delayedFetch);
    }, [searchQuery, searchMode]);

    if (loading) {
        return <div>Loading...</div>; // Display a loading message while fetching user role
    }

    if (userRole === 'odvetnik') {
        return (
            <div className='page-container'>
                <div className="restricted-container">
                    <div className='search-container'>
                    <h2 className='form-header'>Property Search</h2>
                    <div className='search-options'>
                        <label>
                            <input
                                type="radio"
                                name="searchMode"
                                value="name"
                                checked={searchMode === 'name'}
                                onChange={() => setSearchMode('name')}
                            />
                            Search by Address
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="searchMode"
                                value="name"
                                checked={searchMode === 'agent'}
                                onChange={() => setSearchMode('agent')}
                            />
                            Search by Logged-in Agent
                        </label>
                    </div>

                    {searchMode === 'name' && (
                        <input
                            type='text'
                            placeholder='Search properties by address...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    )}

                    {searchMode === 'agent' && (
                    <button onClick={handleSearch} className='button-primary'>
                        Search
                    </button>
                    )}

                    {searchResults.length > 0 && (
                        <div className='search-results'>
                            <h2>Search Results</h2>
                            <ul>
                                {searchResults.map((property) => (
                                    <li key={property._id}>
                                        <strong>Property Name: </strong> {property.mainPropertyId} <br />
                                        <strong>Property Address: </strong> {property.address} <br />
                                        <strong>Price: </strong> {property.price} <br />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {searchQuery.length > 0 && searchResults.length === 0 && (
                        <p>No results found for "{searchQuery}"</p>
                    )}
                </div>
            </div>
        </div>
        );
    }

    return (
        <div className='page-container'>

            <div className='form-container'>
                <h1 className='form-header'>Property Registration</h1>
                {message && <p className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label>
                            Main Property ID:</label>
                        <input
                            type="text"
                            name="mainPropertyId"
                            value={formData.mainPropertyId}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>
                            Lesser Property IDs (comma-separated):</label>
                        <input
                            type="text"
                            name="lesserProperties"
                            value={formData.lesserProperties}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label>
                            Address:</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>
                            Price:</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label >
                            Type:</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="Apartment">Apartment</option>
                            <option value="House">House</option>
                            <option value="Land">Land</option>
                            <option value="Commercial">Commercial</option>
                        </select>
                    </div>
                    <div className='form-group'>
                        <label>
                            Is New Build:</label>
                        <input
                            type="checkbox"
                            name="isNewBuild"
                            checked={formData.isNewBuild}
                            onChange={handleChange}
                            style={{
                                marginRight: '10px',
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>
                    <div className='form-group'>
                        <label>
                            Is Agricultural Land:</label>
                        <input
                            type="checkbox"
                            name="isAgriculturalLand"
                            checked={formData.isAgriculturalLand}
                            onChange={handleChange}
                            style={{
                                marginRight: '10px',
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Preemption Right:</label>
                        <input
                            type="checkbox"
                            name="preemptionRight"
                            checked={formData.preemptionRight}
                            onChange={handleChange}
                            style={{
                                marginRight: '10px',
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>
                    <div className='form-group'>
                        <label>
                            Selling Price (Property):</label>
                        <input
                            type="number"
                            name="sellingPriceProperty"
                            value={formData.sellingPriceProperty}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label>
                            Selling Price (Equipment):</label>
                        <input
                            type="number"
                            name="sellingPriceEquipment"
                            value={formData.sellingPriceEquipment}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Selling Price (Other):</label>
                        <input
                            type="number"
                            name="sellingPriceOther"
                            value={formData.sellingPriceOther}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='form-group'>
                        <label>
                            Equipment Included (comma-separated):</label>
                        <input
                            type="text"
                            name="equipmentIncluded"
                            value={formData.equipmentIncluded}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="login" className='button-primary'>
                        Add property
                    </button>
                </form>
            </div>
            <div className='search-container'>
                <h2 className='form-header'>Property Search</h2>
                <div className='search-options'>
                    <label>
                        <input
                            type="radio"
                            name="searchMode"
                            value="name"
                            checked={searchMode === 'name'}
                            onChange={() => setSearchMode('name')}
                        />
                        Search by Address
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="searchMode"
                            value="name"
                            checked={searchMode === 'agent'}
                            onChange={() => setSearchMode('agent')}
                        />
                        Search by Logged-in Agent
                    </label>
                </div>

                {searchMode === 'name' && (
                    <input
                        type='text'
                        placeholder='Search properties by address...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                )}

                {searchMode === 'agent' && (
                    <button onClick={handleSearch} className='button-primary'>
                        Search
                    </button>
                )}
                
                {searchResults.length > 0 && (
                    <div className='search-results'>
                        <h2>Search Results</h2>
                        <ul>
                            {searchResults.map((property) => (
                                <li key={property._id}>
                                    <strong>Property Name: </strong> {property.mainPropertyId} <br />
                                    <strong>Property Address: </strong> {property.address} <br />
                                    <strong>Price: </strong> {property.price} <br />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {searchQuery.length > 0 && searchResults.length === 0 && (
                    <p>No results found for "{searchQuery}"</p>
                )}
            </div>
        </div>
    );
};

export default PropertyPage;
