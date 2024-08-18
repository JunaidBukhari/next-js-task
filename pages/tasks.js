import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import styles from './tasks.module.css';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userCvUrl, setUserCvUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('userId');
    Cookies.remove('cvUrl');
    router.push('/login');
  };

  const handleUploadCSV = () => {
    router.push('/upload-cv');
  };
  useEffect(() => {
    const userId = Cookies.get('userId')
      ? parseInt(Cookies.get('userId'), 10)
      : null;
    const accessToken = Cookies.get('accessToken');

    if (!userId || !accessToken) {
      router.push('/login');
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await fetch(`http://localhost:3000/tasks/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          if (data.statusCode === 401) {
            handleLogout();
          }
          throw new Error('Failed to fetch tasks');
        }

        setTasks(data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserCvUrl = () => {
      const cvUrl = Cookies.get('cvUrl');
      setUserCvUrl(cvUrl || null);
    };

    fetchUserCvUrl();
    fetchTasks();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = Cookies.get('userId')
      ? parseInt(Cookies.get('userId'), 10)
      : null;
    const accessToken = Cookies.get('accessToken');

    if (!userId || !accessToken) {
      console.error('User ID or access token is missing');
      return;
    }

    try {
      const newTask = { title, description, userId };
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Your Tasks</h1>
      <div className={styles.routingButtons}>
        <div>
          {userCvUrl ? (
            <a
              href={userCvUrl}
              target="_blank"
              className={styles.uploadCVButton2}
              rel="noopener noreferrer"
            >
              View CV
            </a>
          ) : null}
          <button onClick={handleUploadCSV} className={styles.uploadCVButton}>
            {userCvUrl ? 'Update' : 'Upload'} CV
          </button>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Task Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="description">Task Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Create Task
            </button>
          </form>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{new Date(task.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
