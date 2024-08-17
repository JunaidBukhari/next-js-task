import { useState } from 'react';
import styles from './upload-cv.module.css';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

export default function UploadCV() {
  const [cv, setCV] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const userId = parseInt(Cookies.get('userId'), 10);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('userId');
    Cookies.remove('cvUrl');
    router.push('/login');
  };
  const handleUpload = async () => {
    if (!userId) {
      handleLogout();
      return;
    }
    if (!cv) {
      setError('Please select a CV file.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', cv);
    formData.append('upload_preset', 'kq6ywrbn');

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/junaidbukhari/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload CV to Cloudinary');
      }

      const data = await response.json();
      const cvUrl = data.secure_url;
      const backendResponse = await fetch(
        `http://localhost:3000/user/${userId}/cv`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cvUrl }),
        }
      );

      if (!backendResponse.ok) {
        throw new Error('Failed to save CV link');
      }
      Cookies.set('cvUrl', cvUrl);
      router.push('/tasks');
      setSuccess('CV uploaded successfully!');
      setCV(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Upload Your CV</h1>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setCV(e.target.files[0])}
        className={styles.fileInput}
      />
      <button
        onClick={handleUpload}
        className={styles.uploadButton}
        disabled={uploading || !cv}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </div>
  );
}
