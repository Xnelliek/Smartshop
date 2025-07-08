import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaStore, FaUser } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { getToken } from '../../utils/auth';

type Shop = {
  id: number;
  name: string;
  location: string;
  products_count: number;
};

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch('http://localhost:8000/api/shops/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch shops: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setShops(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load shops';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shop?')) return;
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`http://localhost:8000/api/shops/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete shop: ${response.status} ${response.statusText}`);
      }
      
      setShops(shops.filter(shop => shop.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete shop';
      setError(errorMessage);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Shops</h1>
        <Link
          to="/shops/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          aria-label="Add new shop"
        >
          <FaPlus className="mr-2" /> Add Shop
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shops.map((shop) => (
              <tr key={shop.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FaStore className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" />
                    <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shop.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shop.products_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/shops/${shop.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    aria-label={`Edit shop ${shop.name}`}
                  >
                    <FaEdit />
                  </Link>
                  <button
                    onClick={() => handleDelete(shop.id)}
                    className="text-red-600 hover:text-red-900"
                    aria-label={`Delete shop ${shop.name}`}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Shops;