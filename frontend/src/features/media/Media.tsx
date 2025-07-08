import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { FaImage, FaDownload, FaTrash } from 'react-icons/fa';
import { getToken } from '../../utils/auth';

type MediaFile = {
  id: number;
  name: string;
  url: string;
  file_type: string;
  uploaded_at: string;
};

const Media = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const token = getToken();
        const response = await fetch('http://localhost:8000/api/media/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setMediaFiles(data);
      } catch (err) {
        // Proper error type checking
        const message = err instanceof Error ? err.message : 'Failed to load media files';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/media/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setMediaFiles(mediaFiles.filter(file => file.id !== id));
    } catch (err) {
      // Proper error type checking
      const message = err instanceof Error ? err.message : 'Failed to delete media file';
      setError(message);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Media Library</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mediaFiles.map((file) => (
          <div key={file.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-100 flex justify-center items-center h-48">
              {file.file_type.startsWith('image/') ? (
                <img 
                  src={file.url} 
                  alt={file.name} 
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <FaImage className="text-5xl text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">{file.file_type}</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-800 truncate">{file.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
              </p>
              <div className="flex justify-between mt-3">
                <a
                  href={file.url}
                  download
                  className="text-blue-500 hover:text-blue-700"
                  title="Download"
                  aria-label={`Download ${file.name}`}
                >
                  <FaDownload />
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                  aria-label={`Delete ${file.name}`}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Media;